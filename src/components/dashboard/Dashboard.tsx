'use client';

import type { Order, DailySummary, UserRole, OrderStatus } from '@/lib/types';
import { SalesSummary } from './SalesSummary';
import { OrderFilters } from './OrderFilters';
import { OrderList } from './OrderList';

interface DashboardProps {
  orders: Order[];
  summary: DailySummary;
  role: UserRole;
  statusFilter?: OrderStatus;
}

export function Dashboard({
  orders,
  summary,
  role,
  statusFilter,
}: DashboardProps) {

  return (
    <div className="space-y-6">
      <SalesSummary summary={summary} />
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Active Orders</h2>
        <OrderFilters currentFilter={statusFilter} />
        <OrderList orders={orders} role={role} />
      </div>
    </div>
  );
}
