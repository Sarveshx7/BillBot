import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { QuickExpenseModal } from "../expenses/QuickExpenseModal";

interface AppLayoutProps {
  activePage: string;
  onNavigate: (page: string) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activePage,
  onNavigate,
  title,
  subtitle,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Sliding Navigation Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onNavigate={(page) => {
          onNavigate(page);
          setSidebarOpen(false);
        }}
        onOpenAddExpense={() => setQuickExpenseOpen(true)}
      />

      {/* Full-width clean canvas */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={title}
          subtitle={subtitle}
          onNavigate={onNavigate}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Add Expense Modal */}
      <QuickExpenseModal
        isOpen={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event("billbot-expense-created"));
        }}
      />
    </div>
  );
};