
export enum UserRole {
  ADMIN = 'ADMIN'
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  tax: number;
  discount: number;
  paymentMethod: 'CASH' | 'CARD' | 'QRIS';
  amountPaid: number;
  changeDue: number;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
}

export type CustomerTier = 'BRONZE' | 'SILVER' | 'GOLD';

export type RFMSegment = 'CHAMPIONS' | 'LOYAL' | 'AT_RISK' | 'HIBERNATING';

export interface CustomerFeedback {
  date: string;
  rating: number;
  comment: string;
}

export interface Customer {
  id: string; // WhatsApp Number
  nickname: string;
  points: number;
  tier: CustomerTier;
  note: string;
  lastVisit: string;
  joinDate: string;
  clv: number;
  visitCount: number;
  segment: RFMSegment;
  feedback: CustomerFeedback[];
  favoriteProducts: string[];
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  targetSegment: RFMSegment | 'ALL';
  discountValue: number;
  type: 'PERCENTAGE' | 'FIXED';
  active: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  pin: string;
}

export type View = 'LANDING' | 'DASHBOARD' | 'INVENTORY' | 'HISTORY' | 'EMPLOYEES' | 'REPORTS' | 'CUSTOMERS' | 'PROMOS' | 'OUTLETS' | 'SETTINGS';
