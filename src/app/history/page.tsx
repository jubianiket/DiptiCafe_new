import { Header } from '@/components/layout/Header';
import { getOrders } from '@/lib/actions/orders';
import { getRole } from '@/lib/actions/auth';
import { getMenuItems } from '@/lib/actions/menu';
import { HistoryList } from '@/components/history/HistoryList';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const role = await getRole();
  const paidOrders = await getOrders({ status: 'paid' });
  const menuItems = await getMenuItems();

  return (
    <>
      <Header role={role} menuItems={menuItems} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Order History</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing all completed and paid orders grouped by date.
        </p>
        <HistoryList orders={paidOrders} role={role} menuItems={menuItems} />
      </main>
    </>
  );
}
