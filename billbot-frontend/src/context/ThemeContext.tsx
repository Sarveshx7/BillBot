import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "gold" | "cyber" | "emerald" | "chocolate" | "classic";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  tag: string;
  bgPage: string;
  textMain: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  heroBg: string;
  heroGlow1: string;
  heroGlow2: string;
  heroBorder: string;
  heroTextGradient: string;
  primaryBtn: string;
  secondaryBtn: string;
  accentBadgeBg: string;
  accentBadgeText: string;
  accentBadgeBorder: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarActiveItem: string;
  sidebarActiveText: string;
  topbarBg: string;
  topbarBorder: string;
  chartBarFill1: string;
  chartBarFill2: string;
  categoryColors: Record<string, string>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  gold: {
    id: "gold",
    name: "Obsidian & Royal Gold",
    tagline: "Direct match with official Navy & Gold logo",
    tag: "👑 Logo Match",
    bgPage: "#F8FAFC",
    textMain: "#0F172A",
    textMuted: "#64748B",
    cardBg: "bg-white",
    cardBorder: "border-slate-200/80 hover:border-amber-400/80",
    heroBg: "bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40",
    heroGlow1: "bg-amber-500/20",
    heroGlow2: "bg-yellow-600/15",
    heroBorder: "border-amber-500/25",
    heroTextGradient: "from-amber-300 via-amber-200 to-yellow-400",
    primaryBtn: "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25",
    secondaryBtn: "bg-slate-900/90 hover:bg-slate-850 text-amber-200 border-amber-500/30",
    accentBadgeBg: "bg-amber-500/20",
    accentBadgeText: "text-amber-300",
    accentBadgeBorder: "border-amber-500/40",
    sidebarBg: "bg-slate-950",
    sidebarBorder: "border-amber-500/15",
    sidebarActiveItem: "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500",
    sidebarActiveText: "text-slate-950 font-black",
    topbarBg: "bg-white/85",
    topbarBorder: "border-slate-200/80",
    chartBarFill1: "#f59e0b",
    chartBarFill2: "#d97706",
    categoryColors: {
      FOOD: "#f59e0b",
      GROCERIES: "#eab308",
      TRANSPORT: "#3b82f6",
      SHOPPING: "#ec4899",
      BILLS: "#d97706",
      ELECTRICITY: "#f59e0b",
      ENTERTAINMENT: "#8b5cf6",
      HEALTH: "#10b981",
      RENT: "#14b8a6",
      TRAVEL: "#06b6d4",
      EDUCATION: "#64748b",
      OTHER: "#94a3b8",
    },
    colors: {
      primary: "#F59E0B",
      secondary: "#0F172A",
      accent: "#EAB308",
      surface: "#F8FAFC",
    },
  },

  cyber: {
    id: "cyber",
    name: "Cyber Sapphire & Neon Mint",
    tagline: "Futuristic Silicon Valley SaaS aesthetic",
    tag: "⚡ SaaS Pro",
    bgPage: "#F8FAFC",
    textMain: "#0F172A",
    textMuted: "#64748B",
    cardBg: "bg-white",
    cardBorder: "border-slate-200/80 hover:border-cyan-400/80",
    heroBg: "bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-950",
    heroGlow1: "bg-indigo-600/30",
    heroGlow2: "bg-cyan-500/25",
    heroBorder: "border-indigo-500/30",
    heroTextGradient: "from-indigo-300 via-cyan-200 to-emerald-300",
    primaryBtn: "bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-500/30",
    secondaryBtn: "bg-slate-900/90 hover:bg-slate-800 text-cyan-200 border-cyan-500/30",
    accentBadgeBg: "bg-indigo-500/25",
    accentBadgeText: "text-cyan-300",
    accentBadgeBorder: "border-cyan-500/40",
    sidebarBg: "bg-slate-950",
    sidebarBorder: "border-indigo-500/20",
    sidebarActiveItem: "bg-gradient-to-r from-indigo-600 to-indigo-500",
    sidebarActiveText: "text-white font-black",
    topbarBg: "bg-white/85",
    topbarBorder: "border-slate-200/80",
    chartBarFill1: "#06b6d4",
    chartBarFill2: "#4f46e5",
    categoryColors: {
      FOOD: "#f97316",
      GROCERIES: "#10b981",
      TRANSPORT: "#06b6d4",
      SHOPPING: "#ec4899",
      BILLS: "#6366f1",
      ELECTRICITY: "#3b82f6",
      ENTERTAINMENT: "#8b5cf6",
      HEALTH: "#14b8a6",
      RENT: "#0ea5e9",
      TRAVEL: "#2dd4bf",
      EDUCATION: "#64748b",
      OTHER: "#94a3b8",
    },
    colors: {
      primary: "#6366F1",
      secondary: "#06B6D4",
      accent: "#10B981",
      surface: "#F8FAFC",
    },
  },

  emerald: {
    id: "emerald",
    name: "Emerald Wealth & Platinum",
    tagline: "Prosperity, wealth accumulation & private banking",
    tag: "🌿 Wealth & Growth",
    bgPage: "#F8FAFC",
    textMain: "#0F172A",
    textMuted: "#64748B",
    cardBg: "bg-white",
    cardBorder: "border-slate-200/80 hover:border-emerald-400/80",
    heroBg: "bg-gradient-to-br from-slate-950 via-emerald-950/70 to-slate-950",
    heroGlow1: "bg-emerald-600/30",
    heroGlow2: "bg-teal-500/25",
    heroBorder: "border-emerald-500/30",
    heroTextGradient: "from-emerald-300 via-teal-200 to-amber-200",
    primaryBtn: "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30",
    secondaryBtn: "bg-slate-900/90 hover:bg-slate-800 text-emerald-200 border-emerald-500/30",
    accentBadgeBg: "bg-emerald-500/25",
    accentBadgeText: "text-emerald-300",
    accentBadgeBorder: "border-emerald-500/40",
    sidebarBg: "bg-slate-950",
    sidebarBorder: "border-emerald-500/20",
    sidebarActiveItem: "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600",
    sidebarActiveText: "text-white font-black",
    topbarBg: "bg-white/85",
    topbarBorder: "border-slate-200/80",
    chartBarFill1: "#10b981",
    chartBarFill2: "#047857",
    categoryColors: {
      FOOD: "#f97316",
      GROCERIES: "#10b981",
      TRANSPORT: "#06b6d4",
      SHOPPING: "#ec4899",
      BILLS: "#059669",
      ELECTRICITY: "#10b981",
      ENTERTAINMENT: "#8b5cf6",
      HEALTH: "#14b8a6",
      RENT: "#047857",
      TRAVEL: "#2dd4bf",
      EDUCATION: "#64748b",
      OTHER: "#94a3b8",
    },
    colors: {
      primary: "#10B981",
      secondary: "#047857",
      accent: "#14B8A6",
      surface: "#F8FAFC",
    },
  },

  chocolate: {
    id: "chocolate",
    name: "Chocolate & Warm Beige",
    tagline: "Quiet luxury, roasted espresso & warm caramel latte",
    tag: "☕ Quiet Luxury",
    bgPage: "#FBF8F3",
    textMain: "#22160E",
    textMuted: "#8A7969",
    cardBg: "bg-[#FFFFFF]",
    cardBorder: "border-[#EBE1D0] hover:border-amber-600/60",
    heroBg: "bg-gradient-to-br from-[#17100B] via-[#261A12] to-[#3B2619]",
    heroGlow1: "bg-amber-600/20",
    heroGlow2: "bg-orange-700/15",
    heroBorder: "border-amber-500/20",
    heroTextGradient: "from-amber-300 via-[#F7E5C8] to-yellow-300",
    primaryBtn: "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-[#1D140E] shadow-amber-950/40",
    secondaryBtn: "bg-[#22170F]/90 hover:bg-[#2C1F16] text-[#EFE6D8] border-amber-600/30",
    accentBadgeBg: "bg-amber-500/15",
    accentBadgeText: "text-amber-300",
    accentBadgeBorder: "border-amber-500/30",
    sidebarBg: "bg-[#1D140E]",
    sidebarBorder: "border-[#38261A]",
    sidebarActiveItem: "bg-[#F7F2EA]",
    sidebarActiveText: "text-[#1D140E] font-black",
    topbarBg: "bg-[#FDFBF7]/90",
    topbarBorder: "border-[#E8DEC8]",
    chartBarFill1: "#d97706",
    chartBarFill2: "#92400e",
    categoryColors: {
      FOOD: "#d97706",
      GROCERIES: "#b45309",
      TRANSPORT: "#92400e",
      SHOPPING: "#78350f",
      BILLS: "#c2410c",
      ELECTRICITY: "#ea580c",
      ENTERTAINMENT: "#854d0e",
      HEALTH: "#15803d",
      RENT: "#451a03",
      TRAVEL: "#0284c7",
      EDUCATION: "#57534e",
      OTHER: "#78716c",
    },
    colors: {
      primary: "#D97706",
      secondary: "#1D140E",
      accent: "#B45309",
      surface: "#FBF8F3",
    },
  },

  classic: {
    id: "classic",
    name: "Classic Sapphire & Polar White",
    tagline: "Crisp polar white, royal sapphire blue & clean slate",
    tag: "🌊 Classic Default",
    bgPage: "#F8FAFC",
    textMain: "#0F172A",
    textMuted: "#64748B",
    cardBg: "bg-white",
    cardBorder: "border-slate-200/80 hover:border-blue-400/80",
    heroBg: "bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950",
    heroGlow1: "bg-blue-600/30",
    heroGlow2: "bg-indigo-500/20",
    heroBorder: "border-blue-500/30",
    heroTextGradient: "from-blue-200 via-white to-indigo-200",
    primaryBtn: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25",
    secondaryBtn: "bg-white/15 hover:bg-white/25 text-white border-white/20",
    accentBadgeBg: "bg-blue-500/20",
    accentBadgeText: "text-blue-300",
    accentBadgeBorder: "border-blue-500/40",
    sidebarBg: "bg-slate-900",
    sidebarBorder: "border-slate-800",
    sidebarActiveItem: "bg-blue-600",
    sidebarActiveText: "text-white font-bold",
    topbarBg: "bg-white/85",
    topbarBorder: "border-slate-200/80",
    chartBarFill1: "#3b82f6",
    chartBarFill2: "#1d4ed8",
    categoryColors: {
      FOOD: "#f97316",
      GROCERIES: "#f59e0b",
      TRANSPORT: "#3b82f6",
      SHOPPING: "#ec4899",
      BILLS: "#2563eb",
      ELECTRICITY: "#0284c7",
      ENTERTAINMENT: "#8b5cf6",
      HEALTH: "#10b981",
      RENT: "#14b8a6",
      TRAVEL: "#06b6d4",
      EDUCATION: "#64748b",
      OTHER: "#94a3b8",
    },
    colors: {
      primary: "#2563EB",
      secondary: "#0F172A",
      accent: "#3B82F6",
      surface: "#F8FAFC",
    },
  },
};

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem("billbot_theme") as ThemeId;
    return saved && THEMES[saved] ? saved : "classic";
  });

  const theme = THEMES[themeId] || THEMES.classic;

  const handleSetTheme = (id: ThemeId) => {
    if (THEMES[id]) {
      setThemeId(id);
      localStorage.setItem("billbot_theme", id);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = theme.bgPage;
    document.documentElement.setAttribute("data-theme", themeId);
  }, [theme, themeId]);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        setTheme: handleSetTheme,
        availableThemes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};