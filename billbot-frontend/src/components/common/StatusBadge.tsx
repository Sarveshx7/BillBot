import React from "react";
import { InvoiceStatus } from "../../types/invoice";

interface StatusBadgeProps {
  status: InvoiceStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10";
      case "PARTIALLY_PAID":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/10";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10";
      case "OVERDUE":
        return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10";
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10";
      case "CANCELLED":
        return "bg-zinc-100 text-zinc-600 border-zinc-200 ring-zinc-500/10";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, " ");
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ring-1 ring-inset uppercase tracking-wider ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {formatText(status)}
    </span>
  );
};