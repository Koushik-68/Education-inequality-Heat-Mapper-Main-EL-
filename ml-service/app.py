from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn
import os
import json
from typing import Dict
import numpy as np

# =========================
# OPTIONAL SHAP
# =========================
try:
    import shap  # type: ignore
    HAS_SHAP = True
except Exception:
    HAS_SHAP = False

app = FastAPI(title="EduMap ML Service")

# =========================
# PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "education_inequality_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "feature_scaler.pkl")
DISTRICT_DATA_PATH = os.path.join(BASE_DIR, "district_features.json")

CLUSTER_MODEL_PATH = os.path.join(BASE_DIR, "district_kmeans_model.pkl")
CLUSTER_SCALER_PATH = os.path.join(BASE_DIR, "district_cluster_scaler.pkl")
CLUSTER_LABELS_PATH = os.path.join(BASE_DIR, "cluster_labels.pkl")

# =========================
# LOAD MODELS
# =========================
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

cluster_model = joblib.load(CLUSTER_MODEL_PATH)
cluster_scaler = joblib.load(CLUSTER_SCALER_PATH)
cluster_labels = joblib.load(CLUSTER_LABELS_PATH)

print("✅ All models loaded successfully")

# =========================
# FEATURE LIST
# =========================
FEATURES = [
    "population_lakhs",
    "literacy_rate",
    "pupil_teacher_ratio",
    "teacher_difference",
]

# =========================
# SCHEMAS
# =========================
class PredictRequest(BaseModel):
    population_lakhs: float
    literacy_rate: float
    pupil_teacher_ratio: float
    teacher_difference: float


class DistrictTypologyRequest(BaseModel):
    literacy_rate: float
    pupil_teacher_ratio: float
    teacher_difference: float

# =========================
# SHAP EXPLAINER
# =========================
explainer = None

if HAS_SHAP:
    try:
        if os.path.exists(DISTRICT_DATA_PATH):
            with open(DISTRICT_DATA_PATH, "r") as f:
                district_data: Dict[str, Dict[str, float]] = json.load(f)
            df_bg = pd.DataFrame(district_data).T
            df_bg = df_bg[FEATURES]
            X_bg = df_bg.values
        else:
            X_bg = np.zeros((1, len(FEATURES)))

        def predict_fn(X_np):
            df = pd.DataFrame(X_np, columns=FEATURES)
            X_scaled = scaler.transform(df)
            return model.predict(X_scaled)

        explainer = shap.Explainer(predict_fn, X_bg)
        print("✅ SHAP explainer initialized")

    except Exception as e:
        explainer = None
        print(f"⚠️ SHAP failed: {e}")

# =========================
# ROUTES
# =========================

@app.get("/")
def health():
    return {"status": "ML service running"}

# -------------------------
# EII PREDICTION
# -------------------------
@app.post("/predict")
def predict(data: PredictRequest):
    df = pd.DataFrame([[getattr(data, f) for f in FEATURES]], columns=FEATURES)
    df_scaled = scaler.transform(df)
    prediction = model.predict(df_scaled)[0]

    return {
        "EII": round(float(prediction), 4),
        "input_used": data.dict()
    }

# -------------------------
# DISTRICT-WISE EII
# -------------------------
@app.post("/predict-district-wise")
def predict_district_wise():
    if not os.path.exists(DISTRICT_DATA_PATH):
        return {"error": "district_features.json not found"}

    with open(DISTRICT_DATA_PATH, "r") as f:
        district_data: Dict[str, Dict[str, float]] = json.load(f)

    results = {}

    for district, features in district_data.items():
        df = pd.DataFrame([[features[f] for f in FEATURES]], columns=FEATURES)
        df_scaled = scaler.transform(df)
        prediction = model.predict(df_scaled)[0]

        results[district] = {
            "EII": round(float(prediction), 4),
            "features": features
        }

    return {
        "state": "Karnataka",
        "district_predictions": results
    }

# -------------------------
# SHAP EXPLANATION
# -------------------------
@app.post("/explain")
def explain(data: PredictRequest):
    if not HAS_SHAP or explainer is None:
        return {"error": "SHAP not available"}

    df = pd.DataFrame([[getattr(data, f) for f in FEATURES]], columns=FEATURES)
    shap_values = explainer(df.values)

    values = shap_values.values[0].tolist()
    base = float(shap_values.base_values[0])

    return {
        "prediction": round(float(model.predict(scaler.transform(df))[0]), 4),
        "base_value": round(base, 4),
        "contributions": {
            FEATURES[i]: round(values[i], 4) for i in range(len(FEATURES))
        }
    }

# =========================
# DISTRICT TYPOLOGY (KMEANS)
# =========================
@app.post("/feature/district-typology")
def district_typology(data: DistrictTypologyRequest):

    X = np.array([[
        data.literacy_rate,
        data.pupil_teacher_ratio,
        data.teacher_difference
    ]])

    X_scaled = cluster_scaler.transform(X)
    cluster_id = int(cluster_model.predict(X_scaled)[0])

    raw_label = cluster_labels[cluster_id]

    label_map = {
        "Low Inequality": "Low Inequality / Advantaged",
        "Transitional": "Transitional / Structural",
        "High Inequality": "High Inequality / Stressed",
    }

    label = label_map.get(raw_label, raw_label)

    color_map = {
        "Low Inequality / Advantaged": "green",
        "Transitional / Structural": "red",
        "High Inequality / Stressed": "blue",
    }

    return {
        "feature": "District Typology",
        "cluster_id": cluster_id,
        "label": label,
        "color": color_map[label],
        "input_used": data.dict()
    }


# =========================
# RUN
# =========================
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
