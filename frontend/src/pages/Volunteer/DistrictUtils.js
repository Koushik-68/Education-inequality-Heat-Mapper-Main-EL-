import { useEffect, useMemo, useState } from "react";
import { feature as topoFeature } from "topojson-client";

const GEOJSON_URL = "/api/karnataka-districts.topojson";
const DATA_URL = "/data/data.json";

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

function canonicalName(name) {
  if (!name) return "";
  const trimmed = String(name).trim();
  return NAME_MAP[trimmed] || trimmed;
}

function getCentroidFromCoords(coords) {
  // coords can be MultiPolygon or Polygon: [[[lng,lat],...], ...]
  const flatten = [];
  function pushRing(ring) {
    for (const [lng, lat] of ring) {
      flatten.push([lat, lng]);
    }
  }
  if (!coords) return null;
  if (Array.isArray(coords[0][0][0])) {
    // MultiPolygon
    for (const poly of coords) {
      if (Array.isArray(poly[0])) pushRing(poly[0]);
    }
  } else {
    // Polygon
    pushRing(coords[0]);
  }
  if (!flatten.length) return null;
  const sum = flatten.reduce(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0],
  );
  return [sum[0] / flatten.length, sum[1] / flatten.length];
}

function haversine([lat1, lon1], [lat2, lon2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useDistrictData() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const [geoRes, dataRes] = await Promise.all([
          fetch(GEOJSON_URL),
          fetch(DATA_URL),
        ]);
        const topo = await geoRes.json();
        const data = await dataRes.json();

        // Convert TopoJSON (objects.districts) to GeoJSON features
        let features = [];
        if (topo?.type === "Topology" && topo?.objects?.districts) {
          const fc = topoFeature(topo, topo.objects.districts);
          features = fc.features || [];
        } else if (topo?.type === "FeatureCollection") {
          features = topo.features || [];
        }

        const list = features
          .map((f, idx) => {
            const rawName =
              f.properties?.district ||
              f.properties?.DISTRICT ||
              f.properties?.name;
            const name = canonicalName(rawName);
            const centroid = getCentroidFromCoords(f.geometry?.coordinates);
            const scoreObj = data?.[name] || {};
            const eii = scoreObj.inequality_index ?? scoreObj.EII ?? null;
            return { id: idx, name, centroid, eii };
          })
          .filter((d) => d.name);

        if (!cancelled) setDistricts(list);
      } catch (e) {
        if (!cancelled) setError("Failed to load district data");
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const names = useMemo(() => districts.map((d) => d.name).sort(), [districts]);

  function nearestHighInequality(myDistrict, count = 3) {
    const base = districts.find((d) => d.name === canonicalName(myDistrict));
    if (!base || !base.centroid) return [];
    const sorted = districts
      .filter((d) => d.name !== base.name && d.centroid)
      .map((d) => ({
        name: d.name,
        eii: d.eii ?? 0,
        distance: haversine(base.centroid, d.centroid),
      }))
      .sort((a, b) => a.distance - b.distance);
    // Take nearest 8 by distance, then pick top by EII
    const nearest8 = sorted.slice(0, 8);
    return nearest8.sort((a, b) => (b.eii || 0) - (a.eii || 0)).slice(0, count);
  }

  return { districts, names, nearestHighInequality, loading, error };
}
