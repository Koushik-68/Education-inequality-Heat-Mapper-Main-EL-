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
      <div className="w-full h-full bg-white">
        <HeaderBar />
        <div className="p-4">
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
      </div>
    </VolunteerProvider>
  );
}

function HeaderBar() {
  const navigate = useNavigate();
  const { role, setRole } = useVolunteer();
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <div className="text-xl font-bold text-[#06203a]">
          EduMap Volunteer & Resource Allocation
        </div>
        <div className="text-xs text-slate-600">
          Data identifies the problem, citizens offer help, administrators
          ensure impact.
        </div>
      </div>
      <div className="flex items-center gap-2">
        {role && (
          <span className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700">
            Role: {role}
          </span>
        )}
        {role && (
          <button
            className="text-xs px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100"
            onClick={() => {
              setRole(null);
              navigate("/volunteer/login");
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
