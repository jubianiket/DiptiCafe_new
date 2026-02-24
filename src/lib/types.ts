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
  phone_number: string | null;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  created_by: string | null;
}

export interface DailySummary {
  total_orders: number;
  total_revenue: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  created_at: string;
}

export type TableType = 'pool' | 'snooker';
export type PlayStatus = 'active' | 'finished';

export interface PlaySession {
  id: string;
  table_type: TableType;
  start_time: string;
  end_time: string | null;
  status: PlayStatus;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  updated_at: string;
  low_stock_threshold: number | null;
}
