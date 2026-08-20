export interface Subscription {
  id: string;
  name: string;
  amount: number;
  monthlyEquivalentAmount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  autoDebit: boolean;
  status: string;
  notes?: string;
  daysUntilRenewal: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionForm {
  name: string;
  amount: string;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  autoDebit: boolean;
  status: string;
  notes?: string;
}