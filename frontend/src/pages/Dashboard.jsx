import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { feature as topoFeature } from "topojson-client";

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
  default: "#f8fafc",
};

const getColor = (val) => {
  if (val >= 0.75) return "#006400";
  if (val >= 0.5) return "#FFD700";
  if (val >= 0.25) return "#FF8C00";
  return "#8B0000";
};

const getLabel = (val) => {
  if (val >= 0.75) return "Excellent";
  if (val >= 0.5) return "Moderate";
  if (val >= 0.25) return "Poor";
  return "Critical";
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

  const mapRef = useRef(null);
  const INITIAL_CENTER = [15.3173, 75.7139];
  const INITIAL_ZOOM = 6;

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        const [gRes, mlRes] = await Promise.all([
          axios.get(GEOJSON_URL),
          axios.post("/api/ml/predict-district-wise"),
        ]);
        if (cancelled) return;
        const topo = gRes.data;
        const objectKey = Object.keys(topo.objects)[0];
        const geoJson = topoFeature(topo, topo.objects[objectKey]);
        setGeo(geoJson);
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
