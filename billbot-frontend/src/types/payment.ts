export type PaymentMethod = "CASH" | "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  receiptNumber: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  notes?: string;
}