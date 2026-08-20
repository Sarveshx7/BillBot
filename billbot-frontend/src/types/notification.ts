export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "BILL_DUE" | "OVERDUE" | "AUTOPAY_DEBIT" | "SYSTEM";
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}