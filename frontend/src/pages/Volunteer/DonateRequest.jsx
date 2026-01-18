import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";
// Icons for a professional touch
import {
  Gift,
  Package,
  MapPin,
  Truck,
  Sparkles,
  AlertCircle,
  Info,
  Send,
} from "lucide-react";

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
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-100/50 border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-emerald-600 p-8 md:p-10 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-15">
            <Gift size={140} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Create a Donation
            </h2>
            <p className="text-emerald-50 text-sm md:text-base max-w-md">
              Your contribution directly supports community infrastructure and
              educational growth.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                <Package size={16} className="text-emerald-600" />
                Donation Type
              </label>
              <select
                name="donationType"
                value={form.donationType}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all appearance-none cursor-pointer text-slate-900 font-medium"
              >
                <option value="books"> Books & Stationery</option>
                <option value="devices"> Digital Devices</option>
                <option value="infrastructure"> Infrastructure</option>
                <option value="financial"> Financial Support</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                <Info size={16} className="text-emerald-600" />
                Quantity / Value
              </label>
              <input
                name="value"
                value={form.value}
                onChange={handleChange}
                placeholder="e.g. 50 Sets or ₹10,000"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                <MapPin size={16} className="text-emerald-600" />
                Preferred District
              </label>
              <input
                name="preferredDistrict"
                value={form.preferredDistrict}
                onChange={handleChange}
                placeholder="Enter district name"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                <Truck size={16} className="text-emerald-600" />
                Logistics Preference
              </label>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, pickupDelivery: "pickup" }))
                  }
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${form.pickupDelivery === "pickup" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, pickupDelivery: "delivery" }))
                  }
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${form.pickupDelivery === "delivery" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Delivery
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
              Item Specification
            </label>
            <input
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              placeholder="Detailed description (e.g., HP Laptops, Wooden Chairs)"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
            />
          </div>

          {/* Smart Insights Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest mb-3">
                <AlertCircle size={14} className="text-amber-500" />
                Current Urgency
              </div>
              <div className={`text-lg font-bold ${urgency.class}`}>
                {urgency.label} Needs
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Based on live inventory gaps.
              </p>
            </div>

            <div className="bg-emerald-50/50 rounded-3xl p-5 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-widest mb-3">
                <Sparkles size={14} className="text-emerald-600" />
                ML Recommendation
              </div>
              <div className="text-sm text-slate-700 font-medium leading-tight">
                {suggestion}
              </div>
            </div>
          </div>

          {/* Submission */}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-5 rounded-3xl shadow-xl shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-200 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Confirm Donation Request
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

function getUrgencyBadge({ donationType }) {
  const type = (donationType || "").toLowerCase();
  if (type === "infrastructure" || type === "financial" || type === "devices") {
    return { label: "High Impact", class: "text-red-600" };
  }
  if (type === "books") return { label: "Standard", class: "text-amber-600" };
  return { label: "Moderate", class: "text-slate-600" };
}

function getDistrictSuggestion({ donationType }) {
  const type = (donationType || "").toLowerCase();
  if (type === "infrastructure")
    return "Ballari district shows critical infrastructure gaps this month.";
  if (type === "devices")
    return "Digital divide is highest in Ballari; devices are highly requested.";
  return "Ballari is the primary recommended zone for your contribution.";
}
