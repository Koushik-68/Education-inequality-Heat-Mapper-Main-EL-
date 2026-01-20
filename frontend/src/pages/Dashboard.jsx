import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { feature as topoFeature } from "topojson-client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* -------------------------
   Original Config Styles
------------------------- */
const GEOJSON_URL = "/api/karnataka-districts.topojson";
const GOV_NAVY = "#0B3D91";
const BORDER_GREY = "#e6eef8";
const CARD_BG = "rgba(255,255,255,0.96)";

const COLORS = {
  low: "#16a34a",
  medium: "#FF8C00",
  high: "#8B0000",
  default: "#16a34a",
};

const getColor = (val) => {
  if (val >= 0.75) return "#8B0000"; // Critical (Red)
  if (val >= 0.5) return "#FF8C00"; // Poor (Orange)
  if (val >= 0.25) return "#FFD700"; // Moderate (Yellow)
  return "#006400";
};

const getLabel = (val) => {
  if (val >= 0.75) return "Critical";
  if (val >= 0.5) return "Poor";
  if (val >= 0.25) return "Moderate";
  return "Excellent";
};

const NAME_MAP = {
  Bangalore: "Bengaluru Urban",
  "Bangalore Urban": "Bengaluru Urban",
  "Bangalore Rural": "Bengaluru Rural",
  Mysore: "Mysuru",
  Bellary: "Ballari",
  Bijapur: "Vijayapura",
  Gulbarga: "Kalaburagi",
  Shimoga: "Shivamogga",
  Chikmagalur: "Chikkamagaluru",
  "South Kanara": "Dakshina Kannada",
  "North Kanara": "Uttara Kannada",
  Belgaum: "Belagavi",
  Dharwar: "Dharwad",
  Davangere: "Davanagere",
  Tumkur: "Tumakuru",
  Chikballapur: "Chikkaballapur",
  Ramanagaram: "Ramanagara",
};

const canonicalName = (name) => {
  if (!name) return "";
  const trimmed = String(name).trim();
  return NAME_MAP[trimmed] || trimmed;
};

