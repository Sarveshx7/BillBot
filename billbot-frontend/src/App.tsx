import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { BillsDuePage } from "./pages/bills/BillsDuePage";
import { SubscriptionsPage } from "./pages/subscriptions/SubscriptionsPage";
import { ScanBillPage } from "./pages/scan/ScanBillPage";
import { AnalyticsPage } from "./pages/analytics/AnalyticsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import "./App.css";

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [activePage, setActivePage] = useState<string>("dashboard");

  const handleNavigate = (page: string) => {
    setActivePage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner message="Initializing BillBot personal session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === "register") {
      return (
        <RegisterPage
          onNavigateLogin={() => setAuthView("login")}
          onSuccess={() => setActivePage("dashboard")}
        />
      );
    }
    return (
      <LoginPage
        onNavigateRegister={() => setAuthView("register")}
        onSuccess={() => setActivePage("dashboard")}
      />
    );
  }

  const getPageTitle = () => {
    switch (activePage) {
      case "dashboard":
        return { title: "Personal Dashboard", subtitle: "Daily expense tracking, upcoming bills, and subscriptions" };
      case "expenses":
        return { title: "Daily Expenses", subtitle: "Log, filter, and track where your money goes every day" };
      case "bills":
        return { title: "Bills & Due Dates", subtitle: "Never miss an electricity, broadband, rent, or card payment" };
      case "subscriptions":
        return { title: "Subscriptions Manager", subtitle: "Monitor recurring memberships, renewal dates, and monthly burn rate" };
      case "scan":
        return { title: "Scan Bill (AI OCR)", subtitle: "Capture receipts to auto-record expenses or schedule upcoming bills" };
      case "analytics":
        return { title: "Analytics & Budget", subtitle: "Visual category distribution and monthly spend trends" };
      case "settings":
        return { title: "Settings", subtitle: "Theme switcher, account profile & currency settings" };
      default:
        return { title: "BillBot Personal Finance", subtitle: "" };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      title={title}
      subtitle={subtitle}
    >
      {activePage === "dashboard" && <DashboardPage onNavigate={handleNavigate} />}
      {activePage === "expenses" && <ExpensesPage />}
      {activePage === "bills" && <BillsDuePage />}
      {activePage === "subscriptions" && <SubscriptionsPage />}
      {activePage === "scan" && <ScanBillPage onNavigate={handleNavigate} />}
      {activePage === "analytics" && <AnalyticsPage />}
      {activePage === "settings" && <SettingsPage />}
    </AppLayout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;