import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";
import { useDistrictData } from "./DistrictUtils.js";
import {
  BookOpen,
  MapPin,
  Clock,
  GraduationCap,
  Sparkles,
  Send,
} from "lucide-react";

export default function TeachRequest() {
  const navigate = useNavigate();
  const { submitTeach, profile, setProfile, startLoading } = useVolunteer();
  const [form, setForm] = useState({
    subject: "",
    mode: "offline",
    availability: "",
    myDistrict: "",
    preferredDistrict: "",
    experience: "",
  });

  const suggested = suggestLabel(form);

  // Prefill from saved preferences
  useEffect(() => {
    const prefs = profile?.preferences;
    if (prefs) {
      setForm((prev) => ({
        ...prev,
        subject: prefs.subject || prev.subject,
        mode: prefs.mode || prev.mode,
        availability: prefs.availability || prev.availability,
        myDistrict: prefs.myDistrict || prev.myDistrict,
        preferredDistrict: prefs.preferredDistrict || prev.preferredDistrict,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    startLoading(900);
    const record = submitTeach(form);
    // Persist preferences to profile
    const nextPrefs = {
      subject: form.subject,
      mode: form.mode,
      availability: form.availability,
      myDistrict: form.myDistrict,
      preferredDistrict: form.preferredDistrict,
    };
    setProfile({ ...(profile || {}), preferences: nextPrefs });
    navigate("/volunteer/citizen/requests", { state: { lastId: record.id } });
  };

  // District data for dropdown and suggestions
  const { names, nearestHighInequality, loading } = useDistrictData();
  const suggestions = useMemo(() => {
    if (!form.myDistrict) return [];
    return nearestHighInequality(form.myDistrict, 3, {
      subject: form.subject,
      mode: form.mode,
      availability: form.availability,
    });
  }, [
    form.myDistrict,
    form.subject,
    form.mode,
    form.availability,
    nearestHighInequality,
  ]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Back Button or Breadcrumb could go here */}

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header Branding */}
        <div className="bg-slate-900 p-8 md:p-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BookOpen size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              Volunteer to Teach
            </h2>
            <p className="text-slate-400 max-w-md">
              Your expertise can change lives. Fill in your details, and our
              system will match you with the highest-impact regions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          {/* Section 1: Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <BookOpen size={16} className="text-indigo-500" />
                Subject Expertise
              </label>
              <input
                name="subject"
                placeholder="e.g. Mathematics, Coding, English"
                value={form.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <Clock size={16} className="text-indigo-500" />
                Mode of Teaching
              </label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all appearance-none bg-white text-slate-900"
              >
                <option value="offline">In-Person (Offline)</option>
                <option value="online">Virtual (Online)</option>
                <option value="hybrid">Hybrid Model</option>
              </select>
            </div>
          </div>

          {/* Section 2: Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <Clock size={16} className="text-indigo-500" />
                Availability
              </label>
              <input
                name="availability"
                placeholder="e.g. Weekends, 4 hrs/week"
                value={form.availability}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <MapPin size={16} className="text-indigo-500" />
                My District
              </label>
              <select
                name="myDistrict"
                value={form.myDistrict}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all appearance-none bg-white text-slate-900"
              >
                <option value="">Select your district</option>
                {names.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <MapPin size={16} className="text-indigo-500" />
                Preferred District
              </label>
              <select
                name="preferredDistrict"
                value={form.preferredDistrict}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all appearance-none bg-white text-slate-900"
              >
                <option value="">Select preferred district</option>
                {names.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.myDistrict && (
            <div className="border border-indigo-100 bg-indigo-50/50 rounded-[1.5rem] p-5">
              <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 mb-2">
                Nearby High-Inequality
              </div>
              {loading ? (
                <div className="text-xs text-slate-500">
                  Loading suggestions…
                </div>
              ) : suggestions.length ? (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() =>
                        setForm((p) => ({ ...p, preferredDistrict: s.name }))
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-indigo-100 text-slate-700 hover:bg-indigo-600 hover:text-white transition"
                      title={`EII: ${s.eii ?? "-"} • ${Math.round(s.distance)} km`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  No nearby suggestions found.
                </div>
              )}
            </div>
          )}

          {/* Section 3: Experience */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
              <GraduationCap size={16} className="text-indigo-500" />
              Brief Experience (Optional)
            </label>
            <textarea
              name="experience"
              rows="3"
              placeholder="Tell us a bit about your background..."
              value={form.experience}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          {/* ML Insight Component */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative flex items-start gap-4 bg-indigo-50/50 border border-indigo-100 rounded-[1.5rem] p-5">
              <div className="bg-white p-2.5 rounded-xl shadow-sm">
                <Sparkles className="text-indigo-600 animate-pulse" size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 mb-1">
                  AI Placement Insight
                </div>
                <div className="text-sm text-slate-700 font-medium leading-relaxed">
                  {suggested}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Submit Request
              <Send size={18} />
            </button>
            <p className="text-xs text-slate-400 text-center md:text-left">
              By submitting, you agree to undergo a brief verification process
              by our admin team.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function suggestLabel({ subject }) {
  const s = (subject || "").toLowerCase();
  if (s.includes("math") || s.includes("science"))
    return "High demand detected! Your skills are most needed in Kalaburagi for the upcoming semester.";
  if (s.includes("english") || s.includes("language"))
    return "Based on literacy trends, your language skills are most needed in Bidar.";
  if (s.includes("computer") || s.includes("coding"))
    return "Tech gap identified! Your coding skills are most needed in Ballari's digital labs.";
  return "Impact Suggestion: Your teaching skills are most needed in Kalaburagi based on current vacancies.";
}
