import type { Order, UserRole, MenuItem } from '@/lib/types';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  orders: Order[];
  role: UserRole;
  menuItems: MenuItem[];
}

export function OrderList({ orders, role, menuItems }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
        <h3 className="text-lg font-semibold text-muted-foreground">No orders found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new order.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} role={role} menuItems={menuItems} />
      ))}
    </div>
  );
}
