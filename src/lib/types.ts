export type OrderStatus = 'Pending' | 'Delivered' | 'Paid';

export type UserRole = 'Admin' | 'Staff';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  created_at: string;
  table_number: number | null;
  customer_name: string | null;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
}

export interface DailySummary {
  total_orders: number;
  total_revenue: number;
}
