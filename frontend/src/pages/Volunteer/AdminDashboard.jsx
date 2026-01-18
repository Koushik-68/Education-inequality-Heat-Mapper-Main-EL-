import React from "react";
import { Link } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";

export default function AdminDashboard() {
  const { requests } = useVolunteer();
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const byDistrict = groupByDistrict(requests);
  const highRisk = getHighRiskDistricts();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-md p-6 mb-4">
        <h2 className="text-lg font-semibold text-[#06203a] mb-1">
          Admin Dashboard
        </h2>
        <p className="text-sm text-slate-600 mb-3">
          Overview of pending requests and district priorities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Stat title="Pending requests" value={pendingCount} />
          <Stat title="High-risk districts (ML)" value={highRisk.length} />
          <Stat title="Total requests" value={requests.length} />
        </div>
        <div className="flex gap-3 mt-4">
          <Link
            to="/volunteer/admin/verify"
            className="px-3 py-2 rounded bg-[#06203a] text-white text-sm"
          >
            Request Verification
          </Link>
          <Link
            to="/volunteer/admin/allocation"
            className="px-3 py-2 rounded border border-slate-300 text-sm"
          >
            Allocation & Impact
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-4 text-sm">
        <div className="font-semibold text-[#06203a] mb-2">
          Requests by district
        </div>
        <ul className="list-disc list-inside text-slate-700">
          {Object.entries(byDistrict).map(([d, count]) => (
            <li key={d}>
              {d || "(unspecified)"}: {count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="border border-slate-200 rounded-md p-3 bg-slate-50">
      <div className="text-xs text-slate-600">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function groupByDistrict(requests) {
  const map = {};
  for (const r of requests) {
    const d = r.details?.preferredDistrict || "";
    map[d] = (map[d] || 0) + 1;
  }
  return map;
}

function getHighRiskDistricts() {
  // Placeholder ML output
  return ["Kalaburagi", "Ballari"];
}
