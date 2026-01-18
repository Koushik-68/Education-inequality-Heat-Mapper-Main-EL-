import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";

export default function DonateRequest() {
  const navigate = useNavigate();
  const { submitDonate } = useVolunteer();
  const [form, setForm] = useState({
    donationType: "books",
    quantity: "",
    value: "",
    preferredDistrict: "",
    pickupDelivery: "pickup",
    itemName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const record = submitDonate(form);
    navigate("/volunteer/citizen/requests", { state: { lastId: record.id } });
  };

  const urgency = getUrgencyBadge(form);
  const suggestion = getDistrictSuggestion(form);

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-md p-6">
      <h2 className="text-lg font-semibold text-[#06203a] mb-2">
        Donate Request
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Submit a donation request. Admin approval required before allocation.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-slate-700">Donation type</label>
            <select
              name="donationType"
              value={form.donationType}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
            >
              <option value="books">Books</option>
              <option value="devices">Digital devices</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="financial">Financial</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-slate-700">
              Quantity / Value
            </label>
            <input
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder="e.g. ₹50000 or 100 sets"
              className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-slate-700">
              Preferred district (optional)
            </label>
            <input
              name="preferredDistrict"
              value={form.preferredDistrict}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
            />
          </div>
          <div>
            <label className="block mb-1 text-slate-700">
              Pickup / delivery preference
            </label>
            <select
              name="pickupDelivery"
              value={form.pickupDelivery}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
            >
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block mb-1 text-slate-700">
            Item details (optional)
          </label>
          <input
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="e.g. Laptops, Notebooks, Chairs"
            className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-slate-200 rounded-md bg-slate-50 p-3">
            <div className="font-medium text-[#06203a]">District Urgency</div>
            <div className={`text-xs mt-1 ${urgency.class}`}>
              {urgency.label}
            </div>
          </div>
          <div className="border border-slate-200 rounded-md bg-slate-50 p-3">
            <div className="font-medium text-[#06203a]">ML Suggestion</div>
            <div className="text-xs text-slate-700">{suggestion}</div>
          </div>
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

function getUrgencyBadge({ donationType }) {
  const type = (donationType || "").toLowerCase();
  if (type === "infrastructure" || type === "financial" || type === "devices") {
    return { label: "Critical", class: "text-red-700" };
  }
  if (type === "books") return { label: "Poor", class: "text-amber-700" };
  return { label: "Moderate", class: "text-slate-700" };
}

function getDistrictSuggestion({ donationType }) {
  const type = (donationType || "").toLowerCase();
  if (type === "infrastructure")
    return "Ballari district currently needs infrastructure support.";
  if (type === "devices")
    return "Ballari district currently needs digital devices support.";
  return "Ballari district currently needs infrastructure support.";
}
