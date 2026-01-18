import React from "react";

export default function Loader({ size = "md" }) {
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-14 h-14 border-4",
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center justify-center">
      <span
        className={`inline-block rounded-full border-slate-300 border-t-indigo-600 animate-spin ${s}`}
        aria-hidden="true"
      />
    </div>
  );
}
