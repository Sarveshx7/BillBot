export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  paymentMethod: string;
  expenseDate: string;
  source?: string;
  notes?: string;
}

export interface ExpenseForm {
  merchant: string;
  amount: string;
  currency: string;
  expenseDate: string;
  category: string;
  paymentMethod: string;
  source: string;
  notes: string;
}