const express = require("express");
const axios = require("axios");

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

module.exports = router;
