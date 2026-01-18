import React from "react";
import { Link } from "react-router-dom";

export default function CitizenDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-md p-6 mb-4">
        <h2 className="text-lg font-semibold text-[#06203a] mb-1">
          Citizen Dashboard
        </h2>
        <p className="text-sm text-slate-600 mb-3">
          No direct action happens — only requests.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card
            title="Teach (Volunteer Request)"
            to="/volunteer/citizen/teach"
            color="blue"
          />
          <Card
            title="Donate (Resource Request)"
            to="/volunteer/citizen/donate"
            color="green"
          />
          <Card
            title="Track My Requests"
            to="/volunteer/citizen/requests"
            color="gray"
          />
        </div>
      </div>
      <InfoBlock />
    </div>
  );
}

function Card({ title, to, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    green: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    gray: "bg-slate-50 border-slate-200 hover:bg-slate-100",
  };
  return (
    <Link
      to={to}
      className={`block border rounded-md p-4 transition ${colors[color]}`}
    >
      <div className="font-medium">{title}</div>
      <div className="text-xs text-slate-600">
        Submit a request. Admin verifies and assigns.
      </div>
    </Link>
  );
}

function InfoBlock() {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 text-sm">
      <div className="font-semibold text-[#06203a] mb-1">
        Smart Improvements
      </div>
      <ul className="list-disc list-inside text-slate-700">
        <li>ML suggests districts for teaching and donation impact.</li>
        <li>
          Requests have statuses: Pending → Approved → Assigned → Completed.
        </li>
        <li>Admin notes and transparency for governance.</li>
      </ul>
    </div>
  );
}
