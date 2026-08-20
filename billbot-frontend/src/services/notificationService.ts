import api from "./api";
import { AppNotification } from "../types/notification";

export const notificationService = {
  getAll: async (): Promise<AppNotification[]> => {
    const res = await api.get<AppNotification[]>("/api/notifications");
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<{ unreadCount: number }>("/api/notifications/unread-count");
    return res.data.unreadCount;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/api/notifications/read-all");
  },

  sendTestEmail: async (email?: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.post("/api/notifications/test-email", { email });
    return res.data;
  },

  sendTestPush: async (): Promise<{ success: boolean; message: string }> => {
    const res = await api.post("/api/notifications/test-push");
    return res.data;
  },
};