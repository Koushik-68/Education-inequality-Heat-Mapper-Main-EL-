import React from "react";
import { useVolunteer } from "./VolunteerContext.jsx";

export default function AllocationImpact() {
  const { requests } = useVolunteer();
  const allocated = requests.filter(
    (r) => r.status === "Assigned" || r.status === "Completed",
  );

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-md p-6">
      <h2 className="text-lg font-semibold text-[#06203a] mb-2">
        Allocation & Impact
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Track assigned requests and mark completion. Future scope: District EII
        change.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2 border-b">Request ID</th>
              <th className="text-left p-2 border-b">Type</th>
              <th className="text-left p-2 border-b">Status</th>
              <th className="text-left p-2 border-b">Institution/District</th>
              <th className="text-left p-2 border-b">Notes</th>
            </tr>
          </thead>
          <tbody>
            {allocated.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-slate-600">
                  No allocations yet.
                </td>
              </tr>
            )}
            {allocated.map((r) => (
              <tr key={r.id}>
                <td className="p-2 border-b font-mono">{r.id}</td>
                <td className="p-2 border-b">{r.type}</td>
                <td className="p-2 border-b">{r.status}</td>
                <td className="p-2 border-b">
                  {r.details?.preferredDistrict || "—"}
                </td>
                <td className="p-2 border-b text-slate-600">
                  {r.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-slate-600">
        District EII change tracking can be added later using ML-service
        outputs.
      </div>
    </div>
  );
}
