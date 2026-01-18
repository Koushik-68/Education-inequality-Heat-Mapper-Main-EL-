import Dashboard from "./pages/Dashboard.jsx";
import StateSummary from "./pages/StateSummary.jsx";
import DataUpload from "./pages/DataUpload.jsx";
import VolunteerModule from "./pages/Volunteer/index.jsx";
import DistrictTypology from "./pages/DistrictTypology.jsx";
import Sidebar from "./component/Sidebar.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import Loader from "./component/Loader.jsx";

function Layout({ children }) {
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    setRouteLoading(true);
    const t = setTimeout(() => setRouteLoading(false), 700);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // ✅ Determine active sidebar item
  let active = "Dashboard";
  if (location.pathname.startsWith("/state-summary")) {
    active = "StateSummary";
  } else if (location.pathname.startsWith("/data-upload")) {
    active = "DataUpload";
  } else if (location.pathname.startsWith("/district-typology")) {
    active = "DistrictTypology";
  } else if (location.pathname.startsWith("/dashboard")) {
    active = "Dashboard";
  } else if (location.pathname.startsWith("/volunteer")) {
    active = "Volunteer";
  }

  const HEADER_HEIGHT = 78;
  const SIDEBAR_WIDTH = 300;

  // Updated styles to match Login/Sidebar Design
  const containerStyle = {
    display: "flex",
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    width: "100vw",
    overflow: "hidden",
    background: "#020617", // slate-950
  };

  return (
    <div
      style={{ minHeight: "100vh", background: "#020617", color: "#f8fafc" }}
    >
      {/* ✅ HEADER — Updated for Dark Matte/Indigo Theme */}
      <header
        style={{
          height: HEADER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          borderBottom: "1px solid rgba(255,255,255,0.1)", // Glass border
          background: "rgba(2, 6, 23, 0.8)", // Semi-transparent slate-950
          backdropFilter: "blur(12px)",
          boxSizing: "border-box",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background: "#4f46e5", // Indigo-600
              boxShadow: "0 0 20px rgba(79,70,229,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "0.5px",
              }}
            >
              EDUCATIONAL HEAT MAPPER
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Unified Volunteer Portal
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* <button
            style={{
              background: "#4f46e5",
              color: "#fff",
              padding: "10px 20px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(79,70,229,0.2)",
            }}
          >
            Download Report
          </button>
          <button
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "#cbd5e1",
              padding: "10px 16px",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Help
          </button> */}
        </div>
      </header>

      {/* Global centered overlay for route changes */}
      {routeLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader size="md" />
          </div>
        </div>
      )}

      {/* ✅ BODY WITH SIDEBAR */}
      <div style={containerStyle}>
        <div
          style={{
            width: SIDEBAR_WIDTH,
            height: "100%",
            flexShrink: 0,
            padding: 0, // Removed padding to let sidebar hit the edge like Login
          }}
        >
          <Sidebar active={active} />
        </div>

        <main
          style={{
            flexGrow: 1,
            minWidth: 0,
            height: "100%",
            overflowY: "auto",
            padding: "24px",
            boxSizing: "border-box",
            background:
              "radial-gradient(circle at top right, rgba(79,70,229,0.05), transparent)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/state-summary" element={<StateSummary />} />
          <Route path="/data-upload" element={<DataUpload />} />
          <Route path="/district-typology" element={<DistrictTypology />} />
          <Route path="/volunteer/*" element={<VolunteerModule />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

// (No global keyframes needed; Loader uses Tailwind classes)
