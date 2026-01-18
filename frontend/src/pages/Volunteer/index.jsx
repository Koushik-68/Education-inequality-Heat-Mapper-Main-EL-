import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import VolunteerProvider, { useVolunteer } from "./VolunteerContext.jsx";
import Login from "./Login.jsx";
import CitizenDashboard from "./CitizenDashboard.jsx";
import TeachRequest from "./TeachRequest.jsx";
import DonateRequest from "./DonateRequest.jsx";
import RequestTracking from "./RequestTracking.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import RequestVerification from "./RequestVerification.jsx";
import AllocationImpact from "./AllocationImpact.jsx";

// Professional Icons
import { LogOut, ShieldCheck, UserCircle, Compass, Zap } from "lucide-react";

function GuardedCitizen({ children }) {
  const { role } = useVolunteer();
  if (role !== "citizen") return <Navigate to="/volunteer/login" replace />;
  return children;
}

function GuardedAdmin({ children }) {
  const { role } = useVolunteer();
  if (role !== "admin") return <Navigate to="/volunteer/login" replace />;
  return children;
}

export default function VolunteerModule() {
  return (
    <VolunteerProvider>
      {/* Match Login page background (dark radial gradient) */}
      <div className="min-h-screen bg-slate-950 font-sans antialiased bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <HeaderBar />

        {/* Main Content Area with smooth entry transition */}
        <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/volunteer/login" replace />}
              />
              <Route path="/login" element={<Login />} />

              {/* Citizen flow */}
              <Route
                path="/citizen"
                element={
                  <GuardedCitizen>
                    <CitizenDashboard />
                  </GuardedCitizen>
                }
              />
              <Route
                path="/citizen/teach"
                element={
                  <GuardedCitizen>
                    <TeachRequest />
                  </GuardedCitizen>
                }
              />
              <Route
                path="/citizen/donate"
                element={
                  <GuardedCitizen>
                    <DonateRequest />
                  </GuardedCitizen>
                }
              />
              <Route
                path="/citizen/requests"
                element={
                  <GuardedCitizen>
                    <RequestTracking />
                  </GuardedCitizen>
                }
              />

              {/* Admin flow */}
              <Route
                path="/admin"
                element={
                  <GuardedAdmin>
                    <AdminDashboard />
                  </GuardedAdmin>
                }
              />
              <Route
                path="/admin/verify"
                element={
                  <GuardedAdmin>
                    <RequestVerification />
                  </GuardedAdmin>
                }
              />
              <Route
                path="/admin/allocation"
                element={
                  <GuardedAdmin>
                    <AllocationImpact />
                  </GuardedAdmin>
                }
              />
            </Routes>
          </div>
        </main>

        {/* Subtle Footer */}
        <footer className="py-10 text-center">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.3em]">
            EduMap Intelligence System • 2026
          </p>
        </footer>
      </div>
    </VolunteerProvider>
  );
}

function HeaderBar() {
  const navigate = useNavigate();
  const { role, setRole } = useVolunteer();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo & Branding */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() =>
            navigate(
              role === "admin" ? "/volunteer/admin" : "/volunteer/citizen",
            )
          }
        >
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
            <Compass className="text-indigo-400" size={22} />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tighter leading-none">
              EduMap<span className="text-indigo-600">.</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Impact Portal
            </div>
          </div>
        </div>

        {/* Global System Message (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          <Zap size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-[11px] font-semibold text-slate-600">
            System identifies problems, citizens offer solutions.
          </span>
        </div>

        {/* Actions & User State */}
        <div className="flex items-center gap-4">
          {role && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                role === "admin"
                  ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                  : "bg-emerald-50 border-emerald-100 text-emerald-700"
              }`}
            >
              {role === "admin" ? (
                <ShieldCheck size={14} />
              ) : (
                <UserCircle size={14} />
              )}
              <span className="capitalize">{role} Access</span>
            </div>
          )}

          {role && (
            <button
              onClick={() => {
                setRole(null);
                navigate("/volunteer/login");
              }}
              className="group flex items-center gap-2 p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
              title="Logout"
            >
              <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white shadow-sm group-hover:border-red-200">
                <LogOut size={16} />
              </div>
              <span className="text-xs font-bold hidden md:block">
                Sign Out
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
