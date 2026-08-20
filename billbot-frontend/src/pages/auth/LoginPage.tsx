import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ScanLine,
  Repeat,
} from "lucide-react";
import { Meteors } from "../../components/common/Meteors";

interface LoginPageProps {
  onNavigateRegister: () => void;
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateRegister, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎬 Cinematic Entrance Animation Timeline States
  // Background & Stars: Active immediately from t = 0
  // Stage 0: Big Clean Logo Pop in center (0s - 1.5s)
  // Stage 1: Left Side Slides In completely (1.5s - 2.6s)
  // Stage 2: Right Form Card Slides In (2.6s - 3.4s)
  // Stage 3: Meteor Shower Starts: One-by-One -> All Together -> High Density (3.4s+)
  const [introStage, setIntroStage] = useState<number>(0);
  const [showMeteors, setShowMeteors] = useState(false);

  useEffect(() => {
    // 1. Stage 0 -> 1: Logo intro completes at 1.5s, left side slides in
    const t1 = setTimeout(() => {
      setIntroStage(1);
    }, 1500);

    // 2. Stage 1 -> 2: Left side has completely appeared; right form slides in at 2.6s
    const t2 = setTimeout(() => {
      setIntroStage(2);
    }, 2600);

    // 3. Stage 2 -> 3: Form appears; meteor shower starts progressively at 3.4s
    const t3 = setTimeout(() => {
      setIntroStage(3);
      setShowMeteors(true);
    }, 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      onSuccess();
    } catch (err: any) {
      console.error("Login error", err);
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    try {
      setLoading(true);
      await login("vipul@billbot.com", "password123");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* 🌌 Space Background & Glowing Nebula Orbs (Active from frame 0) */}
      <div className="absolute top-10 left-10 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-glow" />
      <div className="absolute bottom-10 right-10 w-[36rem] h-[36rem] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none animate-glow" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle Starfield Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 🌠 Twinkling Stars + Progressive Crescendo Meteor Shower (Starts when form appears) */}
      <Meteors number={36} color="white" active={showMeteors} />

      {/* 🚀 STEP 1: ONLY BIG CLEAN LOGO POP-UP (Overlay centered over background at t = 0 to 1.5s) */}
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

      {/* 🌟 MAIN APP CONTAINER */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* 📝 STEP 2: Left Side Slides In Smoothly (Complete before form appears) */}
        <div
          className={`hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4 transition-all duration-800 ease-out ${
            introStage >= 1
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-16 pointer-events-none"
          }`}
        >
          <div className="space-y-4">
            {/* Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold backdrop-blur-md">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Personal Finance & Bill Manager</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
              Master your daily spends & never miss a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                due date.
              </span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Effortlessly log daily outlays, manage recurring subscriptions, schedule bill deadlines, and auto-parse paper receipts with AI OCR.
            </p>
          </div>

          {/* Floating Transparent Glass Showcase Cards */}
          <div className="space-y-3.5 relative">
            {/* Card 1: Bill Due Alert */}
            <div className="p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/15 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 flex items-center justify-between gap-4 animate-float transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-xs">
                  <Zap size={20} className="fill-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Tata Power Electricity Bill</h4>
                  <p className="text-[11px] text-amber-300 font-semibold">Due in 2 days • ₹1,850.00</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 shadow-2xs">
                1-Click Pay
              </span>
            </div>

            {/* Card 2: AI Receipt Scan */}
            <div className="p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/15 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 flex items-center justify-between gap-4 animate-float-delayed transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold shadow-xs">
                  <ScanLine size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">DMart Supermarket Receipt</h4>
                  <p className="text-[11px] text-slate-400 font-medium">AI OCR Extracted • Groceries</p>
                </div>
              </div>
              <span className="text-xs font-black text-indigo-300">₹3,420.00</span>
            </div>

            {/* Card 3: Subscription Burn Rate */}
            <div className="p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/15 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 flex items-center justify-between gap-4 animate-float-reverse transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold shadow-xs">
                  <Repeat size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Netflix + Spotify + iCloud</h4>
                  <p className="text-[11px] text-purple-300 font-semibold">3 Active Plans • Auto-Debit</p>
                </div>
              </div>
              <span className="text-xs font-black text-purple-300">₹948/mo</span>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 text-xs text-slate-400 font-bold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>JWT Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-indigo-400" />
              <span>Zero Ads</span>
            </div>
          </div>
        </div>

        {/* 🔐 STEP 3: Right Column - Form Appears AFTER Left Side is Completely Visible */}
        <div
          className={`lg:col-span-6 w-full max-w-md mx-auto transition-all duration-800 ease-out ${
            introStage >= 2
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-12 scale-95 pointer-events-none"
          }`}
        >
          <div className="bg-slate-950/60 border border-white/15 backdrop-blur-3xl rounded-3xl p-7 sm:p-9 shadow-2xl ring-1 ring-white/10 relative overflow-hidden text-white">
            {/* Top Shimmer Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="BillBot Logo"
                  className="w-12 h-12 rounded-2xl object-contain shadow-lg shadow-amber-500/20"
                />
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Sign In</h2>
                  <p className="text-xs text-slate-400 font-medium">Access your BillBot assistant</p>
                </div>
              </div>

              {/* Demo Account Quick Pill */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-300 border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
                title="Instant login with demo account"
              >
                <Zap size={12} className="text-amber-400 fill-amber-400" />
                <span>Demo User</span>
              </button>
            </div>

            {error && (
              <div className="p-3.5 mb-5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold animate-pulse backdrop-blur-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="vipul@billbot.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-md text-white placeholder-slate-500 text-sm font-semibold focus:bg-white/[0.09] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-md text-white placeholder-slate-500 text-sm font-semibold focus:bg-white/[0.09] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Authenticating..." : "Sign In to Dashboard"}
                <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400 font-medium">
                New to BillBot?{" "}
                <button
                  onClick={onNavigateRegister}
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4 ml-1 transition-colors cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>

          {/* Bottom Badge */}
          <div className="mt-4 text-center">
            <p className="text-[11px] font-bold text-slate-400">
              ⚡ Powered by Spring Boot 3.4 & PaddleOCR AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};