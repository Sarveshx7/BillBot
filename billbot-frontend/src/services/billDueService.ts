import api from "./api";
import { BillDue, BillDueForm } from "../types/billDue";

export const billDueService = {
  getAll: async (isPaid?: boolean): Promise<BillDue[]> => {
    const params = isPaid !== undefined ? { isPaid } : {};
    const res = await api.get<BillDue[]>("/api/bills", { params });
    return res.data;
  },

  getById: async (id: string): Promise<BillDue> => {
    const res = await api.get<BillDue>(`/api/bills/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<BillDue> => {
    const res = await api.post<BillDue>("/api/bills", data);
    return res.data;
  },

  update: async (id: string, data: any): Promise<BillDue> => {
    const res = await api.put<BillDue>(`/api/bills/${id}`, data);
    return res.data;
  },

  markAsPaid: async (id: string, createExpense: boolean = true): Promise<BillDue> => {
    const res = await api.patch<BillDue>(`/api/bills/${id}/pay`, null, {
      params: { createExpense },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/bills/${id}`);
  },
};