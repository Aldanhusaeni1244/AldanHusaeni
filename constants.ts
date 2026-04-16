
import { Product, Employee, UserRole, Customer, Campaign } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', barcode: '899123456701', name: 'Fresh Milk 1L', category: 'Dairy', price: 18000, cost: 15000, stock: 45, minStock: 10 },
  { id: '2', barcode: '899123456702', name: 'Whole Wheat Bread', category: 'Bakery', price: 22000, cost: 18500, stock: 12, minStock: 5 },
  { id: '3', barcode: '899123456703', name: 'Dark Chocolate 100g', category: 'Snacks', price: 15000, cost: 12000, stock: 60, minStock: 15 },
  { id: '4', barcode: '899123456704', name: 'Instant Coffee Gold', category: 'Beverage', price: 45000, cost: 38000, stock: 25, minStock: 5 },
  { id: '5', barcode: '899123456705', name: 'Alkaline Water 600ml', category: 'Beverage', price: 65000, cost: 4000, stock: 120, minStock: 20 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { 
    id: '6281234567890', 
    nickname: 'Andi', 
    points: 1250, 
    tier: 'GOLD', 
    note: 'Suka kopi panas, member prioritas',
    lastVisit: '2026-04-01',
    joinDate: '2025-01-10',
    clv: 2500000,
    visitCount: 15,
    segment: 'CHAMPIONS',
    feedback: [
      { date: '2026-03-20', rating: 5, comment: 'Layanan sangat cepat!' }
    ],
    favoriteProducts: ['Fresh Milk 1L', 'Instant Coffee Gold']
  },
  { 
    id: '6289876543210', 
    nickname: 'Santi', 
    points: 450, 
    tier: 'SILVER', 
    note: 'Sering beli produk dairy',
    lastVisit: '2026-03-15',
    joinDate: '2025-05-20',
    clv: 850000,
    visitCount: 8,
    segment: 'LOYAL',
    feedback: [],
    favoriteProducts: ['Fresh Milk 1L']
  },
  { 
    id: '6281122334455', 
    nickname: 'Budi', 
    points: 50, 
    tier: 'BRONZE', 
    note: 'Pelanggan baru',
    lastVisit: '2026-04-10',
    joinDate: '2026-03-25',
    clv: 120000,
    visitCount: 2,
    segment: 'HIBERNATING',
    feedback: [],
    favoriteProducts: ['Dark Chocolate 100g']
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-01',
    name: 'Rindu Member At Risk',
    description: 'Diskon khusus untuk mengajak member kembali belanja.',
    targetSegment: 'AT_RISK',
    discountValue: 20,
    type: 'PERCENTAGE',
    active: true
  },
  {
    id: 'cmp-02',
    name: 'Loyalty Boost',
    description: 'Poin ganda untuk member loyal.',
    targetSegment: 'LOYAL',
    discountValue: 5000,
    type: 'FIXED',
    active: true
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-01', name: 'Budi Santoso', role: UserRole.ADMIN, status: 'ACTIVE', lastLogin: '2023-10-27 08:30', pin: '1234' },
];

export const CURRENCY = 'IDR';
