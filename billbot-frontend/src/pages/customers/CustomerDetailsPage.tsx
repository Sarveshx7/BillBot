import React, { useEffect, useState } from "react";
import { ArrowLeft, Building, Mail, Phone, Plus, MapPin, FileText } from "lucide-react";
import { Customer } from "../../types/customer";
import { Invoice } from "../../types/invoice";
import { customerService } from "../../services/customerService";
import { invoiceService } from "../../services/invoiceService";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

interface CustomerDetailsPageProps {
  customerId: string;
  onNavigate: (page: string, id?: string) => void;
}

export const CustomerDetailsPage: React.FC<CustomerDetailsPageProps> = ({
  customerId,
  onNavigate,
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cust, allInv] = await Promise.all([
          customerService.getById(customerId),
          invoiceService.getAll(),
        ]);
        setCustomer(cust);
        setInvoices(allInv.filter((inv) => inv.customerId === customerId));
      } catch (err) {
        console.error("Failed to load customer profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  if (loading || !customer) {
    return <LoadingSpinner message="Loading customer account details..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate("customers")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Customers</span>
        </button>

        <button
          onClick={() => onNavigate("invoice-create")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>Create Invoice for Client</span>
        </button>
      </div>

      {/* Customer Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">
              CUSTOMER PROFILE
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">{customer.name}</h2>
            {customer.companyName && (
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building size={15} />
                <span>{customer.companyName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium block">Total Billed</span>
              <span className="text-xl font-black text-slate-900">
                ₹{customer.totalBilled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right pl-4 border-l border-slate-200">
              <span className="text-xs text-slate-400 font-medium block">Outstanding Balance</span>
              <span className={`text-xl font-black ${customer.outstandingBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                ₹{customer.outstandingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Info</span>
            <p className="text-slate-700">{customer.email || "No email"}</p>
            <p className="text-slate-700">{customer.phone || "No phone"}</p>
            {customer.taxNumber && <p className="text-xs font-semibold text-slate-800 mt-1">Tax ID: {customer.taxNumber}</p>}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Billing Address</span>
            <p className="text-slate-600 whitespace-pre-line text-xs">{customer.billingAddress || "No address specified"}</p>
            {(customer.city || customer.state || customer.postalCode) && (
              <p className="text-slate-600 text-xs mt-0.5">
                {[customer.city, customer.state, customer.postalCode].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Notes</span>
            <p className="text-slate-600 text-xs italic">{customer.notes || "No internal notes recorded."}</p>
          </div>
        </div>
      </div>

      {/* Customer Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Invoices for {customer.name}</h3>
          <span className="text-xs font-semibold text-slate-500">{invoices.length} Total Invoices</span>
        </div>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-6 py-3.5 text-right">Balance Due</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{inv.invoiceDate}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{inv.dueDate}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {inv.currency} {inv.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-rose-600">
                      {inv.currency} {inv.amountDue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onNavigate("invoice-detail", inv.id)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm">No invoices recorded for this customer.</div>
        )}
      </div>
    </div>
  );
};