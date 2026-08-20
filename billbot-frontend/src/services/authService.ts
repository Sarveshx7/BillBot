import api from "./api";
import { User, LoginResponse, UserProfileRequest } from "../types/auth";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/api/auth/login", { email, password });
    return res.data;
  },

  register: async (name: string, username: string, email: string, password: string): Promise<any> => {
    const res = await api.post("/api/auth/register", { name, username, email, password });
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get<User>("/api/user/profile");
    return res.data;
  },

  updateProfile: async (data: UserProfileRequest): Promise<User> => {
    const res = await api.put<User>("/api/user/profile", data);
    return res.data;
  },
};