import React from "react";
import { useLocation } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";

export default function RequestTracking() {
  const { requests } = useVolunteer();
  const location = useLocation();
  const lastId = location.state?.lastId;

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-md p-6">
      <h2 className="text-lg font-semibold text-[#06203a] mb-2">My Requests</h2>
      <p className="text-sm text-slate-600 mb-4">
        Transparency • Governance • Accountability
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2 border-b">Request ID</th>
              <th className="text-left p-2 border-b">Type</th>
              <th className="text-left p-2 border-b">Status</th>
              <th className="text-left p-2 border-b">Admin notes</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-slate-600">
                  No requests yet.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className={r.id === lastId ? "bg-emerald-50" : ""}>
                <td className="p-2 border-b font-mono">{r.id}</td>
                <td className="p-2 border-b">{r.type}</td>
                <td className="p-2 border-b">{r.status}</td>
                <td className="p-2 border-b text-slate-600">
                  {r.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
