export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  currency: string;
  timezone: string;
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;
  taxNumber?: string;
  invoicePrefix?: string;
  invoiceNotesDefault?: string;
  termsDefault?: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  userId: string;
  name: string;
  username?: string;
  email: string;
}

export interface UserProfileRequest {
  name: string;
  username?: string;
  currency?: string;
  timezone?: string;
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;
  taxNumber?: string;
  invoicePrefix?: string;
  invoiceNotesDefault?: string;
  termsDefault?: string;
}