/* -------------------------
   Leaflet Fixes & Helpers
------------------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const FitToGeoJSON = ({ geo }) => {
  const map = useMap();
  useEffect(() => {
    if (!geo) return;
    const layer = L.geoJSON(geo);
    const bounds = layer.getBounds();
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, { animate: false });
    setTimeout(() => {
      map.flyTo(map.getCenter(), map.getZoom() + 0.35, { animate: false });
    }, 150);
  }, [geo, map]);
  return null;
};

const FocusOnDistrict = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.flyToBounds(bounds, {
      padding: [30, 30],
      maxZoom: 9,
      animate: true,
      duration: 0.8,
    });
  }, [bounds, map]);
  return null;
};

export default function Dashboard() {
  const [geo, setGeo] = useState(null);
  const [districtData, setDistrictData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districtBounds, setDistrictBounds] = useState(null);
  const [generating, setGenerating] = useState(false);

  const mapRef = useRef(null);
  const mapShotRef = useRef(null);
  const INITIAL_CENTER = [15.3173, 75.7139];
  const INITIAL_ZOOM = 6;

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        const [gRes] = await Promise.all([axios.get(GEOJSON_URL)]);
        if (cancelled) return;
        const topo = gRes.data;
        const objectKey = Object.keys(topo.objects)[0];
        const geoJson = topoFeature(topo, topo.objects[objectKey]);
        setGeo(geoJson);

        // Try temporary override first
        try {
          const statusRes = await axios.get("/api/upload/temp-data/status");
          if (statusRes.data?.active) {
            const dataRes = await axios.get("/api/data");
            const districtsMap = dataRes.data?.districts || {};
            const entries = Object.entries(districtsMap);
            const computed = {};
            for (const [rawName, f] of entries) {
              const name = canonicalName(rawName);
              const payload = {
                population_lakhs: Number(f.population_lakhs ?? 0),
                literacy_rate: Number(f.literacy_rate ?? 0),
                pupil_teacher_ratio: Number(f.pupil_teacher_ratio ?? 0),
                teacher_difference: Number(f.teacher_difference ?? 0),
              };
              try {
                const pr = await axios.post(
                  "/api/ml/predict-district",
                  payload,
                );
                const eii = pr.data?.inequality_index ?? pr.data?.EII ?? 0;
                computed[name] = { inequality_index: eii, features: payload };
              } catch {
                computed[name] = { inequality_index: 0, features: payload };
              }
            }
            setDistrictData(computed);
            return;
          }
        } catch {}

        // Fallback to ML baseline
        const mlRes = await axios.post("/api/ml/predict-district-wise");
        const predsRaw = mlRes.data?.district_predictions || {};
        const preds = Object.keys(predsRaw).reduce((acc, k) => {
          const key = canonicalName(k);
          acc[key] = predsRaw[k];
          return acc;
        }, {});
        setDistrictData(preds);
      } catch (err) {
        console.error(err);
        setError("Failed to load map data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    return () => (cancelled = true);
  }, []);

  const handleResetView = () => {
    setDistrictBounds(null);
    if (mapRef.current) {
      mapRef.current.closePopup();
      mapRef.current.flyTo(INITIAL_CENTER, INITIAL_ZOOM, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  const districtStyle = (feature) => {
    const name = feature?.properties?.district;
    const key = canonicalName(name);
    const eii = districtData[key]?.inequality_index ?? districtData[key]?.EII;
    return {
      fillColor: typeof eii === "number" ? getColor(eii) : COLORS.default,
      color: "#333",
      weight: 1,
      fillOpacity: 0.85,
    };
  };

  async function buildReportRows() {
    // Determine source of features
    let overrideActive = false;
    try {
      const statusRes = await axios.get("/api/upload/temp-data/status");
      overrideActive = !!statusRes.data?.active;
    } catch {}

    const rows = [];
    if (overrideActive) {
      try {
        const dataRes = await axios.get("/api/data");
        const districtsMap = dataRes.data?.districts || {};
        for (const [rawName, f] of Object.entries(districtsMap)) {
          const name = canonicalName(rawName);
          const eiiObj = districtData[name] || {};
          let eii = eiiObj.inequality_index ?? eiiObj.EII;
          // If not in districtData yet, compute
          if (typeof eii !== "number") {
            try {
              const pr = await axios.post("/api/ml/predict-district", {
                population_lakhs: Number(f.population_lakhs ?? 0),
                literacy_rate: Number(f.literacy_rate ?? 0),
                pupil_teacher_ratio: Number(f.pupil_teacher_ratio ?? 0),
                teacher_difference: Number(f.teacher_difference ?? 0),
              });
              eii = pr.data?.inequality_index ?? pr.data?.EII ?? 0;
            } catch {
              eii = 0;
            }
          }
          rows.push({
            name,
            population: Number(f.population_lakhs ?? 0),
            literacy: Number(f.literacy_rate ?? 0),
            ptr: Number(f.pupil_teacher_ratio ?? 0),
            gap: Number(f.teacher_difference ?? 0),
            status: getLabel(Number(eii) || 0),
            eii: Number(eii) || 0,
          });
        }
      } catch {}
    } else {
      // Fallback: use ML baseline features if available
      let featuresMap = {};
      try {
        const featRes = await axios.get("/api/ml/district-features");
        featuresMap = featRes.data || {};
      } catch {}
      // Extract list from geo
      const features = geo?.features || [];
      for (const f of features) {
        const rawName = f.properties?.district || f.properties?.name;
        const name = canonicalName(rawName);
        const eiiObj = districtData[name] || {};
        const eii = eiiObj.inequality_index ?? eiiObj.EII ?? 0;
        const feat = featuresMap[name] || {};
        rows.push({
          name,
          population: Number(feat.population_lakhs ?? 0),
          literacy: Number(feat.literacy_rate ?? 0),
          ptr: Number(feat.pupil_teacher_ratio ?? 0),
          gap: Number(feat.teacher_difference ?? 0),
          status: getLabel(Number(eii) || 0),
          eii: Number(eii) || 0,
        });
      }
    }
    // Sort by status severity (Critical → Poor → Moderate → Excellent)
    const order = { Critical: 3, Poor: 2, Moderate: 1, Excellent: 0 };
    rows.sort((a, b) => (order[b.status] ?? 0) - (order[a.status] ?? 0));
    return rows;
  }

  async function downloadReport() {
    if (generating) return;
    setGenerating(true);
    try {
      // Capture current map
      const node = mapShotRef.current;
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });

      const rows = await buildReportRows();
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const margin = 12;

      // Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Karnataka Educational Inequality Report", margin, 18);

      // Map image
      const imgData = canvas.toDataURL("image/png");
      const imgW = pageW - margin * 2;
      const imgH = (canvas.height / canvas.width) * imgW;
      pdf.addImage(imgData, "PNG", margin, 22, imgW, imgH);

      // Table header
      let y = 22 + imgH + 8;
      pdf.setFontSize(11);
      pdf.setTextColor(20);
      const cols = [
        { key: "name", label: "District", w: 46 },
        { key: "population", label: "Population (L)", w: 36 },
        { key: "literacy", label: "Literacy (%)", w: 30 },
        { key: "ptr", label: "PTR", w: 22 },
        { key: "gap", label: "Gap", w: 20 },
        { key: "status", label: "Status", w: 32 },
      ];
      let x = margin;
      pdf.setFont("helvetica", "bold");
      for (const c of cols) {
        pdf.text(c.label, x, y);
        x += c.w;
      }
      y += 6;
      pdf.setFont("helvetica", "normal");

      // Rows
      for (const r of rows) {
        x = margin;
        const vals = [
          r.name,
          Number.isFinite(r.population) ? r.population.toFixed(1) : "-",
          Number.isFinite(r.literacy) ? r.literacy.toFixed(1) : "-",
          Number.isFinite(r.ptr) ? r.ptr.toFixed(1) : "-",
          Number.isFinite(r.gap) ? r.gap.toFixed(0) : "-",
          r.status,
        ];
        for (let i = 0; i < cols.length; i++) {
          pdf.text(String(vals[i]), x, y);
          x += cols[i].w;
        }
        y += 6;
        if (y > 282) {
          pdf.addPage();
          y = margin + 6;
          x = margin;
          pdf.setFont("helvetica", "bold");
          for (const c of cols) {
            pdf.text(c.label, x, y);
            x += c.w;
          }
          y += 6;
          pdf.setFont("helvetica", "normal");
        }
      }

      pdf.save("EduMap_Dashboard_Report.pdf");
    } catch (e) {
      console.error("Failed to generate report", e);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
           {" "}
      {/* Main container adjusted to fit inside Layout's <main> scroll area */} 
         {" "}
      <div
        style={{
          display: "flex",
          gap: 22,
          padding: 22,
          height: "calc(100vh - 120px)",
        }}
      >
                        {/* MAP - Retaining original visual style */}       {" "}
        <div
          ref={mapShotRef}
          style={{
            flex: 2,
            borderRadius: 10,
            overflow: "hidden",
            border: `1px solid ${BORDER_GREY}`,
            background: "#fff",
          }}
        >
                   {" "}
          <MapContainer
            center={INITIAL_CENTER}
            zoom={INITIAL_ZOOM}
            style={{ width: "100%", height: "100%" }}
            scrollWheelZoom
            ref={mapRef}
          >
                       {" "}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
                        {geo && <FitToGeoJSON geo={geo} />}
                        <FocusOnDistrict bounds={districtBounds} />           {" "}
            {geo && (
              <GeoJSON
                data={geo}
                style={districtStyle}
                onEachFeature={(feature, layer) => {
                  const name = feature.properties?.district;
                  const key = canonicalName(name);
                  const eii =
                    districtData[key]?.inequality_index ??
                    districtData[key]?.EII;
                  const popupText =
                    typeof eii === "number"
                      ? `<b>${name}</b><br/>EII: ${eii.toFixed(3)}<br/>Status: ${getLabel(eii)}`
                      : `<b>${name}</b><br/>No data available`;

                  layer.bindPopup(popupText);
                  layer.on({
                    click: () => setDistrictBounds(layer.getBounds()),
                  });
                }}
              />
            )}
                     {" "}
          </MapContainer>
                 {" "}
        </div>
                {/* SIDE PANEL - Original Legend & Buttons */}       {" "}
        <div
          style={{
            width: 340,
            background: CARD_BG,
            borderRadius: 10,
            padding: 16,
            border: `1px solid ${BORDER_GREY}`,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
                   {" "}
          <div
            style={{
              fontWeight: 800,
              color: GOV_NAVY,
              marginBottom: 15,
              fontSize: "16px",
            }}
          >
                        Heatmap Legend          {" "}
          </div>
                   {" "}
          {[
            { c: "#006400", t: "Excellent (≥ 0.75)" },
            { c: "#FFD700", t: "Moderate (≥ 0.50)" },
            { c: "#FF8C00", t: "Poor (≥ 0.25)" },
            { c: "#8B0000", t: "Critical (< 0.25)" },
          ].map((l, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 10,
              }}
            >
                           {" "}
              <div
                style={{
                  width: 24,
                  height: 14,
                  background: l.c,
                  borderRadius: 3,
                }}
              />
                           {" "}
              <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                {l.t}
              </div>
                         {" "}
            </div>
          ))}
                    <div style={{ flexGrow: 1 }} />         {" "}
          <button
            onClick={downloadReport}
            style={{
              width: "100%",
              padding: 12,
              background: GOV_NAVY,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 800,
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
                        Download Report          {" "}
          </button>
                   {" "}
          <button
            onClick={handleResetView}
            style={{
              width: "100%",
              padding: 12,
              background: "#fff",
              color: GOV_NAVY,
              border: `2px solid ${GOV_NAVY}`,
              borderRadius: 8,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
                        Reset View          {" "}
          </button>
                 {" "}
        </div>
             {" "}
      </div>
            {/* Fixed bottom status indicators */}     {" "}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          gap: 10,
        }}
      >
               {" "}
        {loading && (
          <div
            style={{
              background: "#f1f5f9",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 11,
              border: "1px solid #e2e8f0",
            }}
          >
                        Fetching Live Data...          {" "}
          </div>
        )}
               {" "}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 11,
              border: "1px solid #fee2e2",
            }}
          >
                        {error}         {" "}
          </div>
        )}
             {" "}
      </div>
         {" "}
    </>
  );
}
