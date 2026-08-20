import React, { useEffect } from "react";
import {
  LayoutDashboard,
  Receipt,
  Calendar,
  Repeat,
  ScanLine,
  BarChart3,
  Settings,
  LogOut,
  X,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenAddExpense?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activePage,
  onNavigate,
  onOpenAddExpense,
}) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "expenses", name: "Daily Expenses", icon: Receipt },
    { id: "bills", name: "Bills & Due Dates", icon: Calendar },
    { id: "subscriptions", name: "Subscriptions", icon: Repeat },
    { id: "scan", name: "Scan Bill (AI OCR)", icon: ScanLine },
    { id: "analytics", name: "Analytics & Budget", icon: BarChart3 },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Sliding Backdrop with Blur */}
      <div
        className={`fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Dynamic Themed Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 ${theme.sidebarBg} text-slate-300 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl border-r ${theme.sidebarBorder} ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header & Close Button */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              onNavigate("dashboard");
              onClose();
            }}
          >
            <img
              src="/logo.png"
              alt="BillBot Logo"
              className="w-10 h-10 rounded-2xl object-contain shadow-lg ring-1 ring-white/20"
            />
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                BillBot
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold border border-white/20 uppercase tracking-wider">
                  AI
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Personal Finance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Close navigation (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="px-5 pt-5 pb-2">
          <button
            onClick={() => {
              if (onOpenAddExpense) {
                onOpenAddExpense();
              } else {
                onNavigate("expenses");
              }
              onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 ${theme.primaryBtn} rounded-2xl text-xs font-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
          >
            <PlusCircle size={17} />
            <span>+ Add Daily Expense</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-3 overflow-y-auto space-y-1">
          <p className="px-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
            Navigation Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? `${theme.sidebarActiveItem} ${theme.sidebarActiveText} shadow-md`
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} className={isActive ? "shrink-0" : "text-slate-400 shrink-0"} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom AI Box & User Info */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Sparkles size={15} />
              <span>Bill Due Reminders</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Timely notifications for electricity, broadband, credit cards & subscriptions.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
              onClick={() => {
                onNavigate("settings");
                onClose();
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white font-black flex items-center justify-center text-sm shrink-0">
                {(user?.username || user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {user?.username ? `@${user.username}` : user?.name || "User"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || "Personal Account"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};