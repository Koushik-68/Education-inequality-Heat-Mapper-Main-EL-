import React, { useMemo, useState } from "react";
import { useVolunteer } from "./VolunteerContext.jsx";
// Icons for professional navigation and actions
import {
  CheckCircle2,
  XCircle,
  UserPlus,
  ClipboardList,
  Map,
  Cpu,
  Inbox,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function RequestVerification() {
  const { requests, adminUpdate } = useVolunteer();
  const pending = useMemo(
    () => requests.filter((r) => r.status === "Pending"),
    [requests],
  );
  const [selectedId, setSelectedId] = useState(pending[0]?.id || null);
  const selected = pending.find((r) => r.id === selectedId) || null;

  const handleAction = (action) => {
    if (!selected) return;
    if (action === "approve") {
      adminUpdate(selected.id, {
        status: "Approved",
        notes: "Approved by admin",
      });
    } else if (action === "reject") {
      adminUpdate(selected.id, {
        status: "Rejected",
        notes: "Rejected due to incomplete details",
      });
    } else if (action === "assign") {
      adminUpdate(selected.id, {
        status: "Assigned",
        notes: "Assigned to institution/district",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[85vh] flex flex-col">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Request Verification
          </h2>
          <p className="text-slate-500 text-sm">
            Validate incoming volunteer and donation requests.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
          <Filter size={14} />
          Status:{" "}
          <span className="text-amber-600 uppercase">Pending Review</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Left Column: The Queue */}
        <div className="w-1/3 bg-white border border-slate-200 rounded-[2rem] flex flex-col shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Inbox size={14} /> Inbox ({pending.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                <CheckCircle2 size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-1">No pending requests to verify.</p>
              </div>
            ) : (
              pending.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`group p-5 cursor-pointer border-b border-slate-50 transition-all relative ${
                    selectedId === r.id
                      ? "bg-indigo-50/50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {selectedId === r.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      #{r.id.split("-")[0]}
                    </span>
                    <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full font-bold text-slate-500">
                      {r.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div
                      className={`font-bold transition-colors ${selectedId === r.id ? "text-indigo-700" : "text-slate-700"}`}
                    >
                      {r.type === "Teach"
                        ? "Educational Outreach"
                        : "Resource Contribution"}
                    </div>
                    <ChevronRight
                      size={16}
                      className={`transition-transform ${selectedId === r.id ? "text-indigo-400 translate-x-1" : "text-slate-300 opacity-0 group-hover:opacity-100"}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: The Inspector */}
        <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <ClipboardList size={64} className="mb-4 opacity-10" />
              <p className="font-medium">
                Select a request from the queue to begin
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header Details */}
              <div className="p-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      {selected.type} Request
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={14} /> Submission: 2 hours ago
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">
                        {selected.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="flex-1 p-8 overflow-y-auto space-y-8">
                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Case Information
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <DetailItem
                      label="Subject / Item"
                      value={
                        selected.details?.subject ||
                        selected.details?.itemName ||
                        "N/A"
                      }
                      icon={<Inbox size={16} />}
                    />
                    <DetailItem
                      label="Preferred District"
                      value={
                        selected.details?.preferredDistrict || "Not Specified"
                      }
                      icon={<Map size={16} />}
                    />
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Intelligence Insight
                  </h4>
                  <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                    <Cpu
                      className="absolute -right-4 -bottom-4 text-white/5"
                      size={100}
                    />
                    <div className="relative z-10">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                        ML Matching Score
                      </div>
                      <p className="text-lg font-medium leading-snug">
                        {selected.type === "Teach"
                          ? selected.districtPriority
                          : selected.districtSuggestion}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleAction("reject")}
                  className="px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2"
                >
                  <XCircle size={18} /> Reject Request
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction("approve")}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction("assign")}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                  >
                    <UserPlus size={18} /> Assign Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean details
function DetailItem({ label, value, icon }) {
  return (
    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <div className="text-slate-800 font-bold">{value}</div>
    </div>
  );
}
