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

  function nearestHighInequality(myDistrict, count = 3, opts = {}) {
    const base = districts.find((d) => d.name === canonicalName(myDistrict));
    if (!base || !base.centroid) return [];
    const sorted = districts
      .filter((d) => d.name !== base.name && d.centroid)
      .map((d) => ({
        name: d.name,
        eii: d.eii ?? 0,
        distance: haversine(base.centroid, d.centroid),
      }));

    // Normalize EII and distance for scoring
    const eiiVals = sorted.map((s) => s.eii || 0);
    const eiiMin = Math.min(...eiiVals, 0);
    const eiiMax = Math.max(...eiiVals, 1);
    const distVals = sorted.map((s) => s.distance || 0);
    const distMin = Math.min(...distVals, 0);
    const distMax = Math.max(...distVals, 1);

    const subject = String(opts.subject || "").toLowerCase();
    const mode = String(opts.mode || "").toLowerCase(); // offline|online|hybrid
    const availability = String(opts.availability || "").toLowerCase();

    function subjectWeight(name) {
      // Lightweight heuristic: align subject to historically flagged districts
      if (subject.includes("math") || subject.includes("science")) {
        return name === "Kalaburagi" ? 1 : 0.7;
      }
      if (subject.includes("english") || subject.includes("language")) {
        return name === "Bidar" ? 1 : 0.7;
      }
      if (subject.includes("computer") || subject.includes("coding")) {
        return name === "Ballari" ? 1 : 0.7;
      }
      return 0.5; // neutral
    }

    function availabilityWeight() {
      if (!availability) return 0.5;
      if (availability.includes("weekend") || availability.includes("evening"))
        return 0.6;
      if (availability.includes("hour")) return 0.5;
      return 0.5;
    }

    function distanceWeight(distKm) {
      // Prefer closer for offline; allow farther for online
      const norm = (distKm - distMin) / Math.max(1e-6, distMax - distMin);
      const inv = 1 - norm; // closer -> higher
      if (mode === "online") return 0.5 + inv * 0.2; // distance less critical
      if (mode === "hybrid") return 0.6 + inv * 0.25;
      return 0.7 + inv * 0.3; // offline prefers closer
    }

    const scored = sorted.map((s) => {
      const eiiNorm = (s.eii - eiiMin) / Math.max(1e-6, eiiMax - eiiMin);
      const subjW = subjectWeight(s.name);
      const availW = availabilityWeight();
      const distW = distanceWeight(s.distance);
      // Composite score: weight EII heavily, then subject, then distance
      const score = eiiNorm * 0.6 + subjW * 0.2 + distW * 0.15 + availW * 0.05;
      return { ...s, score };
    });

    return scored
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, count);
  }

  return { districts, names, nearestHighInequality, loading, error };
}
