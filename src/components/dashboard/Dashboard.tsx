'use client';

import { useState, useEffect } from 'react';
import type { Order, DailySummary, UserRole, OrderStatus } from '@/lib/types';
import { SalesSummary } from './SalesSummary';
import { OrderFilters } from './OrderFilters';
import { OrderList } from './OrderList';

interface DashboardProps {
  initialOrders: Order[];
  initialSummary: DailySummary;
  role: UserRole;
  statusFilter?: OrderStatus;
}

export function Dashboard({
  initialOrders,
  initialSummary,
  role,
  statusFilter,
}: DashboardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [summary, setSummary] = useState(initialSummary);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

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
