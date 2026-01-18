import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVolunteer } from "./VolunteerContext.jsx";
// You can install lucide-react for icons: npm install lucide-react
import { User, ShieldCheck, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useVolunteer();
  const [username, setUsername] = useState(""); // Admin username/id
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Citizen name for signup
  const [email, setEmail] = useState(""); // Citizen email for login/signup
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [isSignUp, setIsSignUp] = useState(false); // Only for citizen
  const [error, setError] = useState("");

  // Fixed Admin credentials (adjust as needed)
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "admin123";

  // LocalStorage helpers for citizen accounts
  const loadCitizenUsers = () => {
    try {
      const raw = localStorage.getItem("citizenUsers");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveCitizenUsers = (users) => {
    localStorage.setItem("citizenUsers", JSON.stringify(users));
  };

  const persistCurrentUser = (data) => {
    localStorage.setItem("currentUser", JSON.stringify(data));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (selectedRole === "admin") {
      // Admin: fixed credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setRole("admin");
        persistCurrentUser({ role: "admin", username });
        navigate("/volunteer/admin");
      } else {
        setError("Invalid admin credentials.");
      }
      return;
    }

    // Citizen: login or sign up (email-based)
    const users = loadCitizenUsers();
    if (isSignUp) {
      if (!name || !email || !password) {
        setError("Please provide name, email, and password.");
        return;
      }
      const emailLc = email.toLowerCase().trim();
      const exists = users.some(
        (u) => (u.email || "").toLowerCase() === emailLc,
      );
      if (exists) {
        setError("Email already registered. Please log in.");
        return;
      }
      const next = [...users, { name: name.trim(), email: emailLc, password }];
      saveCitizenUsers(next);
      setRole("citizen");
      persistCurrentUser({
        role: "citizen",
        name: name.trim(),
        email: emailLc,
      });
      navigate("/volunteer/citizen");
      return;
    } else {
      const emailLc = email.toLowerCase().trim();
      const user = users.find((u) => (u.email || "").toLowerCase() === emailLc);
      if (!user || user.password !== password) {
        setError("Invalid credentials. Please check email/password.");
        return;
      }
      setRole("citizen");
      persistCurrentUser({
        role: "citizen",
        name: user.name || "",
        email: user.email,
      });
      navigate("/volunteer/citizen");
      return;
    }
  };

  return (
    // Outer container: Dark matte finish background
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans antialiased bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="max-w-md w-full relative">
        {/* Decorative background blobs for glass effect enhancement */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-600/30 rounded-full blur-[100px] opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/30 rounded-full blur-[100px] opacity-70 animate-pulse delay-700"></div>

        {/* Header Section */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/90 rounded-2xl shadow-lg shadow-indigo-900/50 mb-4 backdrop-blur-sm border border-white/10">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
            Welcome Back
          </h2>
          <p className="text-slate-400 mt-2">
            Secure access to the Unified Volunteer Portal
          </p>
        </div>

        {/* Main Card: Glassmorphism Container */}
        <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/50 border border-white/10 p-8 overflow-hidden">
          {/* Subtle inner glare effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
            {/* Role Selection - Glass Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("citizen");
                  setIsSignUp(false);
                  setError("");
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 group ${
                  selectedRole === "citizen"
                    ? "border-indigo-500/50 bg-indigo-600/20 text-indigo-300 shadow-[inset_0_0_20px_rgba(79,70,229,0.2)]"
                    : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <User
                  size={24}
                  className={`transition-colors ${
                    selectedRole === "citizen"
                      ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Citizen
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole("admin");
                  setIsSignUp(false);
                  setError("");
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 group ${
                  selectedRole === "admin"
                    ? "border-indigo-500/50 bg-indigo-600/20 text-indigo-300 shadow-[inset_0_0_20px_rgba(79,70,229,0.2)]"
                    : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <ShieldCheck
                  size={24}
                  className={`transition-colors ${
                    selectedRole === "admin"
                      ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Admin
                </span>
              </button>
            </div>

            {/* Input Fields - Dark transparent inputs */}
            <div className="space-y-4">
              {selectedRole === "admin" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Admin Username
                    </label>
                    <input
                      type="text"
                      placeholder="Enter admin username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-500 text-white backdrop-blur-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-500 text-white backdrop-blur-md"
                    />
                  </div>
                </>
              ) : isSignUp ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-500 text-white backdrop-blur-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-500 text-white backdrop-blur-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-500 text-white backdrop-blur-md"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-500 text-white backdrop-blur-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-500 text-white backdrop-blur-md"
                    />
                  </div>
                </>
              )}

              {error && <div className="text-red-400 text-sm">{error}</div>}
            </div>

            {/* Submit Button - Glowing accent */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group border border-indigo-500/50"
            >
              {selectedRole === "citizen" && isSignUp
                ? "Create Account"
                : "Sign In"}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            {/* Citizen-only: Sign up / login toggle */}
            {selectedRole === "citizen" && (
              <div className="text-center">
                {!isSignUp ? (
                  <p className="text-sm text-slate-400">
                    Don't have an account?{" "}
                    <span
                      className="text-indigo-400 font-semibold cursor-pointer hover:text-indigo-300"
                      onClick={() => {
                        setIsSignUp(true);
                        setError("");
                      }}
                    >
                      Sign up
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">
                    Already have an account?{" "}
                    <span
                      className="text-indigo-400 font-semibold cursor-pointer hover:text-indigo-300"
                      onClick={() => {
                        setIsSignUp(false);
                        setError("");
                      }}
                    >
                      Log in
                    </span>
                  </p>
                )}
              </div>
            )}
          </form>

          {/* Footer Link */}
          {/* <div className="mt-8 text-center border-t border-white/10 pt-6 relative z-20">
            <p className="text-sm text-slate-400">
              Need access?{" "}
              <span className="text-indigo-400 font-semibold cursor-pointer hover:text-indigo-300 transition-colors">
                Contact Administrator
              </span>
            </p>
          </div> */}
        </div>

        {/* Helper Note */}
        {/* <p className="text-center text-xs text-slate-500 mt-6 uppercase tracking-[0.2em] drop-shadow-sm relative z-10">
          Secure End-to-End Encryption
        </p> */}
      </div>
    </div>
  );
}
