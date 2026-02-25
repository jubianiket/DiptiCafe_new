'use client';

import type { Order, DailySummary, UserRole, OrderStatus, MenuItem } from '@/lib/types';
import { SalesSummary } from './SalesSummary';
import { OrderFilters } from './OrderFilters';
import { OrderList } from './OrderList';
import { RevenueChart } from './RevenueChart';

interface DashboardProps {
  orders: Order[];
  summary: DailySummary;
  role: UserRole;
  statusFilter?: OrderStatus;
  menuItems: MenuItem[];
  weeklyRevenue?: { date: string; revenue: number }[];
}

export function Dashboard({
  orders,
  summary,
  role,
  statusFilter,
  menuItems,
  weeklyRevenue,
}: DashboardProps) {

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
             <SalesSummary summary={summary} role={role} />
             {role === 'Admin' && weeklyRevenue && (
                <RevenueChart data={weeklyRevenue} />
             )}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Active Orders</h2>
        <OrderFilters currentFilter={statusFilter} />
        <OrderList orders={orders} role={role} menuItems={menuItems} />
      </div>
    </div>
  );
}
