import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserProfileRequest } from "../types/auth";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UserProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      if (localStorage.getItem("token")) {
        const profile = await authService.getProfile();
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load user profile", err);
      // If token is invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  // Restore the session once on page load. Login and registration responses
  // already include the profile, so changing the token must not trigger another request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveLoginResponse = (res: Awaited<ReturnType<typeof authService.login>>) => {
    const profile: User = {
      id: res.userId,
      name: res.name,
      username: res.username,
      email: res.email,
      currency: res.currency || "INR",
      timezone: res.timezone || "Asia/Kolkata",
      businessName: res.businessName,
      businessPhone: res.businessPhone,
      businessAddress: res.businessAddress,
      taxNumber: res.taxNumber,
      invoicePrefix: res.invoicePrefix,
      invoiceNotesDefault: res.invoiceNotesDefault,
      termsDefault: res.termsDefault,
      createdAt: res.createdAt,
    };

    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);
    setToken(res.token);
  };

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    saveLoginResponse(res);
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    const res = await authService.register(name, username, email, password);
    saveLoginResponse(res);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data: UserProfileRequest) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
