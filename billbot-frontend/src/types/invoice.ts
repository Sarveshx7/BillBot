import { Payment } from "./payment";

export type InvoiceStatus = "DRAFT" | "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type DiscountType = "PERCENTAGE" | "FIXED";

export interface InvoiceItem {
  id?: string;
  productId?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount?: number;
  discountAmount?: number;
  totalPrice?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerTaxNumber?: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountTotal: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRequest {
  customerId: string;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate: string;
  status?: InvoiceStatus;
  discountType?: DiscountType;
  discountValue?: number;
  currency?: string;
  notes?: string;
  terms?: string;
  items: {
    productId?: string;
    itemName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discountAmount?: number;
  }[];
}