const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const axios = require("axios");
const { feature: topoFeature } = require("topojson-client");
const { parse: parseCsv } = require("csv-parse/sync");
const mlRouter = require("./routes/ml");
const allocRouter = require("./routes/alloc");

require("dotenv").config({ path: path.resolve(__dirname, "./config.env") });

const connectDatabase = require("./db");
const State = require("./models/State");
const predictRouter = require("./routes/mlProxy");

/* -------------------------
   App Init
------------------------- */
const app = express();
const port = process.env.PORT || 5000;

// Temporary data override store (e.g., from CSV upload)
let TEMP_DATA_OVERRIDE = null; // { type: 'csv', rows: [...], createdAt }

/* -------------------------
   DB Connect
------------------------- */
connectDatabase();

/* -------------------------
   Middleware
------------------------- */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------------
   Static Files (Frontend Assets)
------------------------- */
const FRONTEND_ROOT = path.resolve(__dirname, "../frontend/public");

app.use("/api", express.static(path.join(FRONTEND_ROOT, "api"))); // topojson
app.use("/data", express.static(path.join(FRONTEND_ROOT, "data")));
// app.use("/api/ml", predictRouter);
app.use("/api/ml", mlRouter);
app.use("/api/alloc", allocRouter);

// data.json

/* -------------------------
   ML ROUTER (FIXED)
------------------------- */
const ML_API_URL = "http://localhost:8000/predict";

app.post("/api/ml/predict-district", async (req, res) => {
  try {
    console.log("[ML Proxy] Forwarding payload:", req.body);
    const response = await axios.post(ML_API_URL, req.body, {
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
    const data = response.data || {};
    // Attach proxy-forwarded payload for debugging
    data.debug = {
      ...(data.debug || {}),
      proxy_forwarded: req.body,
    };
    res.json(data);
  } catch (error) {
    const detail = error?.response?.data || error?.message || "Unknown error";
    console.error("[ML Proxy] Error:", detail);
    res.status(500).json({ error: "ML prediction failed", detail });
  }
});

/* -------------------------
   Health Check
------------------------- */
app.get("/", (req, res) => {
  res.send("EduMap Backend OK");
});

/* -------------------------
   File Upload Handling
------------------------- */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const { fileType, localPath } = req.body || {};

  try {
    let buffer = null;
    let originalName = null;

    if (req.file) {
      buffer = req.file.buffer;
      originalName = req.file.originalname;
    } else if (localPath) {
      if (!fs.existsSync(localPath)) {
        return res.status(400).json({ error: "Local path not found" });
      }
      buffer = fs.readFileSync(localPath);
      originalName = path.basename(localPath);
    } else {
      return res.status(400).json({ error: "No file or localPath provided" });
    }

    const text = buffer.toString("utf-8");

    /* CSV Upload (Temporary Override) */
    if (fileType === "csv") {
      const rows = parseCsv(text, { columns: true, skip_empty_lines: true });
      TEMP_DATA_OVERRIDE = { type: "csv", rows, createdAt: Date.now() };
      return res.json({ ok: true, rows: rows.length, temporaryOverride: true });
    }

    /* GeoJSON Upload */
    if (fileType === "geojson") {
      const uploadsDir = path.resolve(__dirname, "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

      const outPath = path.join(uploadsDir, originalName.replace(/\s+/g, "_"));

      fs.writeFileSync(outPath, buffer);
      return res.json({ ok: true, saved: outPath });
    }

    /* TopoJSON Upload → GeoJSON */
    if (fileType === "topojson") {
      const obj = JSON.parse(text);
      const objectKey = Object.keys(obj.objects || {})[0];
      const geoJson = topoFeature(obj, obj.objects[objectKey]);

      const uploadsDir = path.resolve(__dirname, "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

      const outPath = path.join(
        uploadsDir,
        originalName.replace(/\.topojson$/i, "") + ".geojson",
      );

      fs.writeFileSync(outPath, JSON.stringify(geoJson));
      return res.json({ ok: true, converted: outPath });
    }

    /* Default Save */
    const uploadsDir = path.resolve(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const outPath = path.join(uploadsDir, originalName || "upload.bin");
    fs.writeFileSync(outPath, buffer);

    return res.json({ ok: true, saved: outPath });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload processing failed" });
  }
});

/* -------------------------
   Aggregated Data API
------------------------- */
app.get("/api/data", async (req, res) => {
  try {
    // If there's a temporary override (e.g., uploaded CSV), serve it first
    if (TEMP_DATA_OVERRIDE && TEMP_DATA_OVERRIDE.type === "csv") {
      const rows = TEMP_DATA_OVERRIDE.rows || [];
      const districts = rows.reduce((acc, r) => {
        const key = (r.district_name || r.district || r.name || "").toString();
        if (!key) return acc;
        acc[key] = {
          population_lakhs: Number(r.population_lakhs ?? r.population ?? 0),
          literacy_rate: Number(r.literacy_rate ?? 0),
          pupil_teacher_ratio: Number(r.pupil_teacher_ratio ?? 0),
          teacher_difference: Number(r.teacher_difference ?? 0),
        };
        return acc;
      }, {});
      return res.json({ states: {}, districts });
    }

    const states = await State.find({}).lean();

    if (states.length) {
      return res.json({
        states: states.reduce((acc, s) => {
          acc[s.code || s.name] = {
            name: s.name,
            score: s.score,
          };
          return acc;
        }, {}),
        districts: {},
      });
    }

    const staticPath = path.join(FRONTEND_ROOT, "data", "data.json");
    if (fs.existsSync(staticPath)) {
      return res.json(JSON.parse(fs.readFileSync(staticPath, "utf-8")));
    }

    res.json({ states: {}, districts: {} });
  } catch (err) {
    console.error("/api/data error:", err);
    res.status(500).json({ error: "Failed to load data" });
  }
});

/* -------------------------
   Temporary Override Controls
------------------------- */
app.get("/api/upload/temp-data/status", (req, res) => {
  if (!TEMP_DATA_OVERRIDE) return res.json({ active: false });
  res.json({
    active: true,
    type: TEMP_DATA_OVERRIDE.type,
    rows: TEMP_DATA_OVERRIDE.rows?.length || 0,
    createdAt: TEMP_DATA_OVERRIDE.createdAt,
  });
});

app.delete("/api/upload/temp-data", (req, res) => {
  TEMP_DATA_OVERRIDE = null;
  res.json({ ok: true, cleared: true });
});

/* -------------------------
   Start Server
------------------------- */
app.listen(port, () => {
  console.log(`EduMap backend listening on port ${port}`);
});

/* -------------------------
   Graceful Shutdown
------------------------- */
process.on("SIGINT", () => {
  console.log("Shutting down backend...");
  process.exit(0);
});
