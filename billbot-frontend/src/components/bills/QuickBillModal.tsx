import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { billDueService } from "../../services/billDueService";
import { useAuth } from "../../context/AuthContext";
import { BillDueForm } from "../../types/billDue";

interface QuickBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickBillModal: React.FC<QuickBillModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
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
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.billerName.trim()) {
      setError("Bill / Biller name is required.");
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError("Please enter a valid bill amount.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await billDueService.create({
        billerName: form.billerName.trim(),
        amount: parseFloat(form.amount),
        currency: form.currency,
        dueDate: form.dueDate,
        category: form.category,
        recurringFrequency: form.recurringFrequency,
        autoPay: form.autoPay,
        notes: form.notes?.trim() || undefined,
      });

      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to schedule bill.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Upcoming Bill / Due">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Bill / Provider Name *
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. Tata Power, Airtel Fiber, HDFC Card, House Rent"
            value={form.billerName}
            onChange={(e) => setForm({ ...form, billerName: e.target.value })}
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
              Payment Due Date *
            </label>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
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
              <option value="ELECTRICITY">Electricity & Power</option>
              <option value="INTERNET">Internet & WiFi</option>
              <option value="RENT">House / Office Rent</option>
              <option value="CREDIT_CARD">Credit Card Bill</option>
              <option value="EMI">Loan / EMI</option>
              <option value="MOBILE">Mobile Recharge / Postpaid</option>
              <option value="WATER">Water & Utilities</option>
              <option value="GAS">Gas & Fuel</option>
              <option value="INSURANCE">Insurance Premium</option>
              <option value="OTHER">Other / Misc</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Frequency</label>
            <select
              value={form.recurringFrequency}
              onChange={(e) => setForm({ ...form, recurringFrequency: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="ONE_TIME">One-Time</option>
              <option value="QUARTERLY">Quarterly (3 Months)</option>
              <option value="YEARLY">Yearly (Annual)</option>
            </select>
          </div>
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
            {saving ? "Saving..." : "Schedule Bill"}
          </button>
        </div>
      </form>
    </Modal>
  );
};