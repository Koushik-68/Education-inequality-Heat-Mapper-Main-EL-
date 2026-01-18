import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useVolunteer();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("citizen");

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, authenticate here. For now, set role and redirect.
    setRole(selectedRole);
    if (selectedRole === "citizen") navigate("/volunteer/citizen");
    else navigate("/volunteer/admin");
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-md p-6">
      <h2 className="text-lg font-semibold text-[#06203a] mb-2">
        Unified Login
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Single Login. System detects role and redirects automatically.
      </p>
      <form onSubmit={handleLogin} className="space-y-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-slate-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
            />
          </div>
          <div>
            <label className="block mb-1 text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-slate-300 rounded-md px-2 py-1.5 w-full"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-slate-700">Role</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="citizen"
                checked={selectedRole === "citizen"}
                onChange={() => setSelectedRole("citizen")}
              />
              <span>Citizen (Volunteer / Donor)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={selectedRole === "admin"}
                onChange={() => setSelectedRole("admin")}
              />
              <span>Admin (Authority / Verifier)</span>
            </label>
          </div>
        </div>
        <div>
          <button className="bg-[#06203a] text-white px-4 py-2 rounded-md text-sm hover:bg-[#0b2f4f]">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
