import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";

export default function TeachRequest() {
  const navigate = useNavigate();
  const { submitTeach } = useVolunteer();
  const [form, setForm] = useState({
    subject: "",
    mode: "offline",
    availability: "",
    preferredDistrict: "",
    experience: "",
  });

  const suggested = suggestLabel(form);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const record = submitTeach(form);
    // After submit: status = Pending, redirect to tracking
    navigate("/volunteer/citizen/requests", { state: { lastId: record.id } });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-md p-6">
      <h2 className="text-lg font-semibold text-[#06203a] mb-2">
        Teach Request
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Submit your teaching volunteer request. Admin will verify before
        assignment.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="block mb-1 text-slate-700">Subject expertise</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block mb-1 text-slate-700">Mode</label>
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-slate-700">
              Availability (days/hours)
            </label>
            <input
              name="availability"
              value={form.availability}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
            />
          </div>
          <div>
            <label className="block mb-1 text-slate-700">
              Preferred District
            </label>
            <input
              name="preferredDistrict"
              value={form.preferredDistrict}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-slate-700">
            Experience (optional)
          </label>
          <textarea
            name="experience"
            value={form.experience}
            onChange={handleChange}
            className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
          />
        </div>

        <div className="border border-slate-200 rounded-md bg-slate-50 p-3">
          <div className="font-medium text-[#06203a]">ML Suggestion</div>
          <div className="text-xs text-slate-700">{suggested}</div>
        </div>

        <div>
          <button className="bg-[#06203a] text-white px-4 py-2 rounded-md text-sm hover:bg-[#0b2f4f]">
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}

function suggestLabel({ subject }) {
  const s = (subject || "").toLowerCase();
  if (s.includes("math") || s.includes("science"))
    return "Your teaching skills are most needed in Kalaburagi.";
  if (s.includes("english") || s.includes("language"))
    return "Your teaching skills are most needed in Bidar.";
  if (s.includes("computer") || s.includes("coding"))
    return "Your teaching skills are most needed in Ballari.";
  return "Your teaching skills are most needed in Kalaburagi.";
}
