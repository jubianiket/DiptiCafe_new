'use client';

import { format } from 'date-fns';
import type { Order, UserRole, MenuItem } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { OrderCard } from '@/components/dashboard/OrderCard';

interface HistoryListProps {
  orders: Order[];
  role: UserRole;
  menuItems: MenuItem[];
}

export function HistoryList({ orders, role, menuItems }: HistoryListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
        <h3 className="text-lg font-semibold text-muted-foreground">No history found</h3>
        <p className="text-sm text-muted-foreground">Completed orders will appear here.</p>
      </div>
    );
  }

  // Group orders by date
  const groupedOrders = orders.reduce((groups, order) => {
    const date = format(new Date(order.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {} as Record<string, Order[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => b.localeCompare(a));

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {sortedDates.map((date) => (
        <AccordionItem key={date} value={date} className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="text-lg font-semibold">
                {format(new Date(date), 'MMMM do, yyyy')}
              </span>
              <span className="text-sm text-muted-foreground font-normal">
                {groupedOrders[date].length} {groupedOrders[date].length === 1 ? 'order' : 'orders'}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {groupedOrders[date].map((order) => (
                <OrderCard key={order.id} order={order} role={role} menuItems={menuItems} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
