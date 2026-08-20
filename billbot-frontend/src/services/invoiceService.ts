import api from "./api";
import { Invoice, InvoiceRequest, InvoiceStatus } from "../types/invoice";

export const invoiceService = {
  getAll: async (search?: string): Promise<Invoice[]> => {
    const params = search ? { search } : {};
    const res = await api.get<Invoice[]>("/api/invoices", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const res = await api.get<Invoice>(`/api/invoices/${id}`);
    return res.data;
  },

  create: async (data: InvoiceRequest): Promise<Invoice> => {
    const res = await api.post<Invoice>("/api/invoices", data);
    return res.data;
  },

  update: async (id: string, data: InvoiceRequest): Promise<Invoice> => {
    const res = await api.put<Invoice>(`/api/invoices/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: InvoiceStatus): Promise<Invoice> => {
    const res = await api.patch<Invoice>(`/api/invoices/${id}/status`, { status });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/invoices/${id}`);
  },

  getPdfUrl: (id: string): string => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8080";
    return `${base}/api/invoices/${id}/pdf`;
  },

  downloadPdf: async (id: string, invoiceNumber: string): Promise<void> => {
    const res = await api.get(`/api/invoices/${id}/pdf`, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};