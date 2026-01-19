const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const ML_BASE_URL = "http://127.0.0.1:8000";

// -------------------------
// HEALTH CHECK
// -------------------------
router.get("/health", async (req, res) => {
  res.json({ status: "Node ML proxy running" });
});

// -------------------------
// EII PREDICTION
// -------------------------
router.post("/predict", async (req, res) => {
  try {
    const response = await axios.post(`${ML_BASE_URL}/predict`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "ML service unavailable" });
  }
});

// -------------------------
// DISTRICT-WISE EII
// -------------------------
router.post("/predict-district-wise", async (req, res) => {
  try {
    const response = await axios.post(`${ML_BASE_URL}/predict-district-wise`);
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "ML service unavailable" });
  }
});

// -------------------------
// SHAP EXPLANATION
// -------------------------
router.post("/explain", async (req, res) => {
  try {
    const response = await axios.post(`${ML_BASE_URL}/explain`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "ML service unavailable" });
  }
});

// -------------------------
// DISTRICT TYPOLOGY FEATURE
// -------------------------
router.post("/district-typology", async (req, res) => {
  try {
    const response = await axios.post(
      `${ML_BASE_URL}/feature/district-typology`,
      req.body,
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "District typology failed" });
  }
});

// -------------------------
// Serve district features from local JSON
// -------------------------
router.get("/district-features", async (req, res) => {
  try {
    const featuresPath = path.resolve(
      __dirname,
      "../../ml-service/district_features.json",
    );
    if (!fs.existsSync(featuresPath)) {
      return res
        .status(404)
        .json({ error: "district_features.json not found" });
    }
    const text = fs.readFileSync(featuresPath, "utf-8");
    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error("/district-features error:", error.message);
    res.status(500).json({ error: "Failed to read district features" });
  }
});

module.exports = router;
