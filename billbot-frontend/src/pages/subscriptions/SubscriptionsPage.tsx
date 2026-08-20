import React, { useEffect, useState } from "react";
import {
  Repeat,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle2,
  X,
  CreditCard,
  Tv,
  Film,
  Music,
  Dumbbell,
  Bot,
  Cloud,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Subscription, SubscriptionForm } from "../../types/subscription";
import { subscriptionService } from "../../services/subscriptionService";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { AutoPayModal } from "../../components/autopay/AutoPayModal";

const POPULAR_PRESETS = [
  { name: "Netflix", category: "STREAMING", cycle: "MONTHLY", color: "from-red-600 to-rose-700", icon: Film },
  { name: "Spotify", category: "STREAMING", cycle: "MONTHLY", color: "from-emerald-600 to-teal-700", icon: Music },
  { name: "Amazon Prime", category: "SHOPPING", cycle: "YEARLY", color: "from-blue-600 to-indigo-700", icon: Film },
  { name: "ChatGPT", category: "SOFTWARE", cycle: "MONTHLY", color: "from-teal-600 to-emerald-700", icon: Bot },
  { name: "Gym Membership", category: "FITNESS", cycle: "MONTHLY", color: "from-amber-600 to-orange-700", icon: Dumbbell },
  { name: "Apple iCloud", category: "CLOUD", cycle: "MONTHLY", color: "from-slate-700 to-slate-900", icon: Cloud },
];

