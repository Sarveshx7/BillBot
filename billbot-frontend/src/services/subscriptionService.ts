import api from "./api";
import { Subscription, SubscriptionForm } from "../types/subscription";

export const subscriptionService = {
  getAll: async (status?: string): Promise<Subscription[]> => {
    const params = status ? { status } : {};
    const res = await api.get<Subscription[]>("/api/subscriptions", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Subscription> => {
    const res = await api.get<Subscription>(`/api/subscriptions/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<Subscription> => {
    const res = await api.post<Subscription>("/api/subscriptions", data);
    return res.data;
  },

  update: async (id: string, data: any): Promise<Subscription> => {
    const res = await api.put<Subscription>(`/api/subscriptions/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/subscriptions/${id}`);
  },
};