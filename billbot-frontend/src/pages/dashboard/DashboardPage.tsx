import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Calendar,
  Repeat,
  TrendingUp,
  TrendingDown,
  Plus,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Film,
  HeartPulse,
  Home,
  Sparkles,
  ChevronRight,
  Flame,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PersonalDashboard } from "../../types/dashboard";
import { dashboardService } from "../../services/dashboardService";
import { billDueService } from "../../services/billDueService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { QuickExpenseModal } from "../../components/expenses/QuickExpenseModal";
import { QuickBillModal } from "../../components/bills/QuickBillModal";

interface DashboardPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState<PersonalDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Direct Modal Popups
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getPersonalDashboard();
      setData(res);
    } catch (err) {
      console.error("Failed to load personal dashboard summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const handleExpenseCreated = () => {
      loadDashboard();
    };

    window.addEventListener("billbot-expense-created", handleExpenseCreated);
    return () => {
      window.removeEventListener("billbot-expense-created", handleExpenseCreated);
    };
  }, []);

  const handleQuickPayBill = async (billId: string) => {
    try {
      await billDueService.markAsPaid(billId, true);
      await loadDashboard();
    } catch (err) {
      alert("Failed to settle bill.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case "FOOD":
      case "GROCERIES":
        return Utensils;
      case "TRANSPORT":
        return Car;
      case "SHOPPING":
        return ShoppingBag;
      case "BILLS":
      case "ELECTRICITY":
        return Zap;
      case "ENTERTAINMENT":
        return Film;
      case "HEALTH":
        return HeartPulse;
      case "RENT":
        return Home;
      default:
        return CreditCard;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your personal dashboard..." />;
  }

  const curr = user?.currency === "INR" ? "₹" : user?.currency || "₹";
  const userHandle = user?.username ? `@${user.username}` : user?.name || "there";

  const pieData = (data?.categorySpending || []).map((cat) => ({
    name: cat.category,
    value: cat.amount,
    color: theme.categoryColors[cat.category.toUpperCase()] || theme.colors.primary,
  }));

  const barData = (data?.monthlySpendingTrend || []).map((m) => ({
    month: m.month,
    spent: m.amount,
  }));

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16 antialiased">
      {/* 🌟 DYNAMIC THEMED HERO BANNER */}
      <div className={`relative rounded-[2.2rem] p-7 md:p-10 overflow-hidden ${theme.heroBg} text-white shadow-2xl border ${theme.heroBorder}`}>
        {/* Ambient Glows */}
        <div className={`absolute -top-24 -right-24 w-80 h-80 ${theme.heroGlow1} rounded-full blur-[110px] pointer-events-none`} />
        <div className={`absolute -bottom-24 -left-24 w-80 h-80 ${theme.heroGlow2} rounded-full blur-[100px] pointer-events-none`} />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2.5 flex-1 min-w-0 pr-0 xl:pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full ${theme.accentBadgeBg} border ${theme.accentBadgeBorder} ${theme.accentBadgeText} text-xs font-black backdrop-blur-md shrink-0`}>
                <Sparkles size={13} />
                <span>Personal Finance Suite</span>
              </span>

              {(data?.upcomingDuesCount || 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold shrink-0">
                  <Flame size={13} className="text-rose-400" />
                  <span>{data?.upcomingDuesCount} Bills Due Soon</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="shrink-0">{getGreeting()},</span>
              <span
                className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.heroTextGradient} truncate max-w-[260px] sm:max-w-[420px] md:max-w-[540px] inline-block`}
                title={user?.name || user?.username || ""}
              >
                {userHandle}
              </span>
            </h2>

            <p className="text-xs md:text-sm text-slate-300/90 font-normal leading-relaxed line-clamp-2">
              Real-time daily outlay tracking, bill deadline automation & subscription burn analytics.
            </p>
          </div>

          {/* Action Buttons with Fixed Proportions & Zero Shifting */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 pt-2 xl:pt-0">
            <button
              onClick={() => setExpenseModalOpen(true)}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl ${theme.primaryBtn} font-black text-xs shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap`}
            >
              <Plus size={16} />
              <span>+ Add Expense</span>
            </button>

            <button
              onClick={() => setBillModalOpen(true)}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl ${theme.secondaryBtn} font-bold text-xs shadow-lg backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap`}
            >
              <Calendar size={16} />
              <span>+ Add Bill Due</span>
            </button>

            <button
              onClick={() => onNavigate("scan")}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Camera size={16} style={{ color: theme.colors.primary }} />
              <span>Scan Bill (AI)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📊 4 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Spent this month */}
        <div className={`group ${theme.cardBg} p-6 rounded-3xl border ${theme.cardBorder} shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-700 transition-colors">
              Spent This Month
            </span>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all shadow-xs"
              style={{ backgroundColor: `${theme.colors.primary}18`, color: theme.colors.primary }}
            >
              <CreditCard size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {curr}{(data?.totalSpentThisMonth || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {(data?.monthlySpendChangePercent || 0) >= 0 ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/60">
                  <TrendingUp size={13} />
                  +{data?.monthlySpendChangePercent || 0}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                  <TrendingDown size={13} />
                  {data?.monthlySpendChangePercent || 0}%
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Upcoming Bills & Dues */}
        <div className={`group ${theme.cardBg} p-6 rounded-3xl border ${theme.cardBorder} shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-700 transition-colors">
              Upcoming Bills Due
            </span>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all shadow-xs"
              style={{ backgroundColor: `${theme.colors.primary}18`, color: theme.colors.primary }}
            >
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {curr}{(data?.totalUnpaidDues || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60">
                <Clock size={12} />
                {data?.upcomingDuesCount || 0} pending
              </span>
              <span className="text-[11px] text-slate-400 font-medium">bills to settle</span>
            </div>
          </div>
        </div>

        {/* Card 3: Subscriptions Burn Rate */}
        <div className={`group ${theme.cardBg} p-6 rounded-3xl border ${theme.cardBorder} shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-700 transition-colors">
              Subscriptions Burn
            </span>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all shadow-xs"
              style={{ backgroundColor: `${theme.colors.primary}18`, color: theme.colors.primary }}
            >
              <Repeat size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {curr}{(data?.monthlySubscriptionBurnRate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              <span className="text-xs font-semibold text-slate-400 ml-1">/mo</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/60">
                <ShieldCheck size={12} />
                {data?.activeSubscriptionsCount || 0} active
              </span>
              <span className="text-[11px] text-slate-400 font-medium">auto-renewing</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Logged Transactions */}
        <div className={`group ${theme.cardBg} p-6 rounded-3xl border ${theme.cardBorder} shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-700 transition-colors">
              Recorded Outlays
            </span>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all shadow-xs"
              style={{ backgroundColor: `${theme.colors.primary}18`, color: theme.colors.primary }}
            >
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {data?.totalExpensesCount || 0} Logs
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/60">
                AI + Manual
              </span>
              <span className="text-[11px] text-slate-400 font-medium">ledger count</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📈 VISUAL CHARTS SECTION WITH DYNAMIC THEMED GRADIENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 6-Month Monthly Spending Trend */}
        <div className={`lg:col-span-7 ${theme.cardBg} p-7 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Spending Velocity</h3>
              <p className="text-xs text-slate-400">Monthly expense history over the last 6 months</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
              6 Months
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="themeBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.chartBarFill1} stopOpacity={1} />
                      <stop offset="100%" stopColor={theme.chartBarFill2} stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${curr}${v}`} />
                  <Tooltip
                    formatter={(val: any) => [`${curr}${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, "Total Spent"]}
                    contentStyle={{
                      borderRadius: "16px",
                      border: `1px solid ${theme.colors.primary}40`,
                      boxShadow: `0 10px 25px -5px ${theme.colors.primary}25`,
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar dataKey="spent" fill="url(#themeBarGrad)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No spending data recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className={`lg:col-span-5 ${theme.cardBg} p-7 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Category Allocation</h3>
              <p className="text-xs text-slate-400">Where your funds are allocated</p>
            </div>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${curr}${Number(val).toFixed(2)}`, "Spent"]}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No categorized expenses logged yet
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 max-h-28 overflow-y-auto">
            {pieData.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-700 font-semibold truncate">{cat.name}</span>
                <span className="font-black text-slate-900 ml-auto">{curr}{cat.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 ACTION CARDS: UPCOMING DUES & ACTIVE SUBSCRIPTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bills Alert */}
        <div className={`${theme.cardBg} p-7 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: `${theme.colors.primary}18`, color: theme.colors.primary }}
              >
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Upcoming Bills Due Soon</h3>
                <p className="text-xs text-slate-400">Settle pending dues in 1-click</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("bills")}
              className="text-xs font-extrabold inline-flex items-center gap-1 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              style={{ color: theme.colors.primary }}
            >
              <span>View All</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="space-y-3">
            {(data?.upcomingDues || []).length > 0 ? (
              data?.upcomingDues.slice(0, 4).map((bill) => (
                <div
                  key={bill.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    bill.isOverdue
                      ? "bg-rose-50/60 border-rose-200 shadow-xs"
                      : bill.daysUntilDue <= 3
                      ? "bg-amber-50/50 border-amber-200 shadow-xs"
                      : "bg-slate-50/70 border-slate-200/60 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{bill.billerName}</h4>
                      {bill.autoPay && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[9px] border border-emerald-200 shrink-0">
                          <Zap size={9} className="fill-emerald-600 text-emerald-600" />
                          AutoPay
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>Due: {bill.dueDate}</span>
                      <span>•</span>
                      <span className={`font-bold ${bill.isOverdue ? "text-rose-600" : "text-amber-600"}`}>
                        {bill.isOverdue ? `Overdue by ${Math.abs(bill.daysUntilDue)}d` : `in ${bill.daysUntilDue} days`}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-slate-900">
                      {curr}{bill.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleQuickPayBill(bill.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title="Mark as Paid & record expense"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                🎉 No pending bills due! You are completely on time.
              </div>
            )}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className={`${theme.cardBg} p-7 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: `${theme.colors.primary}18`, color: theme.colors.primary }}
              >
                <Repeat size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Active Subscriptions</h3>
                <p className="text-xs text-slate-400">Recurring auto-debits & streaming plans</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("subscriptions")}
              className="text-xs font-extrabold inline-flex items-center gap-1 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              style={{ color: theme.colors.primary }}
            >
              <span>Manage</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="space-y-3">
            {(data?.activeSubscriptions || []).length > 0 ? (
              data?.activeSubscriptions.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 flex items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{sub.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Renews: {sub.nextBillingDate} • <span className="capitalize font-semibold text-slate-700">{sub.billingCycle.toLowerCase()}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block">
                      {curr}{sub.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: theme.colors.primary }}>
                      {sub.autoDebit ? "Auto-Debit" : "Manual"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No active subscriptions configured.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 💳 RECENT EXPENSES TRANSACTION STREAM */}
      <div className={`${theme.cardBg} p-7 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent Outlays & Purchases</h3>
            <p className="text-xs text-slate-400">Latest recorded spending transactions</p>
          </div>
          <button
            onClick={() => onNavigate("expenses")}
            className="text-xs font-extrabold inline-flex items-center gap-1 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            style={{ color: theme.colors.primary }}
          >
            <span>View All Expenses</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="space-y-2.5">
          {(data?.recentExpenses || []).length > 0 ? (
            data?.recentExpenses.slice(0, 6).map((expense) => {
              const Icon = getCategoryIcon(expense.category);
              return (
                <div
                  key={expense.id}
                  className="p-4 rounded-2xl bg-slate-50/60 hover:bg-slate-100/60 border border-slate-200/60 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: `${theme.colors.primary}15`,
                        borderColor: `${theme.colors.primary}30`,
                        color: theme.colors.primary,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{expense.merchant}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{expense.category}</span> • {expense.expenseDate?.slice(0, 10)} • {expense.paymentMethod || "UPI"}
                      </p>
                    </div>
                  </div>

                  <span className="text-base font-black text-slate-900">
                    - {curr}{expense.amount.toFixed(2)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No transactions logged yet. Click "+ Add Expense" or "Scan Bill (AI)" to add one!
            </div>
          )}
        </div>
      </div>

      {/* Direct Add Expense Modal */}
      <QuickExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSuccess={loadDashboard}
      />

      {/* Direct Add Bill Due Modal */}
      <QuickBillModal
        isOpen={billModalOpen}
        onClose={() => setBillModalOpen(false)}
        onSuccess={loadDashboard}
      />
    </div>
  );
};