import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";
import {
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function RequestTracking() {
  const { requests, updateRequest, cancelRequest, startLoading } =
    useVolunteer();
  const location = useLocation();
  const lastId = location.state?.lastId;

  // Sorting to show the latest at the top
  const sortedRequests = [...requests].reverse();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <History size={20} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Request History
            </h2>
          </div>
          <p className="text-slate-500 max-w-md">
            Track the lifecycle of your contributions from submission to
            community impact.
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Active
            </div>
            <div className="text-lg font-bold text-slate-900">
              {
                requests.filter(
                  (r) => r.status !== "Rejected" && r.status !== "Completed",
                ).length
              }
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total
            </div>
            <div className="text-lg font-bold text-slate-900">
              {requests.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {sortedRequests.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 border-2 border-dashed border-slate-200 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-4 text-slate-300">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              No requests found
            </h3>
            <p className="text-slate-500 mt-2">
              Start your journey by offering to teach or donate.
            </p>
          </div>
        ) : (
          sortedRequests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              isNew={r.id === lastId}
              onEdit={(updates) => {
                startLoading(600);
                updateRequest(r.id, { details: { ...r.details, ...updates } });
              }}
              onCancel={() => {
                startLoading(700);
                cancelRequest(r.id);
              }}
            />
          ))
        )}
      </div>

      {/* Trust Footer */}
      <div className="mt-12 flex items-center justify-center gap-6 text-slate-400 opacity-60">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <CheckCircle2 size={14} /> Transparency
        </div>
        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <CheckCircle2 size={14} /> Governance
        </div>
        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <CheckCircle2 size={14} /> Accountability
        </div>
      </div>
    </div>
  );
}

function RequestCard({ request, isNew, onEdit, onCancel }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    preferredDistrict: request.details?.preferredDistrict || "",
    availability: request.details?.availability || "",
  });
  const canEdit = request.status === "Pending";
  return (
    <div
      className={`group bg-white rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${
        isNew
          ? "border-emerald-500 shadow-xl shadow-emerald-100 animate-in zoom-in-95"
          : "border-slate-100 hover:border-indigo-200 shadow-lg shadow-slate-200/40"
      }`}
    >
      <div className="p-6 md:p-8">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                request.type === "Teach"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {request.type === "Teach" ? (
                <Sparkles size={24} />
              ) : (
                <FileText size={24} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">
                  {request.type} Request
                </h4>
                {isNew && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-tight">
                ID: {request.id.split("-")[0]}
              </span>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* The Tracking Stepper */}
        <div className="relative mb-8 px-2">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2"></div>
          <div className="relative flex justify-between">
            <Step label="Submitted" active={true} completed={true} />
            <Step
              label="Verified"
              active={request.status !== "Pending"}
              completed={["Approved", "Assigned", "Completed"].includes(
                request.status,
              )}
            />
            <Step
              label="Assigned"
              active={["Assigned", "Completed"].includes(request.status)}
              completed={request.status === "Completed"}
            />
            <Step
              label="Impact"
              active={request.status === "Completed"}
              completed={request.status === "Completed"}
              isLast
            />
          </div>
        </div>

        {/* Edit / Cancel for Pending */}
        {canEdit && (
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 mb-6">
            {!editing ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-700">
                  Pending request — you can edit or withdraw.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-600 hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Preferred District
                  </label>
                  <input
                    value={form.preferredDistrict}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        preferredDistrict: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Availability
                  </label>
                  <input
                    value={form.availability}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, availability: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onEdit(form);
                      setEditing(false);
                    }}
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80 -mx-8 -mb-8 p-6 mt-6">
          <div className="flex items-start gap-3">
            <MessageSquare size={16} className="text-slate-400 mt-1" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Admin Response
              </span>
              <p className="text-sm text-slate-600 italic">
                {request.notes ||
                  "Awaiting administrator review for assignment."}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:gap-4 transition-all">
            View Full Details <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-blue-50 text-blue-700 border-blue-200",
    Assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-xs font-bold border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function Step({ label, active, completed, isLast }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 bg-white relative z-10 px-2`}
    >
      <div
        className={`w-4 h-4 rounded-full border-4 transition-all duration-500 ${
          completed
            ? "bg-emerald-500 border-emerald-100"
            : active
              ? "bg-white border-indigo-500 scale-125 shadow-lg shadow-indigo-100"
              : "bg-white border-slate-200"
        }`}
      ></div>
      <span
        className={`text-[10px] font-bold uppercase tracking-tight ${active ? "text-slate-900" : "text-slate-300"}`}
      >
        {label}
      </span>
    </div>
  );
}
