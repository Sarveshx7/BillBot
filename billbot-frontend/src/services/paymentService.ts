import api from "./api";
import { Payment, PaymentRequest } from "../types/payment";

export const paymentService = {
  getAll: async (): Promise<Payment[]> => {
    const res = await api.get<Payment[]>("/api/payments");
    return res.data;
  },

  getByInvoice: async (invoiceId: string): Promise<Payment[]> => {
    const res = await api.get<Payment[]>(`/api/payments/invoice/${invoiceId}`);
    return res.data;
  },

  create: async (data: PaymentRequest): Promise<Payment> => {
    const res = await api.post<Payment>("/api/payments", data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/payments/${id}`);
  },
};