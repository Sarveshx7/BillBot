import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  UserPlus,
  FileText,
  Calendar,
  Sparkles,
  Percent,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { Customer } from "../../types/customer";
import { Product } from "../../types/product";
import { InvoiceRequest, DiscountType, InvoiceStatus } from "../../types/invoice";
import { customerService } from "../../services/customerService";
import { productService } from "../../services/productService";
import { invoiceService } from "../../services/invoiceService";
import { useAuth } from "../../context/AuthContext";
import { InvoiceItemRow, InvoiceItemRowData } from "../../components/invoices/InvoiceItemRow";
import { Modal } from "../../components/common/Modal";

interface InvoiceCreatePageProps {
  onNavigate: (page: string, id?: string) => void;
}

export const InvoiceCreatePage: React.FC<InvoiceCreatePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState<string>("15"); // '0', '15', '30', 'custom'
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [discountType, setDiscountType] = useState<DiscountType>("FIXED");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [currency, setCurrency] = useState(user?.currency || "INR");
  const [notes, setNotes] = useState(user?.invoiceNotesDefault || "");
  const [terms, setTerms] = useState(user?.termsDefault || "");

  // Quick Customer Modal
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustCompany, setNewCustCompany] = useState("");
  const [creatingCust, setCreatingCust] = useState(false);

  // Line items
  const [items, setItems] = useState<InvoiceItemRowData[]>([
    {
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      discountAmount: 0,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cList, pList] = await Promise.all([
          customerService.getAll(),
          productService.getAll(undefined, true),
        ]);
        setCustomers(cList);
        setProducts(pList);
        if (cList.length > 0) {
          setCustomerId(cList[0].id);
        }
      } catch (err) {
        console.error("Failed to load catalogs", err);
      }
    };
    fetchData();
  }, []);

  // Update Due Date when Payment Terms or Invoice Date changes
  const handleTermsChange = (termsOption: string) => {
    setPaymentTerms(termsOption);
    if (termsOption === "custom") return;

    const days = parseInt(termsOption, 10) || 0;
    const baseDate = new Date(invoiceDate || Date.now());
    baseDate.setDate(baseDate.getDate() + days);
    setDueDate(baseDate.toISOString().slice(0, 10));
  };

  const handleInvoiceDateChange = (newDate: string) => {
    setInvoiceDate(newDate);
    if (paymentTerms !== "custom") {
      const days = parseInt(paymentTerms, 10) || 0;
      const baseDate = new Date(newDate || Date.now());
      baseDate.setDate(baseDate.getDate() + days);
      setDueDate(baseDate.toISOString().slice(0, 10));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemRowData, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        itemName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discountAmount: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      alert("An invoice must contain at least one line item.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Real-time calculations
  const subtotal = items.reduce((acc, item) => {
    return acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);

  const taxTotal = items.reduce((acc, item) => {
    const lineBase = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    return acc + lineBase * ((Number(item.taxRate) || 0) / 100);
  }, 0);

  const discountTotal =
    discountType === "PERCENTAGE"
      ? subtotal * ((Number(discountValue) || 0) / 100)
      : Number(discountValue) || 0;

  const totalAmount = Math.max(0, subtotal + taxTotal - discountTotal);

  const handleQuickCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    try {
      setCreatingCust(true);
      const created = await customerService.create({
        name: newCustName.trim(),
        companyName: newCustCompany.trim() || undefined,
        email: newCustEmail.trim() || undefined,
        phone: newCustPhone.trim() || undefined,
      });
      setCustomers((prev) => [created, ...prev]);
      setCustomerId(created.id);
      setQuickCustomerOpen(false);
      setNewCustName("");
      setNewCustCompany("");
      setNewCustEmail("");
      setNewCustPhone("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create customer.");
    } finally {
      setCreatingCust(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: InvoiceStatus = "PENDING") => {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Please select or create a customer for this invoice.");
      return;
    }

    const validItems = items.filter((i) => i.itemName.trim().length > 0);
    if (validItems.length === 0) {
      setError("Please provide at least one item with a valid name.");
      return;
    }

    try {
      setSaving(true);
      const payload: InvoiceRequest = {
        customerId,
        invoiceNumber: invoiceNumber.trim() || undefined,
        invoiceDate,
        dueDate,
        status,
        discountType,
        discountValue,
        currency,
        notes: notes.trim() || undefined,
        terms: terms.trim() || undefined,
        items: validItems.map((item) => ({
          productId: item.productId || undefined,
          itemName: item.itemName.trim(),
          description: item.description?.trim() || undefined,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          taxRate: Number(item.taxRate) || 0,
          discountAmount: 0,
        })),
      };

      const created = await invoiceService.create(payload);
      onNavigate("invoice-detail", created.id);
    } catch (err: any) {
      console.error("Create invoice error", err);
      setError(err.response?.data?.message || "Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  };

  const currSymbol = currency === "INR" ? "₹" : currency;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => onNavigate("invoices")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Invoices</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "DRAFT")}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "PENDING")}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
          >
            <Save size={18} />
            <span>{saving ? "Generating..." : "Create & Issue Invoice"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Invoice Form */}
      <form onSubmit={(e) => handleSubmit(e, "PENDING")} className="space-y-6">
        {/* Card 1: Client & Terms */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Client & Invoice Details</h3>
              <p className="text-xs text-slate-500">Select who to bill and payment schedule</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Client / Customer *
                </label>
                <button
                  type="button"
                  onClick={() => setQuickCustomerOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <UserPlus size={14} />
                  <span>+ New Client</span>
                </button>
              </div>

              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- Choose Client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ""} - {c.email || c.phone || "Client"}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Invoice # (Optional) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="Auto-generated (e.g. INV-2026-0001)"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dates & Quick Terms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => handleInvoiceDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => handleTermsChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="0">Due on Receipt (Immediate)</option>
                <option value="7">Net 7 Days</option>
                <option value="15">Net 15 Days (Standard)</option>
                <option value="30">Net 30 Days (1 Month)</option>
                <option value="60">Net 60 Days</option>
                <option value="custom">Custom Due Date</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setPaymentTerms("custom");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Line Items */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Line Items & Services</h3>
              <p className="text-xs text-slate-500">Add the services or goods provided</p>
            </div>

            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors shadow-xs"
            >
              <Plus size={16} />
              <span>+ Add Item</span>
            </button>
          </div>

          {/* Table Header on Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5">Item & Description</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2 text-right">Price ({currSymbol})</div>
            <div className="col-span-1 text-right">Tax %</div>
            <div className="col-span-2 text-right pr-8">Total</div>
          </div>

          {/* Item Rows */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <InvoiceItemRow
                key={index}
                index={index}
                item={item}
                products={products}
                currencySymbol={currSymbol}
                onChange={handleItemChange}
                onRemove={removeItemRow}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addItemRow}
            className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-2xl text-slate-500 hover:text-indigo-600 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Plus size={16} />
            <span>Add Another Line Item</span>
          </button>
        </div>

        {/* Card 3: Notes & Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Notes & Terms (Left) */}
          <div className="md:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank Details & Payment Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Bank Account: 123456789, IFSC: SBIN0001, UPI: business@upi. Thank you for your business!"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Terms & Conditions
              </label>
              <textarea
                rows={2}
                placeholder="Payment is due within the stipulated terms."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Calculation Summary (Right) */}
          <div className="md:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Financial Summary
              </h3>

              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {currSymbol}{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-slate-600">
                <span>Total Taxes</span>
                <span className="font-semibold text-slate-900">
                  {currSymbol}{taxTotal.toFixed(2)}
                </span>
              </div>

              {/* One-click Discount Input */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Add Discount:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType("FIXED")}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        discountType === "FIXED"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Flat ({currSymbol})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("PERCENTAGE")}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        discountType === "PERCENTAGE"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      % Percent
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={discountValue === 0 ? "" : discountValue}
                    onChange={(e) => setDiscountValue(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                    className="w-28 py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-right text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {discountTotal > 0 && (
                    <span className="text-xs font-bold text-rose-600">
                      - {currSymbol}{discountTotal.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Grand Total Bar */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex justify-between items-baseline mt-4">
              <div>
                <span className="text-xs font-bold text-indigo-900 block uppercase tracking-wider">
                  Grand Total
                </span>
                <span className="text-[11px] text-slate-500">Amount due from client</span>
              </div>
              <span className="text-2xl font-black text-indigo-700">
                {currSymbol}{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "DRAFT")}
            disabled={saving}
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01]"
          >
            <Save size={18} />
            <span>{saving ? "Generating..." : "Create & Issue Invoice"}</span>
          </button>
        </div>
      </form>

      {/* Quick Add Customer Modal */}
      <Modal isOpen={quickCustomerOpen} onClose={() => setQuickCustomerOpen(false)} title="Quick Add Client">
        <form onSubmit={handleQuickCustomerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Client Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Innovations Ltd."
              value={newCustCompany}
              onChange={(e) => setNewCustCompany(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                placeholder="billing@acme.com"
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuickCustomerOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingCust}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
            >
              {creatingCust ? "Saving..." : "Save & Select"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};