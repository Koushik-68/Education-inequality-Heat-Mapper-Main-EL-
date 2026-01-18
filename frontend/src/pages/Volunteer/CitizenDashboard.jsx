import React from "react";
import { Link } from "react-router-dom";
// Icons make the UI feel intuitive and modern
import {
  BookOpen,
  HeartHandshake,
  LayoutList,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function CitizenDashboard() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Citizen Hub
          </h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            Empowering communities through verified requests and transparency.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card
            title="Teach"
            subtitle="Volunteer Request"
            description="Share your knowledge in districts that need educators the most."
            to="/volunteer/citizen/teach"
            icon={<BookOpen className="w-6 h-6" />}
            theme="indigo"
          />
          <Card
            title="Donate"
            subtitle="Resource Request"
            description="Contribute essential supplies or funds to verified causes."
            to="/volunteer/citizen/donate"
            icon={<HeartHandshake className="w-6 h-6" />}
            theme="emerald"
          />
          <Card
            title="Track"
            subtitle="My Requests"
            description="Monitor the real-time status and impact of your contributions."
            to="/volunteer/citizen/requests"
            icon={<LayoutList className="w-6 h-6" />}
            theme="slate"
          />
        </div>

        {/* Feature/Info Section */}
        <InfoBlock />
      </div>
    </div>
  );
}

function Card({ title, subtitle, description, to, icon, theme }) {
  const themes = {
    indigo:
      "hover:border-indigo-500 bg-indigo-50/30 text-indigo-700 ring-indigo-50",
    emerald:
      "hover:border-emerald-500 bg-emerald-50/30 text-emerald-700 ring-emerald-50",
    slate: "hover:border-slate-500 bg-slate-50/30 text-slate-700 ring-slate-50",
  };

  const iconBg = {
    indigo: "bg-indigo-600 text-white",
    emerald: "bg-emerald-600 text-white",
    slate: "bg-slate-800 text-white",
  };

  return (
    <Link
      to={to}
      className={`group relative flex flex-col p-6 rounded-3xl border-2 border-transparent bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${themes[theme]}`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg ${iconBg[theme]}`}
      >
        {icon}
      </div>

      <div className="mb-2">
        <span className="text-[10px] uppercase tracking-[0.15em] font-bold opacity-70">
          {subtitle}
        </span>
        <h3 className="text-xl font-bold text-slate-900 mt-1">{title}</h3>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>

      <div className="mt-6 flex items-center text-sm font-semibold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Get Started
        <span className="group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </Link>
  );
}

function InfoBlock() {
  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl shadow-slate-300">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-500/30">
            <Sparkles size={14} />
            Smart Governance
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Optimized Impact Tracking
          </h2>
          <p className="text-slate-400 leading-relaxed mb-6 max-w-lg">
            Our system utilizes intelligent mapping to ensure your contributions
            reach the regions with the highest urgency and potential for growth.
          </p>
        </div>

        <div className="flex-1 w-full grid grid-cols-1 gap-4">
          <FeatureItem text="ML-driven district impact suggestions" />
          <FeatureItem text="Real-time request lifecycle transparency" />
          <FeatureItem text="Verified governance & admin accountability" />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
      <div className="bg-emerald-500/20 p-1.5 rounded-full">
        <CheckCircle2 className="text-emerald-400 w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-slate-200">{text}</span>
    </div>
  );
}
