import React, { useEffect, useState } from "react";
import { CreditCard, Search, Trash2, Calendar, FileText } from "lucide-react";
import { Payment } from "../../types/payment";
import { paymentService } from "../../services/paymentService";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

interface PaymentListPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export const PaymentListPage: React.FC<PaymentListPageProps> = ({ onNavigate }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAll();
      setPayments(data);
    } catch (err) {
      console.error("Failed to load payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await paymentService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadPayments();
    } catch (err) {
      alert("Failed to delete payment transaction.");
    } finally {
      setDeleting(false);
    }
  };

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Payment Transactions</h2>
          <p className="text-xs text-slate-500 mt-1">Audit log of all payments recorded against customer invoices</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            ₹
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">Total Collections</span>
            <span className="text-lg font-black text-emerald-700">
              ₹{totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading payment transactions..." />
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Receipt #</th>
                  <th className="px-6 py-3.5">Invoice</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Reference / Notes</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900">{p.receiptNumber}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onNavigate("invoice-detail", p.invoiceId)}
                        className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <FileText size={14} />
                        <span>#{p.invoiceNumber}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.customerName}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{p.paymentDate}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {p.paymentMethod.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {p.transactionReference || p.notes || "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600">
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete payment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={CreditCard}
            title="No Payments Recorded"
            description="Payments will appear here when you record settlements against customer invoices."
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Payment Transaction"
        message="Are you sure you want to delete this payment record? The corresponding invoice balance will be updated automatically."
        isLoading={deleting}
      />
    </div>
  );
};