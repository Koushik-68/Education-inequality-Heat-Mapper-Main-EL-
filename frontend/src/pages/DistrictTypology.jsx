import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getDistrictTypology } from "./services/mlService";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BookOpen,
  Users,
  Activity,
  Download,
  ShieldCheck,
  Info,
  ChevronRight,
  Layout,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ---------------- COLORS & THEME ---------------- */
const COLORS = {
  primary: "#6366F1", // Indigo
  primaryHover: "#4F46E5",
  bg: "#030712", // Deeper Slate/Black
  card: "rgba(17, 24, 39, 0.7)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  text: "#F9FAFB",
  muted: "#9CA3AF",
  accent: "#10B981", // Emerald
  green: "#10B981",
  red: "#EF4444",
  blue: "#3B82F6",
  gray: "#6B7280",
};

const colorMap = {
  green: COLORS.green,
  red: COLORS.red,
  blue: COLORS.blue,
  gray: COLORS.gray,
};

const POLICY = {
  "Low Inequality / Advantaged": [
    "Maintain low PTR through consistent teacher recruitment",
    "Invest in digital learning and skill development",
    "Share best practices with neighboring districts",
  ],
  "Transitional / Structural": [
    "Reduce PTR below 30 through targeted hiring",
    "Improve teacher deployment balance",
    "Strengthen adult literacy programs",
  ],
  "High Inequality / Stressed": [
    "Urgent teacher recruitment required",
    "Focus on foundational literacy",
    "Increase school infrastructure funding",
  ],
};

/* ---------------- CUSTOM COMPONENTS ---------------- */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const p = payload[0]?.payload || {};
    const name = p.name || "Your Scenario";
    const ptr = p.x;
    const lit = p.y;
    const gap = p.gap;
    return (
      <div
        style={{
          background: "#1F2937",
          border: `1px solid ${COLORS.cardBorder}`,
          padding: "10px 14px",
          borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          minWidth: 180,
        }}
      >
        <p style={{ margin: 0, color: COLORS.muted, fontSize: 12 }}>
          District: {name}
        </p>
        <p style={{ margin: 0, color: "#FFF", fontWeight: "bold" }}>
          PTR: {ptr}
        </p>
        <p style={{ margin: 0, color: "#FFF", fontWeight: "bold" }}>
          Literacy: {lit}%
        </p>
        <p style={{ margin: 0, color: "#FFF", fontWeight: "bold" }}>
          Gap: {gap}
        </p>
      </div>
    );
  }
  return null;
};

