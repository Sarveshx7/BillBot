import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingDown,
  Wallet,
  PieChart as PieIcon,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Analytics } from "../../types/dashboard";
import { dashboardService } from "../../services/dashboardService";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { StatCard } from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const aData = await dashboardService.getAnalytics();
        setAnalytics(aData);
      } catch (err) {
        console.error("Analytics load error", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const curr = user?.currency === "INR" ? "₹" : user?.currency || "₹";

  if (loading) {
    return <LoadingSpinner message="Aggregating your personal spending analytics..." />;
  }

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6", "#94a3b8"];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">
          PERSONAL FINANCIAL INTELLIGENCE
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-1">Spending Analytics & Trends</h2>
        <p className="text-xs text-slate-500 mt-1">
          Deep-dive analysis of your daily expenses, top categories, and monthly expenditure trends.
        </p>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Lifetime Spent"
          value={`${curr}${Number(analytics?.totalSpent || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          subtitle={`${analytics?.totalTransactions || 0} recorded outlays`}
          icon={Wallet}
          colorScheme="indigo"
        />
        <StatCard
          title="Average per Expense"
          value={`${curr}${Number(analytics?.averageExpense || 0).toFixed(2)}`}
          subtitle="Typical transaction size"
          icon={TrendingDown}
          colorScheme="emerald"
        />
        <StatCard
          title="Highest Single Spend"
          value={`${curr}${Number(analytics?.highestExpense || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          subtitle="Largest purchase logged"
          icon={Flame}
          colorScheme="amber"
        />
        <StatCard
          title="Total Transactions"
          value={`${analytics?.totalTransactions || 0}`}
          subtitle="Total logged entries"
          icon={CheckCircle2}
          colorScheme="purple"
        />
      </div>

      {/* Monthly Spending Trend */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">6-Month Spending History</h3>
            <p className="text-xs text-slate-500">Track monthly expense trends and see if you are staying on budget</p>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          {analytics?.monthlySpending && analytics.monthlySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlySpending} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "#e2e8f0" }} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${curr}${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val: any) => [`${curr}${Number(val).toLocaleString()}`, "Total Spent"]}
                />
                <Bar dataKey="amount" name="Spent" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">No spending data available</div>
          )}
        </div>
      </div>

      {/* Category Expenses Breakdown */}
      {analytics?.categorySpending && analytics.categorySpending.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Spending by Category</h3>
            <p className="text-xs text-slate-500">Visual distribution of daily expenditure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categorySpending}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {analytics.categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${curr}${Number(val).toLocaleString()}`, "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
              {analytics.categorySpending.map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-bold text-slate-800 uppercase">{cat.category}</span>
                  </div>
                  <span className="font-black text-slate-900">{curr}{cat.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};