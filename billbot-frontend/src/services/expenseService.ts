import api from "./api";
import { Expense } from "../types/expense";

export const expenseService = {
  getAll: async (): Promise<Expense[]> => {
    const res = await api.get<Expense[]>("/api/expenses");
    return res.data;
  },

  getById: async (id: string): Promise<Expense> => {
    const res = await api.get<Expense>(`/api/expenses/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<Expense> => {
    const res = await api.post<Expense>("/api/expenses", data);
    return res.data;
  },

  update: async (id: string, data: any): Promise<Expense> => {
    const res = await api.put<Expense>(`/api/expenses/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/expenses/${id}`);
  },
};