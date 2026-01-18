import React, { useMemo, useState } from "react";
import { useVolunteer } from "./VolunteerContext.jsx";

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
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-md p-6">
      <h2 className="text-lg font-semibold text-[#06203a] mb-2">
        Request Verification
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Review citizen details, district ML priority, and act.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 border border-slate-200 rounded-md">
          <div className="p-2 bg-slate-50 font-medium">Pending Requests</div>
          <ul className="divide-y">
            {pending.length === 0 && (
              <li className="p-3 text-slate-600">No pending requests.</li>
            )}
            {pending.map((r) => (
              <li
                key={r.id}
                className={`p-3 cursor-pointer ${selectedId === r.id ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                onClick={() => setSelectedId(r.id)}
              >
                <div className="text-xs text-slate-600">{r.id}</div>
                <div className="text-sm font-medium">{r.type}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 border border-slate-200 rounded-md p-4">
          {!selected ? (
            <div className="text-slate-600">Select a pending request.</div>
          ) : (
            <div>
              <div className="font-semibold text-[#06203a] mb-2">Details</div>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-slate-600">Type</dt>
                  <dd className="font-medium">{selected.type}</dd>
                </div>
                <div>
                  <dt className="text-slate-600">Preferred district</dt>
                  <dd className="font-medium">
                    {selected.details?.preferredDistrict || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-600">ML district score</dt>
                  <dd className="font-medium">
                    {selected.type === "Teach"
                      ? selected.districtPriority
                      : selected.districtSuggestion}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-600">Status</dt>
                  <dd className="font-medium">{selected.status}</dd>
                </div>
              </dl>

              <div className="mt-4 flex gap-2">
                <button
                  className="px-3 py-2 rounded bg-[#06203a] text-white text-sm"
                  onClick={() => handleAction("approve")}
                >
                  Approve
                </button>
                <button
                  className="px-3 py-2 rounded border border-slate-300 text-sm"
                  onClick={() => handleAction("reject")}
                >
                  Reject
                </button>
                <button
                  className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
                  onClick={() => handleAction("assign")}
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
