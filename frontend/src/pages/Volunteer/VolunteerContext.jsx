import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const VolunteerContext = createContext(null);

export function useVolunteer() {
  return useContext(VolunteerContext);
}

export default function VolunteerProvider({ children }) {
  const [role, setRole] = useState(null); // 'citizen' | 'admin'
  const [profile, setProfile] = useState(null); // { name, email, preferences }
  const [requests, setRequests] = useState([]);
  const [uiLoading, setUiLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const cuRaw = localStorage.getItem("currentUser");
      if (cuRaw) {
        const cu = JSON.parse(cuRaw);
        if (cu?.role) setRole(cu.role);
      }
      const pRaw = localStorage.getItem("volunteerProfile");
      if (pRaw) {
        setProfile(JSON.parse(pRaw));
      }
      const rRaw = localStorage.getItem("volunteerRequests");
      if (rRaw) {
        const parsed = JSON.parse(rRaw);
        if (Array.isArray(parsed)) setRequests(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist requests/profile when they change
  useEffect(() => {
    try {
      localStorage.setItem("volunteerRequests", JSON.stringify(requests));
    } catch {}
  }, [requests]);

  useEffect(() => {
    try {
      if (profile) {
        localStorage.setItem("volunteerProfile", JSON.stringify(profile));
      }
    } catch {}
  }, [profile]);

  const value = useMemo(
    () => ({
      role,
      setRole,
      profile,
      setProfile: (p) => setProfile(p),
      uiLoading,
      setUiLoading,
      startLoading: (ms = 700) => {
        setUiLoading(true);
        window.clearTimeout(window.__uiLoadT);
        window.__uiLoadT = window.setTimeout(() => setUiLoading(false), ms);
      },
      logout: () => {
        setRole(null);
        setProfile(null);
        try {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("volunteerProfile");
        } catch {}
      },
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
          createdAt: Date.now(),
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
          createdAt: Date.now(),
        };
        setRequests((prev) => [record, ...prev]);
        return record;
      },
      updateRequest: (id, updater) => {
        // updater can be an object or function; only editable when Pending
        setRequests((prev) =>
          prev.map((r) => {
            if (r.id !== id) return r;
            if (r.status !== "Pending") return r;
            const updates =
              typeof updater === "function" ? updater(r) : updater || {};
            return { ...r, ...updates };
          }),
        );
      },
      cancelRequest: (id) => {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id && r.status === "Pending"
              ? { ...r, status: "Cancelled", notes: "Withdrawn by volunteer" }
              : r,
          ),
        );
      },
      adminUpdate: (id, updates) => {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        );
      },
    }),
    [role, profile, requests, uiLoading],
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
