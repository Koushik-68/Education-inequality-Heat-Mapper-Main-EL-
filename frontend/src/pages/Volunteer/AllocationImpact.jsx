import React, { useState } from "react";
import { useVolunteer } from "./VolunteerContext.jsx";
// Professional icons for tracking and impact
import {
  TrendingUp,
  MapPin,
  CheckCircle2,
  ArrowUpRight,
  BarChart2,
  Globe,
  Zap,
  MoreHorizontal,
} from "lucide-react";

export default function AllocationImpact() {
  const { requests, adminUpdate } = useVolunteer();
  const [suggesting, setSuggesting] = useState({}); // id -> loading bool
  const [suggestions, setSuggestions] = useState({}); // id -> {nearest, topHigh}
  const allocated = requests.filter(
    (r) => r.status === "Assigned" || r.status === "Completed",
  );
  const pending = requests.filter(
    (r) => r.status === "Approved" || r.status === "Suggested",
  );

  // Stats for the Impact Header
  const completedCount = requests.filter(
    (r) => r.status === "Completed",
  ).length;
  const activeAssignments = requests.filter(
    (r) => r.status === "Assigned",
  ).length;

  const fetchSuggestions = async (req) => {
    try {
      setSuggesting((p) => ({ ...p, [req.id]: true }));
      const preferred =
        req?.details?.preferredDistrict || req?.districtSuggestion || "";
      const res = await fetch("/api/alloc/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredDistrict: preferred }),
      });
      const data = await res.json();
      setSuggestions((p) => ({ ...p, [req.id]: data }));
    } catch (e) {
      console.error("Suggestion error", e);
    } finally {
      setSuggesting((p) => ({ ...p, [req.id]: false }));
    }
  };

  const sendSuggestion = (req, district) => {
    adminUpdate(req.id, {
      status: "Suggested",
      notes: `Admin suggested ${district} for higher impact`,
      adminSuggestedDistrict: district,
    });
  };

  const assignPreferred = (req) => {
    const target =
      req.details?.preferredDistrict || req.districtSuggestion || "";
    adminUpdate(req.id, {
      status: "Assigned",
      details: { ...req.details, preferredDistrict: target },
      notes: `Assigned to ${target} as per citizen preference`,
    });
  };

  const assignDistrict = (req, district) => {
    adminUpdate(req.id, {
      status: "Assigned",
      details: { ...req.details, preferredDistrict: district },
      notes: `Assigned to ${district} based on admin allocation`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Impact Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Globe size={180} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-indigo-500/30">
              <Zap size={12} /> Live Impact Metrics
            </div>
            <h2 className="text-3xl font-bold mb-2">Resource Allocation</h2>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Monitoring the conversion of volunteer requests into tangible
              community impact across districts.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Success Rate
            </span>
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900">
              {completedCount}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">
              Total Impact Milestones
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Queue: Approved/Suggested requests */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Allocation Queue
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verified requests ready for allocation
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Request
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Preferred District
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Suggestions
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pending.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-slate-400 text-sm"
                  >
                    No pending requests
                  </td>
                </tr>
              ) : (
                pending.map((r) => {
                  const s = suggestions[r.id];
                  return (
                    <tr key={r.id} className="group">
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-900">
                          #{r.id.split("-")[0]} • {r.type}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {r.notes}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-slate-700">
                        {r.details?.preferredDistrict ||
                          r.districtSuggestion ||
                          "—"}
                      </td>
                      <td className="px-8 py-5">
                        {!s ? (
                          <button
                            onClick={() => fetchSuggestions(r)}
                            className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                            disabled={suggesting[r.id]}
                          >
                            {suggesting[r.id] ? "Loading…" : "Get Suggestions"}
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="text-[10px] uppercase text-slate-400 font-bold">
                              Nearest by EII
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {s.nearest?.map((d) => (
                                <span
                                  key={d.name}
                                  className="px-2 py-1 text-xs bg-slate-100 rounded-lg text-slate-700 border border-slate-200"
                                >
                                  {d.name} • {d.eii?.toFixed?.(2) ?? d.eii}
                                </span>
                              ))}
                            </div>
                            <div className="text-[10px] uppercase text-slate-400 font-bold mt-2">
                              High Inequality
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {s.topHigh?.map((d) => (
                                <div
                                  key={d.name}
                                  className="flex items-center gap-2"
                                >
                                  <button
                                    onClick={() => sendSuggestion(r, d.name)}
                                    className="px-2 py-1 text-xs rounded-lg bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100"
                                    title="Suggest to citizen"
                                  >
                                    {d.name} • {d.eii?.toFixed?.(2) ?? d.eii}
                                  </button>
                                  <button
                                    onClick={() => assignDistrict(r, d.name)}
                                    className="px-2 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                                    title="Assign this district"
                                  >
                                    Assign
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => assignPreferred(r)}
                            className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            Assign Preferred
                          </button>
                          {r.status === "Approved" &&
                          r.adminSuggestedDistrict ? (
                            <button
                              onClick={() =>
                                assignDistrict(r, r.adminSuggestedDistrict)
                              }
                              className="px-3 py-1 text-xs font-bold rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                              Assign Suggested ({r.adminSuggestedDistrict})
                            </button>
                          ) : null}
                          {r.status === "Suggested" ? (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                              Sent: {r.adminSuggestedDistrict}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Tracking Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Allocation Registry
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              {activeAssignments} Active Assignments
            </p>
          </div>
          <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all">
            <MoreHorizontal size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Request Identity
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Type
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Region / Authority
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Status
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Admin Intelligence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allocated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <BarChart2 size={48} className="mb-2" />
                      <p className="text-sm font-bold">No data available yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                allocated.map((r) => (
                  <tr
                    key={r.id}
                    className="group hover:bg-slate-50/80 transition-all"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">
                          #{r.id.split("-")[0]}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          UUID: {r.id.substring(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${r.type === "Teach" ? "bg-blue-500" : "bg-emerald-500"}`}
                        />
                        <span className="text-xs font-bold text-slate-700">
                          {r.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {r.details?.preferredDistrict || "Unified District"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-8 py-5">
                      <div className="max-w-[180px]">
                        <p className="text-xs text-slate-500 truncate italic">
                          "{r.notes || "Awaiting secondary logs..."}"
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Future Scope Footer Callout */}
      <div className="mt-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <BarChart2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-none mb-1">
              EII Insight Module
            </h4>
            <p className="text-xs text-slate-500">
              ML-driven District Education Improvement Index tracking is ready
              for integration.
            </p>
          </div>
        </div>
        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all">
          Learn about EII <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Assigned: "bg-indigo-50 text-indigo-700 border-indigo-100",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || "bg-slate-50"}`}
    >
      {status}
    </span>
  );
}
