import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Trash2,
  Eye,
  CreditCard,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Invoice } from "../../types/invoice";
import { invoiceService } from "../../services/invoiceService";
import { StatusBadge } from "../../components/common/StatusBadge";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PaymentModal } from "../../components/invoices/PaymentModal";

interface InvoiceListPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export const InvoiceListPage: React.FC<InvoiceListPageProps> = ({ onNavigate }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll(searchTerm);
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await invoiceService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadInvoices();
    } catch (err) {
      console.error("Delete invoice error", err);
      alert("Failed to delete invoice.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPdf = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    try {
      await invoiceService.downloadPdf(invoice.id, invoice.invoiceNumber);
    } catch (err) {
      console.error("PDF download error", err);
      alert("Failed to download PDF.");
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === "ALL") return true;
    return inv.status === statusFilter;
  });

  const totalBilled = filteredInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPaid = filteredInvoices.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalDue = filteredInvoices.reduce((acc, curr) => acc + curr.amountDue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Invoices</h2>
          <p className="text-xs text-slate-500 mt-1">Manage, filter, issue, and track customer billings</p>
        </div>

        <button
          onClick={() => onNavigate("invoice-create")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <Plus size={18} />
          <span>New Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Filtered Total</p>
            <p className="text-lg font-black text-slate-900">
              ₹{totalBilled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total Collected</p>
            <p className="text-lg font-black text-emerald-600">
              ₹{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Balance Due</p>
            <p className="text-lg font-black text-rose-600">
              ₹{totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE", "DRAFT", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading invoices..." />
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Invoice Number</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Total Amount</th>
                  <th className="px-6 py-3.5 text-right">Paid / Balance</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onNavigate("invoice-detail", inv.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <span className="hover:text-indigo-600 transition-colors">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{inv.customerName}</p>
                        {inv.customerEmail && <p className="text-xs text-slate-400">{inv.customerEmail}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{inv.invoiceDate}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{inv.dueDate}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {inv.currency} {inv.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs text-emerald-600 font-semibold">
                        Paid: {inv.currency} {inv.amountPaid.toFixed(2)}
                      </p>
                      {inv.amountDue > 0 && inv.status !== "PAID" && (
                        <p className="text-[11px] text-rose-500 font-bold">
                          Due: {inv.currency} {inv.amountDue.toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                          <button
                            onClick={() => setPaymentTarget(inv)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard size={17} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDownloadPdf(e, inv)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download size={17} />
                        </button>
                        <button
                          onClick={() => onNavigate("invoice-detail", inv.id)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(inv)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No Invoices Found"
            description="Create professional invoices with automated tax, discounts, and payment tracking."
            actionText="Create First Invoice"
            onAction={() => onNavigate("invoice-create")}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice #${deleteTarget?.invoiceNumber}? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      {paymentTarget && (
        <PaymentModal
          isOpen={!!paymentTarget}
          onClose={() => setPaymentTarget(null)}
          invoice={paymentTarget}
          onPaymentSuccess={() => {
            setPaymentTarget(null);
            loadInvoices();
          }}
        />
      )}
    </div>
  );
};