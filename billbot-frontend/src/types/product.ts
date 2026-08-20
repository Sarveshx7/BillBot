export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  taxRate: number;
  unit: string;
  category?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  taxRate?: number;
  unit?: string;
  category?: string;
  active?: boolean;
}