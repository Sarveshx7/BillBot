import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Meteors } from "../../components/common/Meteors";

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateLogin, onSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎬 Cinematic Entrance Animation Timeline States
  const [introStage, setIntroStage] = useState<number>(0);
  const [showMeteors, setShowMeteors] = useState(false);

  useEffect(() => {
    // 1. Stage 0 -> 1: Logo finishes at 1.5s
    const t1 = setTimeout(() => {
      setIntroStage(1);
    }, 1500);

    // 2. Stage 1 -> 2: Form appears at 2.4s
    const t2 = setTimeout(() => {
      setIntroStage(2);
    }, 2400);

    // 3. Stage 2 -> 3: Meteors start crescendo once form is in place at 3.2s
    const t3 = setTimeout(() => {
      setIntroStage(3);
      setShowMeteors(true);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), username.trim().toLowerCase() || name.trim().toLowerCase().replace(/\s+/g, "_"), email.trim(), password);
      localStorage.setItem("billbot_theme", "classic");
      onSuccess();
    } catch (err: any) {
      console.error("Registration error", err);
      setError(err.response?.data?.message || "Registration failed. This email or username may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* 🌌 Space Background & Glowing Nebula Orbs (Active from frame 0) */}
      <div className="absolute top-10 left-10 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-glow" />
      <div className="absolute bottom-10 right-10 w-[36rem] h-[36rem] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none animate-glow" style={{ animationDelay: "3s" }} />

      {/* Subtle Starfield Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 🌠 Twinkling Stars + Progressive Crescendo Meteor Shower */}
      <Meteors number={30} color="white" active={showMeteors} />

      {/* 🚀 STEP 1: ONLY BIG CLEAN LOGO POP-UP (Centered over background at t = 0 to 1.5s) */}
      {introStage === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none transition-opacity duration-500">
          <div className="animate-pop-in">
            <img
              src="/logo.png"
              alt="BillBot Logo"
              className="w-36 h-36 md:w-40 md:h-40 rounded-3xl object-contain shadow-2xl drop-shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      )}

      {/* 🌟 STEP 2: MAIN SIGN UP CONTAINER */}
      <div
        className={`w-full max-w-md z-10 transition-all duration-800 ease-out ${
          introStage >= 2
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-12 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-slate-950/60 border border-white/15 backdrop-blur-3xl rounded-3xl p-7 sm:p-9 shadow-2xl ring-1 ring-white/10 relative overflow-hidden text-white">
          {/* Top Shimmer Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="flex items-center gap-3 mb-6">
            <img
              src="/logo.png"
              alt="BillBot Logo"
              className="w-12 h-12 rounded-2xl object-contain shadow-lg shadow-amber-500/20"
            />
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-400 font-medium">Join BillBot Personal Finance</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 mb-5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold animate-pulse backdrop-blur-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <UserIcon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Vipul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-md text-white placeholder-slate-500 text-sm font-semibold focus:bg-white/[0.09] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Username (Handle)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  placeholder="vipul_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-md text-white placeholder-slate-500 text-sm font-semibold focus:bg-white/[0.09] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="vipul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-md text-white placeholder-slate-500 text-sm font-semibold focus:bg-white/[0.09] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-md text-white placeholder-slate-500 text-xs font-semibold focus:bg-white/[0.09] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-md text-white placeholder-slate-500 text-xs font-semibold focus:bg-white/[0.09] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating account..." : "Start Managing Finances"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Already have an account?{" "}
              <button
                onClick={onNavigateLogin}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4 ml-1 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};