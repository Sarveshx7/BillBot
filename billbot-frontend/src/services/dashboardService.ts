import api from "./api";
import {
  PersonalDashboard,
  CategorySpending,
  RecentExpense,
  Analytics,
} from "../types/dashboard";

export const dashboardService = {
  getPersonalDashboard: async (): Promise<PersonalDashboard> => {
    const res = await api.get<PersonalDashboard>("/api/dashboard/personal-summary");
    return res.data;
  },

  getCategorySpending: async (): Promise<CategorySpending[]> => {
    const res = await api.get<CategorySpending[]>("/api/dashboard/categories");
    return res.data;
  },

  getRecentExpenses: async (): Promise<RecentExpense[]> => {
    const res = await api.get<RecentExpense[]>("/api/dashboard/recent");
    return res.data;
  },

  getAnalytics: async (): Promise<Analytics> => {
    const res = await api.get<Analytics>("/api/dashboard/analytics");
    return res.data;
  },
};