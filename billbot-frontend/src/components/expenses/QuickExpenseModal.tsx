import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { expenseService } from "../../services/expenseService";
import { useAuth } from "../../context/AuthContext";
import { ExpenseForm } from "../../types/expense";

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const curr = user?.currency === "INR" ? "₹" : user?.currency || "₹";

  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
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
    setError("");
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
      setError("");
      await expenseService.create({
        merchant: form.merchant.trim(),
        amount: parseFloat(form.amount),
        currency: form.currency,
        expenseDate: form.expenseDate ? form.expenseDate + ":00" : null,
        category: form.category,
        paymentMethod: form.paymentMethod,
        source: form.source,
        notes: form.notes.trim() || undefined,
      });

      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Daily Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Item / Merchant *
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. Swiggy, Uber, Supermarket, Electricity Bill"
            value={form.merchant}
            onChange={(e) => setForm({ ...form, merchant: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Amount ({curr}) *
            </label>
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
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Date & Time *
            </label>
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
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Payment Method
            </label>
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
            placeholder="e.g. Dinner with friends, grocery run"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
          >
            {saving ? "Saving..." : "Record Expense"}
          </button>
        </div>
      </form>
    </Modal>
  );
};