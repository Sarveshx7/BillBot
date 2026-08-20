import React, { useEffect, useState } from "react";
import {
  Receipt,
  Plus,
  Search,
  Pencil,
  Trash2,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  HeartPulse,
  Home,
  GraduationCap,
  Plane,
  CreditCard,
  TrendingDown,
  Layers,
  X,
  Filter,
} from "lucide-react";
import { Expense, ExpenseForm } from "../../types/expense";
import { expenseService } from "../../services/expenseService";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  { id: "ALL", label: "All Spending", icon: Layers },
  { id: "FOOD", label: "Food & Dining", icon: Utensils },
  { id: "GROCERIES", label: "Groceries", icon: ShoppingBag },
  { id: "TRANSPORT", label: "Transport & Fuel", icon: Car },
  { id: "SHOPPING", label: "Shopping", icon: ShoppingBag },
  { id: "BILLS", label: "Bills & Utilities", icon: Zap },
  { id: "ENTERTAINMENT", label: "Entertainment", icon: Film },
  { id: "HEALTH", label: "Health & Fitness", icon: HeartPulse },
  { id: "RENT", label: "Rent & Housing", icon: Home },
  { id: "EDUCATION", label: "Education", icon: GraduationCap },
  { id: "TRAVEL", label: "Travel", icon: Plane },
  { id: "OTHER", label: "Other", icon: CreditCard },
];

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const curr = user?.currency === "INR" ? "₹" : user?.currency || "₹";

  const [form, setForm] = useState<ExpenseForm>({
    merchant: "",
    amount: "",
    currency: user?.currency || "INR",
    expenseDate: getCurrentDateTime(),
    category: "FOOD",
    paymentMethod: "UPI",
    source: "MANUAL",
    notes: "",
  });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getAll();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const openCreateModal = () => {
    setEditingExpenseId(null);
    setError("");
    setForm({
      merchant: "",
      amount: "",
      currency: user?.currency || "INR",
      expenseDate: getCurrentDateTime(),
      category: "FOOD",
      paymentMethod: "UPI",
      source: "MANUAL",
      notes: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setError("");
    const date = new Date(exp.expenseDate);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    setForm({
      merchant: exp.merchant,
      amount: exp.amount.toString(),
      currency: exp.currency || "INR",
      expenseDate: localDate.toISOString().slice(0, 16),
      category: exp.category,
      paymentMethod: exp.paymentMethod || "UPI",
      source: exp.source || "MANUAL",
      notes: exp.notes || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.merchant.trim()) {
      setError("Item / Merchant name is required.");
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        merchant: form.merchant.trim(),
        amount: parseFloat(form.amount),
        currency: form.currency,
        expenseDate: form.expenseDate ? form.expenseDate + ":00" : null,
        category: form.category,
        paymentMethod: form.paymentMethod,
        source: form.source,
        notes: form.notes.trim() || undefined,
      };

      if (editingExpenseId) {
        await expenseService.update(editingExpenseId, payload);
      } else {
        await expenseService.create(payload);
      }

      setModalOpen(false);
      await loadExpenses();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await expenseService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadExpenses();
    } catch (err) {
      alert("Failed to delete expense.");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case "FOOD":
        return Utensils;
      case "GROCERIES":
        return ShoppingBag;
      case "TRANSPORT":
        return Car;
      case "SHOPPING":
        return ShoppingBag;
      case "ENTERTAINMENT":
        return Film;
      case "BILLS":
      case "ELECTRICITY":
        return Zap;
      case "HEALTH":
        return HeartPulse;
      case "RENT":
        return Home;
      case "EDUCATION":
        return GraduationCap;
      case "TRAVEL":
        return Plane;
      default:
        return CreditCard;
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || exp.category.toUpperCase() === categoryFilter.toUpperCase();
    const matchesPayment = paymentFilter === "ALL" || (exp.paymentMethod && exp.paymentMethod.toUpperCase() === paymentFilter.toUpperCase());
    return matchesSearch && matchesCat && matchesPayment;
  });

  const totalSpent = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const avgExpense = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0;
  const hasActiveFilters = searchTerm !== "" || categoryFilter !== "ALL" || paymentFilter !== "ALL";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">
            DAILY TRANSACTIONS
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5">Daily Expenses</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log, categorize, and track your day-to-day spending across food, travel, shopping, and bills.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
        >
          <Plus size={18} />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtered Spend</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {curr}{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transactions</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {filteredExpenses.length} Logs
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average / Spend</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {curr}{avgExpense.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Clean Filter Bar (No Awkward Scrollbar/Slider!) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses (Swiggy, Uber, grocery...)"
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

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="FOOD">Food & Dining</option>
              <option value="GROCERIES">Groceries</option>
              <option value="TRANSPORT">Transport & Fuel</option>
              <option value="SHOPPING">Shopping</option>
              <option value="BILLS">Bills & Utilities</option>
              <option value="ENTERTAINMENT">Entertainment</option>
              <option value="HEALTH">Health & Fitness</option>
              <option value="RENT">Rent & Housing</option>
              <option value="EDUCATION">Education</option>
              <option value="TRAVEL">Travel</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="NET_BANKING">Net Banking</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("ALL");
                  setPaymentFilter("ALL");
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                title="Reset all filters"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* Clean Wrap Category Pills (No Horizontal Scrollbar!) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Quick:</span>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs scale-[1.02]"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                <Icon size={13} className={isSelected ? "text-white" : "text-slate-500"} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading your daily expenses..." />
        ) : filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Item / Merchant</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredExpenses.map((exp) => {
                  const Icon = getCategoryIcon(exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Icon size={19} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{exp.merchant}</p>
                            {exp.notes && <p className="text-xs text-slate-400 mt-0.5">{exp.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {exp.paymentMethod || "UPI"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(exp.expenseDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">
                        {curr}{exp.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Expense"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(exp)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No Expenses Found"
            description="Log your daily spending, groceries, fuel, or coffee to see your full financial picture."
            actionText="Add Daily Expense"
            onAction={openCreateModal}
          />
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpenseId ? "Edit Expense" : "Record Daily Expense"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Item / Merchant *</label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy, Uber, Supermarket, Electricity Bill"
              value={form.merchant}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount ({curr}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={form.expenseDate}
                onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="FOOD">Food & Dining</option>
                <option value="GROCERIES">Groceries & Supermarket</option>
                <option value="TRANSPORT">Transport & Fuel</option>
                <option value="SHOPPING">Shopping & Clothes</option>
                <option value="BILLS">Bills & Utilities</option>
                <option value="ENTERTAINMENT">Entertainment & Movies</option>
                <option value="HEALTH">Health & Fitness</option>
                <option value="RENT">Rent & Housing</option>
                <option value="EDUCATION">Education & Books</option>
                <option value="TRAVEL">Travel & Hotels</option>
                <option value="OTHER">Other / Misc</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="CASH">Cash</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Tags</label>
            <textarea
              rows={2}
              placeholder="e.g. Dinner with friends, monthly groceries"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
            >
              {saving ? "Saving..." : editingExpenseId ? "Update Expense" : "Record Expense"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete the expense "${deleteTarget?.merchant}" of ${curr}${deleteTarget?.amount}?`}
        isLoading={saving}
      />
    </div>
  );
};