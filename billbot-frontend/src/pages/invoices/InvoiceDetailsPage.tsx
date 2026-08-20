import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  CreditCard,
  Trash2,
  Calendar,
  CheckCircle,
  Building,
  Mail,
  Phone,
  Edit,
} from "lucide-react";
import { Invoice, InvoiceStatus } from "../../types/invoice";
import { invoiceService } from "../../services/invoiceService";
import { paymentService } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { PaymentModal } from "../../components/invoices/PaymentModal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";

interface InvoiceDetailsPageProps {
  invoiceId: string;
  onNavigate: (page: string, id?: string) => void;
}

export const InvoiceDetailsPage: React.FC<InvoiceDetailsPageProps> = ({
  invoiceId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getById(invoiceId);
      setInvoice(data);
    } catch (err) {
      console.error("Failed to load invoice details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    try {
      await invoiceService.downloadPdf(invoice.id, invoice.invoiceNumber);
    } catch (err) {
      alert("Failed to download PDF.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!invoice) return;
    try {
      setActionLoading(true);
      const updated = await invoiceService.updateStatus(invoice.id, newStatus);
      setInvoice(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoice) return;
    try {
      setActionLoading(true);
      await invoiceService.delete(invoice.id);
      onNavigate("invoices");
    } catch (err) {
      alert("Failed to delete invoice.");
      setActionLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await paymentService.delete(paymentId);
      setDeletePaymentId(null);
      await loadInvoice();
    } catch (err) {
      alert("Failed to delete payment record.");
    }
  };

  if (loading || !invoice) {
    return <LoadingSpinner message="Loading invoice details..." />;
  }

  const curr = invoice.currency === "INR" ? "₹" : invoice.currency;

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => onNavigate("invoices")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Invoices</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Quick Action Dropdown */}
          <select
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
            disabled={actionLoading}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="PENDING">Status: PENDING</option>
            <option value="PARTIALLY_PAID">Status: PARTIALLY PAID</option>
            <option value="PAID">Status: PAID</option>
            <option value="OVERDUE">Status: OVERDUE</option>
            <option value="DRAFT">Status: DRAFT</option>
            <option value="CANCELLED">Status: CANCELLED</option>
          </select>

          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <CreditCard size={15} />
              <span>Record Payment</span>
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Download size={15} />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>

          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="p-2 border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
            title="Delete Invoice"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Invoice Sheet */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 md:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
                B
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {user?.businessName || user?.name || "BillBot Business"}
              </h2>
            </div>
            {user?.businessAddress && (
              <p className="text-xs text-slate-500 whitespace-pre-line max-w-xs">{user.businessAddress}</p>
            )}
            <div className="mt-2 text-xs text-slate-500 space-y-0.5">
              {user?.businessPhone && <p>Phone: {user.businessPhone}</p>}
              <p>Email: {user?.email}</p>
              {user?.taxNumber && <p className="font-semibold text-slate-700">Tax/GSTIN: {user.taxNumber}</p>}
            </div>
          </div>

          <div className="text-left md:text-right space-y-1.5">
            <div className="flex items-center md:justify-end gap-2 mb-2">
              <h1 className="text-2xl font-black text-indigo-600 tracking-tight">INVOICE</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm font-bold text-slate-900"># {invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Invoice Date:</span> {invoice.invoiceDate}
            </p>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Due Date:</span> {invoice.dueDate}
            </p>
          </div>
        </div>

        {/* Customer Info (Bill To) */}
        <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              BILLED TO:
            </span>
            <h3 className="text-base font-bold text-slate-900">{invoice.customerName}</h3>
            {invoice.customerAddress && (
              <p className="text-xs text-slate-600 mt-1 max-w-sm">{invoice.customerAddress}</p>
            )}
          </div>

          <div className="space-y-1 text-xs text-slate-600 md:text-right">
            {invoice.customerEmail && <p>Email: {invoice.customerEmail}</p>}
            {invoice.customerPhone && <p>Phone: {invoice.customerPhone}</p>}
            {invoice.customerTaxNumber && (
              <p className="font-semibold text-slate-800">Tax ID: {invoice.customerTaxNumber}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3 rounded-l-xl">Item & Description</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Tax</th>
                <th className="px-5 py-3 text-right rounded-r-xl">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{item.itemName}</p>
                    {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                  </td>
                  <td className="px-4 py-4 text-right">{item.quantity}</td>
                  <td className="px-4 py-4 text-right">
                    {curr} {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right text-xs text-slate-500">
                    {item.taxRate}% ({curr} {(item.taxAmount || 0).toFixed(2)})
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900">
                    {curr} {(item.totalPrice || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          <div className="md:col-span-6 space-y-4">
            {invoice.notes && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Notes:</span>
                <p className="text-slate-600 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Terms & Conditions:
                </span>
                <p className="text-slate-600 whitespace-pre-line">{invoice.terms}</p>
              </div>
            )}
          </div>

          <div className="md:col-span-6 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {curr} {invoice.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Taxes:</span>
              <span className="font-semibold text-slate-900">
                {curr} {invoice.taxTotal.toFixed(2)}
              </span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span className="font-semibold text-rose-600">
                  - {curr} {invoice.discountTotal.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-indigo-600 text-lg">
                {curr} {invoice.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Amount Paid:</span>
              <span className="font-semibold text-emerald-600">
                {curr} {invoice.amountPaid.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex justify-between items-center font-bold">
              <span className="text-indigo-900">Balance Due:</span>
              <span className="text-indigo-700 text-lg">
                {curr} {invoice.amountDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History Timeline (if any) */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              <span>Payment Records</span>
            </h4>
            <div className="space-y-2">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 mr-2">
                      {curr} {p.amount.toFixed(2)}
                    </span>
                    <span className="text-slate-500">via {p.paymentMethod.replace(/_/g, " ")}</span>
                    <span className="text-slate-400 ml-2">on {p.paymentDate}</span>
                    {p.transactionReference && (
                      <span className="text-slate-500 ml-2">(Ref: {p.transactionReference})</span>
                    )}
                  </div>

                  <button
                    onClick={() => setDeletePaymentId(p.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors print:hidden"
                    title="Remove Payment"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          invoice={invoice}
          onPaymentSuccess={() => {
            setPaymentModalOpen(false);
            loadInvoice();
          }}
        />
      )}

      {/* Delete Invoice Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteInvoice}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice #${invoice.invoiceNumber}? This action cannot be undone.`}
        isLoading={actionLoading}
      />

      {/* Delete Payment Confirmation */}
      <ConfirmDialog
        isOpen={!!deletePaymentId}
        onClose={() => setDeletePaymentId(null)}
        onConfirm={() => deletePaymentId && handleDeletePayment(deletePaymentId)}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment record? The invoice balance will be adjusted accordingly."
      />
    </div>
  );
};