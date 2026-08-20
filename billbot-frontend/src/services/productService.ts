import api from "./api";
import { Product, ProductRequest } from "../types/product";

export const productService = {
  getAll: async (search?: string, activeOnly = false): Promise<Product[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (activeOnly) params.activeOnly = true;
    const res = await api.get<Product[]>("/api/products", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Product> => {
    const res = await api.get<Product>(`/api/products/${id}`);
    return res.data;
  },

  create: async (data: ProductRequest): Promise<Product> => {
    const res = await api.post<Product>("/api/products", data);
    return res.data;
  },

  update: async (id: string, data: ProductRequest): Promise<Product> => {
    const res = await api.put<Product>(`/api/products/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },
};