import React, { useState } from "react";
import { getDistrictTypology } from "./services/mlService";

const COLORS = {
  primary: "#6366F1",
  bg: "#0A0F1E",
  card: "rgba(255,255,255,0.08)",
  text: "#F8FAFC",
  muted: "#94A3B8",
  border: "rgba(255,255,255,0.18)",
  green: "#16a34a",
  red: "#ef4444",
  blue: "#3b82f6",
  gray: "#6B7280",
};

const colorMap = {
  green: COLORS.green,
  red: COLORS.red,
  blue: COLORS.blue,
  gray: COLORS.gray,
};

export default function DistrictTypology() {
  const [inputs, setInputs] = useState({
    literacy_rate: 75,
    pupil_teacher_ratio: 30,
    teacher_difference: 0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const runClassification = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await getDistrictTypology(inputs);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError("Service unavailable. Could not classify the district.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        padding: 48,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
          width: "100%",
          maxWidth: 520,
        }}
      >
        <h2
          style={{
            color: COLORS.primary,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          District Inequality Typology
        </h2>

        <p
          style={{
            color: COLORS.muted,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Classify a district using literacy, PTR, and teacher availability.
        </p>

        {/* SLIDERS */}
        <div style={{ display: "grid", gap: 20 }}>
          {[
            ["literacy_rate", "Literacy Rate (%)", 0, 100, 0.1],
            ["pupil_teacher_ratio", "Pupil–Teacher Ratio", 10, 80, 0.5],
            ["teacher_difference", "Teacher Difference", -50, 50, 1],
          ].map(([key, label, min, max, step]) => (
            <div key={key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label style={{ color: COLORS.muted }}>{label}</label>
                <span style={{ color: COLORS.text, fontWeight: 600 }}>
                  {inputs[key]}
                </span>
              </div>
              <input
                type="range"
                name={key}
                min={min}
                max={max}
                step={step}
                value={inputs[key]}
                onChange={handleSliderChange}
                style={{ width: "100%" }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={runClassification}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "12px",
            background: COLORS.primary,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Classifying..." : "Classify District"}
        </button>

        {error && (
          <div
            style={{ marginTop: 16, color: COLORS.red, textAlign: "center" }}
          >
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <h3 style={{ color: COLORS.muted }}>Classification Result</h3>

            <div
              style={{
                marginTop: 12,
                padding: "16px",
                borderRadius: 12,
                backgroundColor: colorMap[result.color],
                color: COLORS.text,
                fontSize: 22,
                fontWeight: "bold",
              }}
            >
              {result.label}
            </div>

            <div style={{ marginTop: 8, color: COLORS.muted, fontSize: 12 }}>
              Cluster ID: {result.cluster_id}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
