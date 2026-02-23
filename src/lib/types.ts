export type OrderStatus = 'pending' | 'delivered' | 'paid';

export type UserRole = 'Admin' | 'Staff';

export interface OrderItem {
  id: string; // This is the order_item id from the database
  item_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string; // This is the order id
  created_at: string;
  table_no: string | null;
  customer_name: string | null;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  created_by: string | null;
}

export interface DailySummary {
  total_orders: number;
  total_revenue: number;
}
