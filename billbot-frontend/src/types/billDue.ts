export interface BillDue {
  id: string;
  billerName: string;
  amount: number;
  currency: string;
  dueDate: string;
  category: string;
  recurringFrequency: string;
  isPaid: boolean;
  paidDate?: string;
  autoPay: boolean;
  notes?: string;
  daysUntilDue: number;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillDueForm {
  billerName: string;
  amount: string;
  currency: string;
  dueDate: string;
  category: string;
  recurringFrequency: string;
  autoPay: boolean;
  notes?: string;
}