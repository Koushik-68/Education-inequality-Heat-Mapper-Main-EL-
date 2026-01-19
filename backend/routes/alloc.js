const express = require("express");
const axios = require("axios");

const router = express.Router();

const ML_BASE_URL = "http://127.0.0.1:8000";

// Normalize some common district alias names
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

// Suggest districts: nearest by EII to preferred, and top high-inequality
router.post("/suggest", async (req, res) => {
  try {
    const preferred = canonicalName(req.body?.preferredDistrict || "");
    const resp = await axios.post(`${ML_BASE_URL}/predict-district-wise`);
    const predsRaw = resp.data?.district_predictions || {};
    // Re-key to canonical
    const preds = Object.keys(predsRaw).reduce((acc, k) => {
      acc[canonicalName(k)] = predsRaw[k];
      return acc;
    }, {});

    const entries = Object.entries(preds).map(([name, p]) => ({
      name,
      eii: p?.inequality_index ?? p?.EII ?? 0,
    }));

    // Sort by EII descending for high inequality list
    const topHigh = entries
      .slice()
      .sort((a, b) => b.eii - a.eii)
      .slice(0, 5);

    // Nearest by EII difference to the preferred district
    const preferredEII = entries.find((e) => e.name === preferred)?.eii;
    let nearest = [];
    if (typeof preferredEII === "number") {
      nearest = entries
        .slice()
        .sort(
          (a, b) =>
            Math.abs(a.eii - preferredEII) - Math.abs(b.eii - preferredEII),
        )
        .slice(0, 5);
    }

    res.json({ preferred, preferredEII, nearest, topHigh });
  } catch (error) {
    console.error("/api/alloc/suggest error:", error.message);
    res.status(500).json({ error: "Suggestion generation failed" });
  }
});

module.exports = router;
