import React from "react";
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
  const { requests } = useVolunteer();
  const allocated = requests.filter(
    (r) => r.status === "Assigned" || r.status === "Completed",
  );

  // Stats for the Impact Header
  const completedCount = requests.filter(
    (r) => r.status === "Completed",
  ).length;
  const activeAssignments = requests.filter(
    (r) => r.status === "Assigned",
  ).length;

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
