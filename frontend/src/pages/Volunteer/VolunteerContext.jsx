import React, { createContext, useContext, useMemo, useState } from "react";

const VolunteerContext = createContext(null);

export function useVolunteer() {
  return useContext(VolunteerContext);
}

export default function VolunteerProvider({ children }) {
  const [role, setRole] = useState(null); // 'citizen' | 'admin'
  const [requests, setRequests] = useState([]);

  const value = useMemo(
    () => ({
      role,
      setRole,
      requests,
      submitTeach: (data) => {
        const id = `REQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const record = {
          id,
          type: "Teach",
          status: "Pending",
          details: data,
          notes: "Awaiting admin verification",
          districtPriority: suggestTeachDistrict(data),
        };
        setRequests((prev) => [record, ...prev]);
        return record;
      },
      submitDonate: (data) => {
        const id = `REQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const urgency = suggestDonateUrgency(data);
        const record = {
          id,
          type: "Donate",
          status: "Pending",
          details: data,
          notes: "Awaiting admin approval",
          districtUrgency: urgency,
          districtSuggestion: suggestDonateDistrict(data),
        };
        setRequests((prev) => [record, ...prev]);
        return record;
      },
      adminUpdate: (id, updates) => {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        );
      },
    }),
    [role, requests],
  );

  return (
    <VolunteerContext.Provider value={value}>
      {children}
    </VolunteerContext.Provider>
  );
}

// --- Simple ML-style suggestions (placeholder logic) ---
function suggestTeachDistrict({ subject }) {
  if (!subject) return "Kalaburagi"; // default
  const s = subject.toLowerCase();
  if (s.includes("math") || s.includes("science")) return "Kalaburagi";
  if (s.includes("english") || s.includes("language")) return "Bidar";
  if (s.includes("computer") || s.includes("coding")) return "Ballari";
  return "Kalaburagi";
}

function suggestDonateUrgency({ donationType, itemName }) {
  const type = (donationType || "").toLowerCase();
  const item = (itemName || "").toLowerCase();
  if (type === "amount") return "Critical";
  if (
    item.includes("device") ||
    item.includes("laptop") ||
    item.includes("tablet")
  )
    return "Critical";
  if (item.includes("infrastructure")) return "Critical";
  if (item.includes("book") || item.includes("notebook")) return "Poor";
  return "Moderate";
}

function suggestDonateDistrict({ donationType }) {
  const type = (donationType || "").toLowerCase();
  if (type === "item") return "Ballari";
  return "Ballari"; // default suggestion per spec
}
