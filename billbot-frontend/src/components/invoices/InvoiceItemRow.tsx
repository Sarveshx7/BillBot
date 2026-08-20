import React from "react";
import { Trash2, Package } from "lucide-react";
import { Product } from "../../types/product";

export interface InvoiceItemRowData {
  id?: string;
  productId?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount: number;
}

interface InvoiceItemRowProps {
  index: number;
  item: InvoiceItemRowData;
  products: Product[];
  currencySymbol: string;
  onChange: (index: number, field: keyof InvoiceItemRowData, value: any) => void;
  onRemove: (index: number) => void;
}

export const InvoiceItemRow: React.FC<InvoiceItemRowProps> = ({
  index,
  item,
  products,
  currencySymbol,
  onChange,
  onRemove,
}) => {
  const handleProductSelect = (productId: string) => {
    if (!productId) {
      onChange(index, "productId", undefined);
      return;
    }
    const selected = products.find((p) => p.id === productId);
    if (selected) {
      onChange(index, "productId", selected.id);
      onChange(index, "itemName", selected.name);
      onChange(index, "description", selected.description || "");
      onChange(index, "unitPrice", selected.unitPrice);
      onChange(index, "taxRate", selected.taxRate || 0);
    }
  };

  const lineBase = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  const lineTax = lineBase * ((Number(item.taxRate) || 0) / 100);
  const lineTotal = Math.max(0, lineBase + lineTax);

  return (
    <div className="bg-white hover:bg-slate-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-xs transition-all">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Item Name & Catalog Picker */}
        <div className="md:col-span-5 space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Item or service name *"
              value={item.itemName}
              onChange={(e) => onChange(index, "itemName", e.target.value)}
              className="w-full text-sm font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {products.length > 0 && (
              <select
                value={item.productId || ""}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-36 text-xs py-2 px-2 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none shrink-0"
                title="Auto-fill from product catalog"
              >
                <option value="">Catalog...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({currencySymbol}{p.unitPrice})
                  </option>
                ))}
              </select>
            )}
          </div>
          <input
            type="text"
            placeholder="Add description or notes (optional)"
            value={item.description || ""}
            onChange={(e) => onChange(index, "description", e.target.value)}
            className="w-full text-xs text-slate-600 py-1.5 px-3 rounded-lg border border-slate-100 bg-slate-50/30 focus:bg-white focus:border-slate-200 focus:outline-none"
          />
        </div>

        {/* Quantity */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 md:hidden">Quantity</label>
          <input
            type="number"
            min="0.01"
            step="any"
            required
            placeholder="Qty"
            value={item.quantity === 0 ? "" : item.quantity}
            onChange={(e) => onChange(index, "quantity", e.target.value === "" ? 0 : parseFloat(e.target.value))}
            className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-right font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Unit Price */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 md:hidden">Price ({currencySymbol})</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            value={item.unitPrice === 0 ? "" : item.unitPrice}
            onChange={(e) => onChange(index, "unitPrice", e.target.value === "" ? 0 : parseFloat(e.target.value))}
            className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-right font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Tax Rate % */}
        <div className="md:col-span-1">
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 md:hidden">Tax %</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={item.taxRate === 0 ? "" : item.taxRate}
              onChange={(e) => onChange(index, "taxRate", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              className="w-full text-xs py-2 pr-5 pl-2 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-right font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">%</span>
          </div>
        </div>

        {/* Line Total & Remove */}
        <div className="md:col-span-2 flex items-center justify-between gap-2">
          <div className="text-right flex-1">
            <span className="text-xs font-bold text-slate-900 block">
              {currencySymbol}{lineTotal.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
            title="Delete Line Item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};