import { BillDue } from "./billDue";
import { Subscription } from "./subscription";

export interface CategorySpending {
  category: string;
  amount: number;
  percentage?: number;
  count?: number;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  count?: number;
}

export interface RecentExpense {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  expenseDate: string;
  paymentMethod?: string;
}

export interface PersonalDashboard {
  totalSpentThisMonth: number;
  totalSpentLastMonth: number;
  monthlySpendChangePercent: number;
  totalUnpaidDues: number;
  upcomingDuesCount: number;
  monthlySubscriptionBurnRate: number;
  activeSubscriptionsCount: number;
  totalExpensesCount: number;
  recentExpenses: RecentExpense[];
  upcomingDues: BillDue[];
  activeSubscriptions: Subscription[];
  categorySpending: CategorySpending[];
  monthlySpendingTrend: MonthlySpending[];
}

export interface Analytics {
  totalSpent: number;
  averageExpense: number;
  highestExpense: number;
  totalTransactions: number;
  monthlySpending: MonthlySpending[];
  categorySpending: CategorySpending[];
}