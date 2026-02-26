'use client';

import type { Order, DailySummary, UserRole, OrderStatus, MenuItem, RevenueRange, RevenueDataPoint, ItemPopularityData } from '@/lib/types';
import { SalesSummary } from './SalesSummary';
import { OrderFilters } from './OrderFilters';
import { OrderList } from './OrderList';
import { RevenueChart } from './RevenueChart';
import { ItemPopularityChart } from './ItemPopularityChart';

interface DashboardProps {
  orders: Order[];
  summary: DailySummary;
  role: UserRole;
  statusFilter?: OrderStatus;
  revenueRange: RevenueRange;
  menuItems: MenuItem[];
  revenueData?: RevenueDataPoint[];
  popularityData?: ItemPopularityData[];
}

export function Dashboard({
  orders,
  summary,
  role,
  statusFilter,
  revenueRange,
  menuItems,
  revenueData,
  popularityData,
}: DashboardProps) {

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="space-y-6">
             <SalesSummary summary={summary} role={role} />
             {role === 'Admin' && revenueData && popularityData && (
                <div className="grid gap-6 md:grid-cols-2">
                    <RevenueChart data={revenueData} currentRange={revenueRange} />
                    <ItemPopularityChart data={popularityData} currentRange={revenueRange} />
                </div>
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
