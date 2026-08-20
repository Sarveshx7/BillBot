import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Zap,
  Sparkles,
  CheckCheck,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { notificationService } from "../../services/notificationService";
import { AppNotification } from "../../types/notification";

interface TopbarProps {
  onToggleSidebar: () => void;
  title: string;
  subtitle?: string;
  onNavigate: (page: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  title,
  subtitle,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
      const count = data.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, actionUrl?: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (actionUrl) {
        onNavigate(actionUrl);
        setPanelOpen(false);
      }
    } catch (err) {
      console.error("Error marking read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "OVERDUE":
        return <AlertTriangle size={16} className="text-rose-600" />;
      case "AUTOPAY_DEBIT":
        return <Zap size={16} className="text-emerald-600 fill-emerald-600" />;
      case "BILL_DUE":
        return <Calendar size={16} className="text-amber-600" />;
      default:
        return <Sparkles size={16} className="text-indigo-600" />;
    }
  };

  return (
    <header className={`h-20 ${theme.topbarBg} backdrop-blur-xl border-b ${theme.topbarBorder} sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between transition-all shadow-2xs`}>
      {/* Left: Three Lines Icon, Brand Logo & Page Info */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Three Lines Navigation Button (Icon Only) */}
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white shadow-md border border-white/15 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
          title="Navigation"
        >
          <Menu size={20} style={{ color: theme.colors.primary }} />
        </button>

        {/* Brand Logo Only (No text) */}
        <div
          onClick={() => onNavigate("dashboard")}
          className="cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center shrink-0"
          title="Dashboard"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-2xl object-contain shadow-md ring-1 ring-black/10"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium hidden lg:block line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* Notification Bell with Badge */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all relative cursor-pointer active:scale-95"
          title="Notifications & Due Alerts"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full absolute -top-0.5 -right-0.5 flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown Panel */}
        {panelOpen && (
          <div className="absolute top-14 right-0 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-slate-900 animate-scale-in">
            {/* Panel Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Reminders & Alerts
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleMarkRead(item.id, item.actionUrl)}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                      !item.isRead ? "bg-indigo-50/40" : "bg-white opacity-85"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs truncate ${!item.isRead ? "font-black text-slate-900" : "font-semibold text-slate-700"}`}>
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      <span className="text-[9px] font-medium text-slate-400 mt-1 block">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">All Caught Up!</p>
                  <p className="text-[11px] text-slate-400">No pending alerts or overdue reminders.</p>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  onNavigate("settings");
                  setPanelOpen(false);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Notification Preferences</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* User Handle & Dynamic Avatar */}
        <div
          onClick={() => onNavigate("settings")}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div
            className="w-9 h-9 rounded-xl text-slate-950 font-black flex items-center justify-center text-xs shadow-sm ring-1 ring-black/10 shrink-0"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {(user?.username || user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left min-w-0">
            <p className="text-xs font-black text-slate-900 leading-tight truncate max-w-[140px]" title={user?.username ? `@${user.username}` : user?.name || "My Account"}>
              {user?.username ? `@${user.username}` : user?.name || "My Account"}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[140px]">
              Personal Account
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};