export default function DistrictTypology() {
  const reportRef = useRef();
  const [inputs, setInputs] = useState({
    literacy_rate: 75,
    pupil_teacher_ratio: 30,
    teacher_difference: 0,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState([]); // constant district points
  const [clusters, setClusters] = useState([]); // cluster assignments

  // Simple k-means clustering on (PTR, Literacy, Gap)
  const kmeans = (data, k = 3, maxIter = 50) => {
    if (!data.length) return [];
    // Initialize centroids with first k points
    let centroids = data.slice(0, k).map((p) => [p.x, p.y, p.gap]);
    let assignments = new Array(data.length).fill(0);

    const dist = (a, b) => {
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const dz = a[2] - b[2];
      return dx * dx + dy * dy + dz * dz;
    };

    for (let iter = 0; iter < maxIter; iter++) {
      // Assign
      let changed = false;
      for (let i = 0; i < data.length; i++) {
        const v = [data[i].x, data[i].y, data[i].gap];
        let best = 0;
        let bestD = Infinity;
        for (let c = 0; c < k; c++) {
          const d = dist(v, centroids[c]);
          if (d < bestD) {
            bestD = d;
            best = c;
          }
        }
        if (assignments[i] !== best) {
          assignments[i] = best;
          changed = true;
        }
      }
      // Recompute centroids
      const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
      for (let i = 0; i < data.length; i++) {
        const c = assignments[i];
        sums[c][0] += data[i].x;
        sums[c][1] += data[i].y;
        sums[c][2] += data[i].gap;
        sums[c][3] += 1;
      }
      for (let c = 0; c < k; c++) {
        const count = sums[c][3] || 1;
        centroids[c] = [
          sums[c][0] / count,
          sums[c][1] / count,
          sums[c][2] / count,
        ];
      }
      if (!changed) break;
    }
    return assignments;
  };

  // Load district features once; keep constant points
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/ml/district-features");
        const data = res.data || {};
        const pts = Object.entries(data).map(([name, f]) => ({
          name,
          x: Number(f.pupil_teacher_ratio) || 0,
          y: Number(f.literacy_rate) || 0,
          gap: Number(f.teacher_difference) || 0,
          z: 120, // larger base point size for readability
        }));
        setPoints(pts);
        const assigns = kmeans(pts, 3);
        setClusters(assigns);
      } catch (e) {
        console.error("Failed to load district features", e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setInputs((p) => ({ ...p, [name]: Number(value) }));
  };

  const runClassification = async () => {
    setLoading(true);
    const res = await getDistrictTypology(inputs);
    setResult(res);
    setLoading(false);
  };

  const confidence = result
    ? Math.max(
        60,
        Math.min(
          95,
          100 -
            Math.abs(inputs.pupil_teacher_ratio - 30) -
            Math.abs(inputs.literacy_rate - 75) / 2,
        ),
      )
    : 0;

  const downloadPDF = async () => {
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#030712",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`District_Analysis_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div
      style={{
        background: `radial-gradient(circle at 50% -20%, #1e1b4b 0%, ${COLORS.bg} 100%)`,
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        ref={reportRef}
        style={{
          background: COLORS.card,
          backdropFilter: "blur(12px)",
          borderRadius: 24,
          padding: 40,
          border: `1px solid ${COLORS.cardBorder}`,
          width: "100%",
          maxWidth: 800,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              padding: 12,
              borderRadius: 16,
              background: "rgba(99, 102, 241, 0.1)",
              marginBottom: 16,
            }}
          >
            <Layout size={32} color={COLORS.primary} />
          </div>
          <h1
            style={{
              color: COLORS.text,
              fontSize: 32,
              margin: "0 0 8px 0",
              letterSpacing: "-0.025em",
              fontWeight: 800,
            }}
          >
            District Intelligence
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 16 }}>
            Educational Inequality & Typology Analysis
          </p>
        </div>

        {/* INPUT SECTION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
            marginBottom: 32,
          }}
        >
          {[
            {
              id: "literacy_rate",
              label: "Literacy Rate",
              icon: <BookOpen size={16} />,
              unit: "%",
              min: 0,
              max: 100,
              step: 0.1,
            },
            {
              id: "pupil_teacher_ratio",
              label: "Pupil-Teacher Ratio",
              icon: <Users size={16} />,
              unit: "",
              min: 10,
              max: 80,
              step: 0.5,
            },
            {
              id: "teacher_difference",
              label: "Teacher Gap",
              icon: <Activity size={16} />,
              unit: "",
              min: -50,
              max: 50,
              step: 1,
            },
          ].map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                padding: 20,
                borderRadius: 16,
                border: `1px solid ${COLORS.cardBorder}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: COLORS.muted,
                  marginBottom: 12,
                }}
              >
                {item.icon}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {item.label}
                </span>
              </div>
              <div
                style={{
                  color: COLORS.text,
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {inputs[item.id]}
                <span
                  style={{ fontSize: 14, color: COLORS.muted, marginLeft: 4 }}
                >
                  {item.unit}
                </span>
              </div>
              <input
                type="range"
                name={item.id}
                min={item.min}
                max={item.max}
                step={item.step}
                value={inputs[item.id]}
                onChange={handleSliderChange}
                style={{
                  width: "100%",
                  accentColor: COLORS.primary,
                  cursor: "pointer",
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={runClassification}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            background: loading
              ? COLORS.gray
              : `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
            color: "#fff",
            borderRadius: 12,
            border: "none",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          {loading ? (
            "Processing Data..."
          ) : (
            <>
              <ShieldCheck size={20} /> Classify District Status
            </>
          )}
        </button>

        {/* RESULTS SECTION */}
        {result && (
          <div style={{ marginTop: 40, animation: "fadeIn 0.5s ease-out" }}>
            <div
              style={{
                padding: "2px",
                borderRadius: 20,
                background: `linear-gradient(135deg, ${colorMap[result.color]} 0%, rgba(255,255,255,0.1) 100%)`,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  background: "#0F172A",
                  borderRadius: 18,
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    color: colorMap[result.color],
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  Classification Result
                </span>
                <div
                  style={{
                    color: COLORS.text,
                    fontSize: 32,
                    fontWeight: 800,
                    marginTop: 8,
                  }}
                >
                  {result.label}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                marginBottom: 32,
              }}
            >
              {/* ANALYTICS CHART */}
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  padding: 24,
                  borderRadius: 20,
                  border: `1px solid ${COLORS.cardBorder}`,
                  height: 300,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  <Info size={16} color={COLORS.muted} />
                  <span
                    style={{
                      color: COLORS.muted,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    DISTRIBUTION MAP
                  </span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 10, right: 10, bottom: 20, left: -20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="PTR"
                      stroke={COLORS.muted}
                      fontSize={12}
                      tickLine={false}
                      domain={["dataMin - 5", "dataMax + 5"]}
                      tickMargin={8}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Literacy"
                      stroke={COLORS.muted}
                      fontSize={12}
                      tickLine={false}
                      domain={["dataMin - 5", "dataMax + 5"]}
                      tickMargin={8}
                    />
                    {/* Control point sizes */}
                    <ZAxis type="number" dataKey="z" range={[80, 160]} />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Constant district points clustered */}
                    <Scatter data={points} opacity={0.85}>
                      {points.map((p, idx) => (
                        <Cell
                          key={`base-${idx}`}
                          fill={
                            [COLORS.blue, COLORS.green, COLORS.red][
                              clusters[idx] || 0
                            ]
                          }
                        />
                      ))}
                    </Scatter>
                    {/* User scenario point (from sliders) */}
                    <Scatter
                      data={[
                        {
                          x: inputs.pupil_teacher_ratio,
                          y: inputs.literacy_rate,
                          z: 180, // highlight user point a bit larger
                          gap: inputs.teacher_difference,
                          name: "Your Scenario",
                        },
                      ]}
                      fill="#FFFFFF"
                    >
                      {[
                        {
                          x: inputs.pupil_teacher_ratio,
                          y: inputs.literacy_rate,
                          z: 180,
                          gap: inputs.teacher_difference,
                          name: "Your Scenario",
                        },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#FFFFFF" />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* CONFIDENCE & INSIGHTS */}
              <div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: 24,
                    borderRadius: 20,
                    border: `1px solid ${COLORS.cardBorder}`,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        color: COLORS.muted,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      MODEL CONFIDENCE
                    </span>
                    <span style={{ color: COLORS.text, fontWeight: 700 }}>
                      {confidence}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        width: `${confidence}%`,
                        height: "100%",
                        background: colorMap[result.color],
                        borderRadius: 10,
                        boxShadow: `0 0 10px ${colorMap[result.color]}66`,
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: 24,
                    borderRadius: 20,
                    border: `1px solid ${COLORS.cardBorder}`,
                  }}
                >
                  <span
                    style={{
                      color: COLORS.muted,
                      fontSize: 13,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 12,
                    }}
                  >
                    KEY FACTORS
                  </span>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {[
                      `Literacy: ${inputs.literacy_rate}%`,
                      `PTR: ${inputs.pupil_teacher_ratio}`,
                      `Gap: ${inputs.teacher_difference}`,
                    ].map((t) => (
                      <div
                        key={t}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: COLORS.text,
                          fontSize: 14,
                        }}
                      >
                        <ChevronRight size={14} color={COLORS.primary} /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* POLICY RECOMMENDATIONS */}
            <div
              style={{
                background: `linear-gradient(to bottom right, rgba(99, 102, 241, 0.05), transparent)`,
                padding: 32,
                borderRadius: 24,
                border: `1px solid ${COLORS.cardBorder}`,
              }}
            >
              <h3
                style={{
                  color: COLORS.text,
                  fontSize: 18,
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Activity size={20} color={COLORS.primary} /> Strategic
                Recommendations
              </h3>
              <div style={{ display: "grid", gap: 12 }}>
                {POLICY[result.label]?.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      color: COLORS.muted,
                      fontSize: 15,
                      lineHeight: "1.5",
                      background: "rgba(255,255,255,0.02)",
                      padding: "12px 16px",
                      borderRadius: 12,
                    }}
                  >
                    <span style={{ color: COLORS.primary, fontWeight: 700 }}>
                      0{i + 1}
                    </span>
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={downloadPDF}
              style={{
                marginTop: 32,
                width: "100%",
                padding: "14px",
                background: "transparent",
                color: COLORS.text,
                borderRadius: 12,
                border: `1px solid ${COLORS.cardBorder}`,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.05)")
              }
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              <Download size={18} /> Export Technical Report (PDF)
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #6366F1;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </div>
  );
}
