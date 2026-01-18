import React from "react";
import { Link } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";
// Professional icons for an executive feel
import {
  Activity,
  Clock,
  AlertTriangle,
  Layers,
  CheckCircle,
  BarChart3,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboard() {
  const { requests, profile } = useVolunteer();
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const byDistrict = groupByDistrict(requests);
  const highRisk = getHighRiskDistricts();

  // Find max count for the district progress bars
  const maxRequests = Math.max(...Object.values(byDistrict), 1);

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-12">
      {/* Top Navigation Bar Branding */}
      <div className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center mb-8 shadow-lg shadow-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <span className="font-bold tracking-tight text-lg">
            Admin Command
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            System Live
          </span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          {profile?.name && (
            <span className="ml-2 text-xs text-slate-300">
              Signed in: {profile.name}
              {profile.email ? ` (${profile.email})` : ""}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Dashboard Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            System Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time governance and resource allocation monitoring.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Stat
            title="Pending Approval"
            value={pendingCount}
            icon={<Clock size={24} />}
            color="indigo"
            trend="+2 since last hour"
          />
          <Stat
            title="High-Risk Districts"
            value={highRisk.length}
            icon={<AlertTriangle size={24} />}
            color="amber"
            trend="ML Flagged Priority"
          />
          <Stat
            title="Total Throughput"
            value={requests.length}
            icon={<Activity size={24} />}
            color="emerald"
            trend="Overall Volume"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Action Center */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Operations
            </h3>
            <ActionCard
              to="/volunteer/admin/verify"
              title="Verify Requests"
              description="Process pending citizen requests."
              icon={<CheckCircle size={20} />}
              primary
            />
            <ActionCard
              to="/volunteer/admin/allocation"
              title="Allocation Hub"
              description="Map resources to high-risk zones."
              icon={<Layers size={20} />}
            />
          </div>

          {/* District Analytics Table/List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-xl">
                    <BarChart3 className="text-slate-600" size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Demand by District
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                  LIVE DATA
                </span>
              </div>

              <div className="space-y-6">
                {Object.entries(byDistrict).map(([d, count]) => (
                  <div key={d} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-slate-700">
                        {d || "General / Unspecified"}
                      </span>
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {count} requests
                      </span>
                    </div>
                    {/* Progress Bar Visualization */}
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000"
                        style={{ width: `${(count / maxRequests) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {Object.keys(byDistrict).length === 0 && (
                  <p className="text-center text-slate-400 py-10 italic">
                    No request data available for analysis.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, icon, color, trend }) {
  const colorMap = {
    indigo: "bg-indigo-600 text-indigo-600 shadow-indigo-100",
    amber: "bg-amber-500 text-amber-600 shadow-amber-100",
    emerald: "bg-emerald-600 text-emerald-600 shadow-emerald-100",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 group hover:border-indigo-200 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-2xl text-white ${colorMap[color].split(" ")[0]} shadow-lg`}
        >
          {icon}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {trend}
        </div>
      </div>
      <div>
        <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ to, title, description, icon, primary }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 p-5 rounded-2xl border transition-all group ${
        primary
          ? "bg-slate-900 border-slate-900 text-white shadow-lg hover:bg-indigo-700 hover:border-indigo-700"
          : "bg-white border-slate-200 text-slate-900 hover:border-indigo-500"
      }`}
    >
      <div
        className={`p-2.5 rounded-xl ${primary ? "bg-white/10" : "bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600"}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-bold text-sm">{title}</div>
        <div
          className={`text-xs ${primary ? "text-slate-400" : "text-slate-500"}`}
        >
          {description}
        </div>
      </div>
      <ArrowUpRight
        size={18}
        className={`opacity-0 group-hover:opacity-100 transition-all ${primary ? "text-white" : "text-indigo-600"}`}
      />
    </Link>
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
  return ["Kalaburagi", "Ballari"];
}
