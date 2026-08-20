import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme, ThemeId } from "../../context/ThemeContext";
import {
  User as UserIcon,
  Mail,
  Phone,
  AtSign,
  Globe,
  DollarSign,
  ShieldCheck,
  Save,
  CheckCircle2,
  Palette,
  Sparkles,
  Check,
  Target,
  FileText,
  Clock,
  Lock,
  Zap,
  Smartphone,
  Building,
  Bell,
  Send,
  Radio,
  CheckCheck,
} from "lucide-react";
import { UserProfileRequest } from "../../types/auth";
import {
  isPushSupported,
  getPushPermission,
  requestPushPermission,
  sendBrowserNotification,
} from "../../utils/browserPush";
import { notificationService } from "../../services/notificationService";

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { themeId, theme, setTheme, availableThemes } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [businessPhone, setBusinessPhone] = useState(user?.businessPhone || "");
  const [currency, setCurrency] = useState(user?.currency || "INR");
  const [timezone, setTimezone] = useState(user?.timezone || "Asia/Kolkata");
  const [monthlyBudget, setMonthlyBudget] = useState("50000");
  const [bio, setBio] = useState(user?.businessAddress || "Tracking daily expenses & staying on time for bills.");
  const [primaryUpiId, setPrimaryUpiId] = useState(() => localStorage.getItem("billbot_primary_upi_id") || "");
  const [primaryBank, setPrimaryBank] = useState(() => localStorage.getItem("billbot_primary_bank") || "");

  // Notifications State
  const [pushStatus, setPushStatus] = useState<NotificationPermission>("default");
  const [emailReminders, setEmailReminders] = useState(true);
  const [autoPayAlerts, setAutoPayAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [themeChangeToast, setThemeChangeToast] = useState("");
  const [notificationToast, setNotificationToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPushStatus(getPushPermission());
  }, []);

  const handleThemeSelect = (id: ThemeId) => {
    setTheme(id);
    const selected = availableThemes.find((t) => t.id === id);
    setThemeChangeToast(`Theme switched to "${selected?.name}"!`);
    setTimeout(() => setThemeChangeToast(""), 3500);
  };

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setPushStatus(getPushPermission());
    if (granted) {
      sendBrowserNotification("BillBot Push Notifications Enabled! 🚀", {
        body: "You will now receive timely desktop reminders for upcoming bills & auto-debits.",
      });
      setNotificationToast("Browser Push Notifications enabled successfully!");
      setTimeout(() => setNotificationToast(""), 4000);
    }
  };

  const handleSendTestPush = async () => {
    try {
      setTestPushLoading(true);
      if (getPushPermission() !== "granted") {
        await requestPushPermission();
        setPushStatus(getPushPermission());
      }

      sendBrowserNotification("⏰ BillBot Due Reminder: Tata Power", {
        body: "Your electricity bill of ₹1,450 is due in 2 days. UPI AutoPay is scheduled.",
      });

      await notificationService.sendTestPush();
      setNotificationToast("Test push notification dispatched to your browser & in-app bell!");
      setTimeout(() => setNotificationToast(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setTestPushLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setTestEmailLoading(true);
      await notificationService.sendTestEmail(user?.email);
      setNotificationToast(`Test email reminder sent to ${user?.email || "your registered email"}!`);
      setTimeout(() => setNotificationToast(""), 4500);
    } catch (err) {
      console.error(err);
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSavedSuccess(false);

    if (!name.trim()) {
      setError("User name is required.");
      return;
    }

    try {
      setSaving(true);
      const req: UserProfileRequest = {
        name: name.trim(),
        username: username.trim().toLowerCase() || undefined,
        businessPhone: businessPhone.trim() || undefined,
        businessAddress: bio.trim() || undefined,
        currency,
        timezone,
      };

      // Save Primary UPI and Bank into localStorage
      localStorage.setItem("billbot_primary_upi_id", primaryUpiId.trim());
      localStorage.setItem("billbot_primary_bank", primaryBank.trim());

      await updateProfile(req);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error("Profile update error", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const userInitial = (name || user?.name || "U").charAt(0).toUpperCase();
  const displayHandle = username || user?.username || "user";

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 antialiased">
      {/* Page Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
          <Sparkles size={13} />
          ACCOUNT & NOTIFICATIONS
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1.5">Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal profile, visual themes, linked UPI AutoPay accounts, and push/email alerts.
        </p>
      </div>

      {/* Theme & Notification Toasts */}
      {themeChangeToast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-pulse">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{themeChangeToast}</span>
        </div>
      )}

      {notificationToast && (
        <div className="p-4 bg-indigo-50 text-indigo-800 rounded-2xl border border-indigo-200 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-pulse">
          <Bell size={18} className="text-indigo-600" />
          <span>{notificationToast}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>Your personal profile, UPI accounts, and preferences have been updated!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium">
          {error}
        </div>
      )}

      {/* 🌟 UPGRADED USER PROFILE SHOWCASE HERO */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 rounded-[2rem] p-7 md:p-8 border border-white/15 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-3xl text-slate-950 font-black text-2xl flex items-center justify-center shadow-xl ring-4 ring-white/10"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {userInitial}
              </div>
              <div className="w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-slate-950 absolute -bottom-1 -right-1 flex items-center justify-center">
                <Check size={11} className="text-white font-black" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">{name || "Personal Account"}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  <ShieldCheck size={12} />
                  Verified Member
                </span>
              </div>
              <p className="text-xs font-semibold text-indigo-300">@{displayHandle}</p>
              <p className="text-xs text-slate-400 font-medium">{user?.email || "user@billbot.com"}</p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 text-xs">
            <span className="px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-slate-200 font-bold backdrop-blur-md">
              Primary UPI: <strong className="text-emerald-300 font-extrabold">{primaryUpiId}</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-slate-200 font-bold backdrop-blur-md">
              Push Alerts: <strong className={pushStatus === "granted" ? "text-emerald-300 font-extrabold" : "text-amber-300 font-extrabold"}>{pushStatus === "granted" ? "Active" : "Disabled"}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 🔔 PUSH & EMAIL NOTIFICATION CENTER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Push & Email Notifications</h3>
              <p className="text-xs text-slate-400">Configure real-time bill reminders, overdue alerts & AutoPay receipts</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            Daily Scan: 9:00 AM
          </span>
        </div>

        {/* Browser Push Permission Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Radio size={16} className={pushStatus === "granted" ? "text-emerald-600 animate-pulse" : "text-slate-400"} />
              <h4 className="text-sm font-extrabold text-slate-900">Browser Web Push Notifications</h4>
            </div>
            <p className="text-xs text-slate-500">
              {pushStatus === "granted"
                ? "✓ Real-time desktop alerts are active for all bill due dates."
                : "Grant permission to receive popup notifications on your screen before bills expire."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pushStatus !== "granted" ? (
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Enable Push Alerts
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                <Check size={14} />
                Enabled
              </span>
            )}
          </div>
        </div>

        {/* Email & Alert Preferences Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div>
              <p className="text-xs font-bold text-slate-900">24h & 48h Pre-Due Email Reminders</p>
              <p className="text-[11px] text-slate-400">Receive automated reminder emails before electricity, broadband, and credit card dues</p>
            </div>
            <input
              type="checkbox"
              checked={emailReminders}
              onChange={(e) => setEmailReminders(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div>
              <p className="text-xs font-bold text-slate-900">AutoPay Settlement Confirmations</p>
              <p className="text-[11px] text-slate-400">Instant email & push receipts when UPI AutoPay executes a recurring debit</p>
            </div>
            <input
              type="checkbox"
              checked={autoPayAlerts}
              onChange={(e) => setAutoPayAlerts(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div>
              <p className="text-xs font-bold text-slate-900">Weekly Sunday Spending Digest</p>
              <p className="text-[11px] text-slate-400">Weekly breakdown of daily expenses and upcoming bills for the week ahead</p>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Live Test Alert Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={testPushLoading}
            onClick={handleSendTestPush}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Radio size={14} />
            <span>{testPushLoading ? "Dispatching..." : "Send Test Push Alert"}</span>
          </button>

          <button
            type="button"
            disabled={testEmailLoading}
            onClick={handleSendTestEmail}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all border border-slate-200 cursor-pointer"
          >
            <Mail size={14} />
            <span>{testEmailLoading ? "Sending Email..." : "Send Test Email Reminder"}</span>
          </button>
        </div>
      </div>

      {/* 🎨 COLOR THEMES GALLERY */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Color Themes Gallery</h3>
              <p className="text-xs text-slate-400">Choose a color theme that matches your personal taste</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-slate-500">
            Active: <strong className="text-slate-900">{theme.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableThemes.map((t) => {
            const isSelected = themeId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handleThemeSelect(t.id)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "border-slate-950 bg-slate-50/90 shadow-lg scale-[1.02]"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-xs">
                    <Check size={14} className="font-black" />
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-tight pr-7">{t.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.tagline}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors.primary }}
                      title="Primary Accent"
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors.secondary }}
                      title="Secondary Dark"
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors.accent }}
                      title="Highlight Accent"
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: t.colors.surface }}
                      title="Surface Background"
                    />
                  </div>

                  <span
                    className={`text-xs font-black px-3 py-1 rounded-xl transition-all ${
                      isSelected
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? "Active" : "Select"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 👤 PERSONAL PROFILE FORM */}
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Personal Details */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <UserIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-400">Your display identity and primary contact info</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Unique @Username Handle
              </label>
              <div className="relative">
                <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Email Address (Account ID)
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || "user@billbot.com"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed"
                />
                <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Mobile Phone
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Financial Bio & Goal Note
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Budgeting for apartment rent & emergency fund."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed text-slate-800"
            />
          </div>
        </div>

        {/* ⚡ LINKED UPI & AUTOPAY PAYMENT RAILS */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                <Zap size={20} className="fill-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Linked UPI & AutoPay Account</h3>
                <p className="text-xs text-slate-400">Default payment VPA and bank for 1-click AutoPay mandates</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200">
              <ShieldCheck size={13} />
              UPI 2.0 Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Primary UPI ID / VPA
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank"
                  value={primaryUpiId}
                  onChange={(e) => setPrimaryUpiId(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Supports Google Pay, PhonePe, Paytm, CRED & BHIM.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Primary Debit Bank
              </label>
              <select
                value={primaryBank}
                onChange={(e) => setPrimaryBank(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Select Bank (Optional) --</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Authorized for NPCI e-Mandate auto-debit.</p>
            </div>
          </div>
        </div>

        {/* Currency & Regional Preferences */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Currency & Regional Preferences</h3>
              <p className="text-xs text-slate-400">Set standard currency symbols and regional timezone</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="AED">AED (د.إ - UAE Dirham)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
                <option value="AUD">AUD ($ - Australian Dollar)</option>
                <option value="SGD">SGD ($ - Singapore Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs shadow-xl shadow-slate-950/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? "Saving Changes..." : "Save Profile Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};