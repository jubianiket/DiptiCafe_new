import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { getOrders, getDailySummary, getRevenueReport } from '@/lib/actions/orders';
import type { OrderStatus, RevenueRange } from '@/lib/types';
import { getRole } from '@/lib/actions/auth';
import { getMenuItems } from '@/lib/actions/menu';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const status = searchParams.status as OrderStatus | undefined;
  const range = (searchParams.range as RevenueRange) || '5days';
  const role = await getRole();
  
  const orders = await getOrders({ status });
  const summary = await getDailySummary();
  const menuItems = await getMenuItems();
  const revenueData = role === 'Admin' ? await getRevenueReport(range) : undefined;

  return (
    <>
      <Header role={role} menuItems={menuItems} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Dashboard
          key={`${status || 'all'}-${range}`}
          orders={orders}
          summary={summary}
          role={role}
          statusFilter={status}
          revenueRange={range}
          menuItems={menuItems}
          revenueData={revenueData}
        />
      </main>
    </>
  );
}
