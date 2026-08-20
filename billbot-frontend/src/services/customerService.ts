import api from "./api";
import { Customer, CustomerRequest } from "../types/customer";

export const customerService = {
  getAll: async (search?: string): Promise<Customer[]> => {
    const params = search ? { search } : {};
    const res = await api.get<Customer[]>("/api/customers", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const res = await api.get<Customer>(`/api/customers/${id}`);
    return res.data;
  },

  create: async (data: CustomerRequest): Promise<Customer> => {
    const res = await api.post<Customer>("/api/customers", data);
    return res.data;
  },

  update: async (id: string, data: CustomerRequest): Promise<Customer> => {
    const res = await api.put<Customer>(`/api/customers/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/customers/${id}`);
  },
};