export const SubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "PAUSED" | "ALL">("ACTIVE");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [autoPayTarget, setAutoPayTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const curr = user?.currency === "INR" ? "₹" : user?.currency || "₹";

  const [form, setForm] = useState<SubscriptionForm>({
    name: "",
    amount: "",
    currency: user?.currency || "INR",
    billingCycle: "MONTHLY",
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    category: "STREAMING",
    autoDebit: true,
    status: "ACTIVE",
    notes: "",
  });

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAll();
      setSubscriptions(data);
    } catch (err) {
      console.error("Failed to load subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const openCreateModal = (preset?: any) => {
    setEditingSubId(null);
    setError("");
    setForm({
      name: preset?.name || "",
      amount: preset?.amount || "",
      currency: user?.currency || "INR",
      billingCycle: preset?.cycle || "MONTHLY",
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      category: preset?.category || "STREAMING",
      autoDebit: true,
      status: "ACTIVE",
      notes: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSubId(sub.id);
    setError("");
    setForm({
      name: sub.name,
      amount: sub.amount.toString(),
      currency: sub.currency || "INR",
      billingCycle: sub.billingCycle,
      nextBillingDate: sub.nextBillingDate,
      category: sub.category,
      autoDebit: sub.autoDebit,
      status: sub.status,
      notes: sub.notes || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Subscription name is required.");
      return;
    }

    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        amount: amt,
        currency: form.currency,
        billingCycle: form.billingCycle,
        nextBillingDate: form.nextBillingDate,
        category: form.category,
        autoDebit: form.autoDebit,
        status: form.status,
        notes: form.notes?.trim() || undefined,
      };

      if (editingSubId) {
        await subscriptionService.update(editingSubId, payload);
      } else {
        await subscriptionService.create(payload);
      }

      setModalOpen(false);
      await loadSubscriptions();
    } catch (err: any) {
      console.error("Save subscription error", err);
      setError(err.response?.data?.message || "Failed to save subscription.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await subscriptionService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadSubscriptions();
    } catch (err: any) {
      alert("Failed to delete subscription.");
    } finally {
      setSaving(false);
    }
  };

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const monthlyBurn = activeSubs.reduce((sum, s) => sum + (s.monthlyEquivalentAmount || s.amount), 0);
  const yearlyBurn = monthlyBurn * 12;

  const filteredSubs = subscriptions.filter((s) => {
    if (statusFilter === "ACTIVE" && s.status !== "ACTIVE") return false;
    if (statusFilter === "PAUSED" && s.status !== "PAUSED") return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16 antialiased">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-200/60">
            <Sparkles size={13} />
            RECURRING OVERHEADS & AUTOPAY
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1.5">Subscriptions Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit recurring memberships, monitor monthly burn rate, and manage UPI auto-debits.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs shadow-lg shadow-slate-950/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>+ Add Custom Plan</span>
        </button>
      </div>

      {/* Burn Rate Showcase Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 rounded-[2.2rem] p-7 md:p-8 border border-white/15 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/25 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-md">
                Active Burn Telemetry
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeSubs.length} Active Plans
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-pink-200">
                {curr}{monthlyBurn.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-bold text-purple-300">/ month</span>
            </div>

            <p className="text-xs text-slate-300/80">
              Projected yearly subscription outflow: <strong className="text-white font-bold">{curr}{yearlyBurn.toLocaleString("en-IN", { minimumFractionDigits: 2 })} / year</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 lg:pt-0">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <p className="text-[10px] font-bold text-slate-300 uppercase">Auto-Debit Protected</p>
              <p className="text-2xl font-black text-white mt-1">
                {activeSubs.filter((s) => s.autoDebit).length}
              </p>
              <p className="text-[10px] text-purple-300 mt-0.5">UPI & Bank Mandates</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <p className="text-[10px] font-bold text-slate-300 uppercase">Manual Tracking</p>
              <p className="text-2xl font-black text-white mt-1">
                {activeSubs.filter((s) => !s.autoDebit).length}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Requires approval</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Preset Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Popular Recurring Services (1-Click Add)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {POPULAR_PRESETS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                onClick={() => openCreateModal(p)}
                className="group p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center font-bold shadow-xs`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-black text-purple-700 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white px-2.5 py-1 rounded-lg border border-purple-200/60 transition-all">
                    + Add
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 truncate">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 capitalize mt-0.5">{p.category.toLowerCase()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {[
            { id: "ACTIVE", label: "Active Plans" },
            { id: "PAUSED", label: "Paused" },
            { id: "ALL", label: "All Subscriptions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full">
            <LoadingSpinner message="Loading subscriptions..." />
          </div>
        ) : filteredSubs.length > 0 ? (
          filteredSubs.map((sub) => (
            <div
              key={sub.id}
              className={`p-6 rounded-3xl border bg-white transition-all flex flex-col justify-between space-y-4 hover:shadow-lg ${
                sub.status === "PAUSED"
                  ? "border-slate-200 opacity-60"
                  : "border-slate-200/80 hover:border-purple-200 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
                    <Repeat size={20} />
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    sub.autoDebit
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {sub.autoDebit ? "⚡ AutoPay Active" : "Manual Renewal"}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900">{sub.name}</h4>
                <p className="text-xs text-slate-400 capitalize">{sub.category.toLowerCase()} • {sub.billingCycle.toLowerCase()} cycle</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">
                    {curr}{sub.amount.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    ≈ {curr}{(sub.monthlyEquivalentAmount || sub.amount).toFixed(0)}/mo
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Renews: <strong>{sub.nextBillingDate}</strong></span>

                <div className="flex items-center gap-1.5">
                  {!sub.autoDebit && (
                    <button
                      onClick={() =>
                        setAutoPayTarget({
                          type: "SUBSCRIPTION",
                          id: sub.id,
                          name: sub.name,
                          amount: sub.amount,
                          currency: sub.currency,
                          billingCycle: sub.billingCycle,
                          category: sub.category,
                        })
                      }
                      className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-black rounded-lg border border-purple-200 cursor-pointer"
                      title="Setup AutoPay"
                    >
                      ⚡ AutoPay
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(sub)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Subscription"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(sub)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Subscription"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={Repeat}
              title="No Subscriptions Found"
              description="Keep track of Netflix, Spotify, Gym, iCloud and all recurring auto-debits."
              actionText="Add Subscription"
              onAction={() => openCreateModal()}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Subscription Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubId ? "Edit Subscription" : "Add Subscription Plan"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Service / Membership Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Netflix, Spotify, Gym"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Amount ({curr}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-black text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Billing Cycle</label>
              <select
                value={form.billingCycle}
                onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Next Renewal Date</label>
              <input
                type="date"
                required
                value={form.nextBillingDate}
                onChange={(e) => setForm({ ...form, nextBillingDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="STREAMING">🎬 Streaming (Video/Audio)</option>
                <option value="SOFTWARE">💻 Software & AI SaaS</option>
                <option value="FITNESS">🏋️ Fitness & Gym</option>
                <option value="CLOUD">☁️ Cloud Storage</option>
                <option value="SHOPPING">📦 Shopping Membership</option>
                <option value="OTHER">📁 Other Membership</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <input
              type="checkbox"
              id="autoDebit"
              checked={form.autoDebit}
              onChange={(e) => setForm({ ...form, autoDebit: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="autoDebit" className="text-xs font-bold text-slate-700 cursor-pointer">
              Auto-Debit Enabled (Card / UPI mandate auto-renewal)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-sm font-bold shadow-md cursor-pointer"
            >
              {saving ? "Saving..." : editingSubId ? "Update Subscription" : "Add Subscription"}
            </button>
          </div>
        </form>
      </Modal>

      {/* UPI AutoPay & Mandate Modal */}
      <AutoPayModal
        isOpen={!!autoPayTarget}
        target={autoPayTarget}
        onClose={() => setAutoPayTarget(null)}
        onSuccess={loadSubscriptions}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Subscription"
        message={`Are you sure you want to remove the subscription "${deleteTarget?.name}"?`}
        isLoading={saving}
      />
    </div>
  );
};