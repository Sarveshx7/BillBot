import React, { useEffect, useState } from "react";
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Wifi,
  Home,
  CreditCard,
  Building,
  Smartphone,
  Droplets,
  Flame,
  Shield,
  Layers,
  Pencil,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { BillDue, BillDueForm } from "../../types/billDue";
import { billDueService } from "../../services/billDueService";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { AutoPayModal } from "../../components/autopay/AutoPayModal";

export const BillsDuePage: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<BillDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"ALL" | "UNPAID" | "OVERDUE" | "PAID" | "AUTOPAY">("UNPAID");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BillDue | null>(null);
  const [autoPayTarget, setAutoPayTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const curr = user?.currency === "INR" ? "₹" : user?.currency || "₹";

  const [form, setForm] = useState<BillDueForm>({
    billerName: "",
    amount: "",
    currency: user?.currency || "INR",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    category: "ELECTRICITY",
    recurringFrequency: "MONTHLY",
    autoPay: false,
    notes: "",
  });

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await billDueService.getAll();
      setBills(data);
    } catch (err) {
      console.error("Failed to load bills", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const openCreateModal = () => {
    setEditingBillId(null);
    setError("");
    setForm({
      billerName: "",
      amount: "",
      currency: user?.currency || "INR",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      category: "ELECTRICITY",
      recurringFrequency: "MONTHLY",
      autoPay: false,
      notes: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (bill: BillDue) => {
    setEditingBillId(bill.id);
    setError("");
    setForm({
      billerName: bill.billerName,
      amount: bill.amount.toString(),
      currency: bill.currency || "INR",
      dueDate: bill.dueDate,
      category: bill.category,
      recurringFrequency: bill.recurringFrequency,
      autoPay: bill.autoPay,
      notes: bill.notes || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.billerName.trim()) {
      setError("Biller name is required.");
      return;
    }

    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid bill amount greater than 0.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        billerName: form.billerName.trim(),
        amount: amt,
        currency: form.currency,
        dueDate: form.dueDate,
        category: form.category,
        recurringFrequency: form.recurringFrequency,
        autoPay: form.autoPay,
        notes: form.notes?.trim() || undefined,
      };

      if (editingBillId) {
        await billDueService.update(editingBillId, payload);
      } else {
        await billDueService.create(payload);
      }

      setModalOpen(false);
      await loadBills();
    } catch (err: any) {
      console.error("Save bill error", err);
      setError(err.response?.data?.message || "Failed to save bill.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (billId: string) => {
    try {
      setSaving(true);
      await billDueService.markAsPaid(billId, true);
      await loadBills();
    } catch (err: any) {
      alert("Failed to mark bill as paid.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await billDueService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadBills();
    } catch (err: any) {
      alert("Failed to delete bill.");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case "ELECTRICITY":
        return Zap;
      case "WATER":
        return Droplets;
      case "GAS":
        return Flame;
      case "INTERNET":
      case "BROADBAND":
        return Wifi;
      case "RENT":
      case "MORTGAGE":
        return Home;
      case "CREDIT_CARD":
        return CreditCard;
      case "INSURANCE":
        return Shield;
      case "MOBILE":
      case "PHONE":
        return Smartphone;
      default:
        return Building;
    }
  };

  const unpaidBills = bills.filter((b) => !b.isPaid && !b.isOverdue);
  const overdueBills = bills.filter((b) => !b.isPaid && b.isOverdue);
  const paidBills = bills.filter((b) => b.isPaid);
  const autoPayBills = bills.filter((b) => b.autoPay);

  const totalUnpaidAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const totalOverdueAmount = overdueBills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaidAmount = paidBills.reduce((sum, b) => sum + b.amount, 0);

  const filteredBills = bills.filter((bill) => {
    if (filter === "UNPAID" && (bill.isPaid || bill.isOverdue)) return false;
    if (filter === "OVERDUE" && (bill.isPaid || !bill.isOverdue)) return false;
    if (filter === "PAID" && !bill.isPaid) return false;
    if (filter === "AUTOPAY" && !bill.autoPay) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        bill.billerName.toLowerCase().includes(q) ||
        bill.category.toLowerCase().includes(q) ||
        (bill.notes && bill.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16 antialiased">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
            <Sparkles size={13} />
            DUE DATES & UPI AUTOPAY
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1.5">Upcoming Bills & Dues</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Never miss utility payments, broadband bills, house rent, or credit card dues with UPI AutoPay.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs shadow-lg shadow-slate-950/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>+ Add Upcoming Bill</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Bills ({unpaidBills.length})
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {curr}{totalUnpaidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
              Overdue Dues ({overdueBills.length})
            </p>
            <p className="text-2xl font-black text-rose-600 mt-0.5">
              {curr}{totalOverdueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Settled ({paidBills.length})
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">
              {curr}{totalPaidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
            <Zap size={22} className="fill-purple-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              AutoPay Active ({autoPayBills.length})
            </p>
            <p className="text-2xl font-black text-purple-900 mt-0.5">
              {autoPayBills.length} Mandates
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bills (Tata Power, Airtel, Rent...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: "UNPAID", label: "Unpaid & Upcoming" },
            { id: "OVERDUE", label: "Overdue Dues" },
            { id: "AUTOPAY", label: "⚡ AutoPay Bills" },
            { id: "PAID", label: "Paid / Settled" },
            { id: "ALL", label: "All Bills" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bills Cards List */}
      <div className="space-y-3.5">
        {loading ? (
          <LoadingSpinner message="Loading your bills and dues..." />
        ) : filteredBills.length > 0 ? (
          filteredBills.map((bill) => {
            const Icon = getCategoryIcon(bill.category);
            return (
              <div
                key={bill.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  bill.isPaid
                    ? "bg-white/80 border-slate-200/80 opacity-80"
                    : bill.isOverdue
                    ? "bg-rose-50/50 border-rose-200 shadow-sm"
                    : bill.daysUntilDue <= 3
                    ? "bg-amber-50/40 border-amber-200 shadow-sm"
                    : "bg-white border-slate-200/80 hover:border-indigo-200 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-xs ${
                      bill.isPaid
                        ? "bg-emerald-50 text-emerald-600"
                        : bill.isOverdue
                        ? "bg-rose-100 text-rose-700"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-extrabold text-slate-900">{bill.billerName}</h4>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {bill.category}
                      </span>
                      {bill.autoPay && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200 shadow-2xs">
                          <Zap size={10} className="fill-emerald-600 text-emerald-600" />
                          UPI AutoPay
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>Due: <strong className="text-slate-800">{bill.dueDate}</strong></span>
                      <span>•</span>
                      <span>{bill.recurringFrequency}</span>
                      {bill.notes && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 font-medium">{bill.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-lg font-black text-slate-900 block">
                      {curr}{bill.amount.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        bill.isPaid
                          ? "text-emerald-600"
                          : bill.isOverdue
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {bill.isPaid
                        ? `✓ Paid on ${bill.paidDate || "settled"}`
                        : bill.isOverdue
                        ? `🚨 Overdue by ${Math.abs(bill.daysUntilDue)} days`
                        : `🔔 Due in ${bill.daysUntilDue} days`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!bill.isPaid && !bill.autoPay && (
                      <button
                        onClick={() =>
                          setAutoPayTarget({
                            type: "BILL",
                            id: bill.id,
                            name: bill.billerName,
                            amount: bill.amount,
                            currency: bill.currency,
                            dueDate: bill.dueDate,
                            category: bill.category,
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-black border border-purple-200 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                        title="Link Google Pay, PhonePe, or Netbanking for automated recurring debit"
                      >
                        <Zap size={13} className="fill-purple-600" />
                        <span>AutoPay</span>
                      </button>
                    )}

                    {!bill.isPaid && (
                      <button
                        onClick={() => handleMarkPaid(bill.id)}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Mark as Paid
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(bill)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Edit Bill"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(bill)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Bill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Bills Found"
            description="You don't have any bills matching this filter. Schedule a new bill to track deadlines."
            actionText="Schedule a Bill"
            onAction={openCreateModal}
          />
        )}
      </div>

      {/* Add / Edit Bill Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBillId ? "Edit Bill Details" : "Schedule Upcoming Bill"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Biller / Service Provider <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tata Power, Airtel Broadband, House Rent"
              value={form.billerName}
              onChange={(e) => setForm({ ...form, billerName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-black text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ELECTRICITY">⚡ Electricity</option>
                <option value="INTERNET">🌐 Internet & Broadband</option>
                <option value="RENT">🏠 Rent & Maintenance</option>
                <option value="CREDIT_CARD">💳 Credit Card Bill</option>
                <option value="MOBILE">📱 Mobile Recharge</option>
                <option value="WATER">💧 Water Bill</option>
                <option value="GAS">🔥 Piped Gas</option>
                <option value="INSURANCE">🛡️ Insurance Premium</option>
                <option value="OTHER">📁 Other Utilities</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Frequency</label>
              <select
                value={form.recurringFrequency}
                onChange={(e) => setForm({ ...form, recurringFrequency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
                <option value="ONE_TIME">One-Time Due</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">AutoPay Enabled</p>
              <p className="text-[11px] text-slate-500">Auto-debit via UPI/Bank mandate on due date</p>
            </div>
            <input
              type="checkbox"
              checked={form.autoPay}
              onChange={(e) => setForm({ ...form, autoPay: e.target.checked })}
              className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Consumer No.</label>
            <textarea
              rows={2}
              placeholder="e.g. Consumer ID: 1092834, due by 5 PM"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
              {saving ? "Saving..." : editingBillId ? "Update Bill" : "Schedule Bill"}
            </button>
          </div>
        </form>
      </Modal>

      {/* UPI AutoPay & Mandate Modal */}
      <AutoPayModal
        isOpen={!!autoPayTarget}
        target={autoPayTarget}
        onClose={() => setAutoPayTarget(null)}
        onSuccess={loadBills}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Bill Due"
        message={`Are you sure you want to remove the bill "${deleteTarget?.billerName}" of ${curr}${deleteTarget?.amount}?`}
        isLoading={saving}
      />
    </div>
  );
};