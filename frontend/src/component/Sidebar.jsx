import React from "react";
import { Link } from "react-router-dom";

// --- Icons (Keeping your existing SVG logic) ---
const IconHome = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconMap = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" x2="9" y1="3" y2="18" />
    <line x1="15" x2="15" y1="6" y2="21" />
  </svg>
);
const IconUpload = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);
const IconVolunteer = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 21H7.5a2.5 2.5 0 0 1 0-5H9" />
    <path d="M15 21h2.5a2.5 2.5 0 0 0 0-5H15l-2-3" />
    <path d="M17.5 3.5a2.5 2.5 0 0 0-3.5 0L13 4.5l-.9-.9a2.5 2.5 0 0 0-3.5 3.5l.9.9L13 12l3.5-3.5.9-.9a2.5 2.5 0 0 0-3.5-3.5z" />
  </svg>
);

// --- Sub-Components with New Design ---

function SidebarButton({ label, active, href, icon }) {
  return (
    <Link
      to={href}
      className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group
      ${
        active
          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.15)]"
          : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`transition-colors ${active ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "text-slate-500 group-hover:text-slate-300"}`}
        >
          {React.cloneElement(icon, { size: 20 })}
        </span>
        {label}
      </span>

      {active && (
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,1)]" />
      )}
    </Link>
  );
}

export default function Sidebar({ active = "Dashboard" }) {
  return (
    <aside className="relative bg-slate-950 border-r border-white/10 text-white w-72 min-h-screen flex flex-col py-8 px-5 overflow-hidden">
      {/* Background Decorative Glow (Matches Login Page) */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header Section */}

      {/* Accent Line (Simplified to match Login's indigo theme) */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mb-8" />

      {/* Navigation */}
      <nav
        className="flex flex-col gap-2 relative z-10"
        aria-label="Main navigation"
      >
        <SidebarButton
          label="Dashboard"
          active={active === "Dashboard"}
          href="/dashboard"
          icon={<IconHome />}
        />
        <SidebarButton
          label="State Summary"
          active={active === "StateSummary"}
          href="/state-summary"
          icon={<IconMap />}
        />
        <SidebarButton
          label="Data Upload"
          active={active === "DataUpload"}
          href="/data-upload"
          icon={<IconUpload />}
        />
        <SidebarButton
          label="Volunteer"
          active={active === "Volunteer"}
          href="/volunteer"
          icon={<IconVolunteer />}
        />
        <SidebarButton
          label="District Typology"
          active={active === "DistrictTypology"}
          href="/district-typology"
          icon={<IconVolunteer />}
        />
      </nav>

      {/* Footer / Access Level Section */}
      {/* <div className="mt-auto pt-6 relative z-10">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
            System Status
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-200">
              Citizen Read-Only
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-600 font-mono">
            V2.1.0 • SECURE NODE
          </div>
        </div>
      </div> */}
    </aside>
  );
}
