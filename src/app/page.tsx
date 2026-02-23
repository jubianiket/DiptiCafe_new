import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { getOrders, getDailySummary } from '@/lib/actions/orders';
import type { OrderStatus } from '@/lib/types';
import { cookies } from 'next/headers';
import type { UserRole } from '@/lib/types';

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const status = searchParams.status as OrderStatus | undefined;
  const cookieStore = cookies();
  const role = (cookieStore.get('role')?.value || 'Staff') as UserRole;
  
  const orders = await getOrders({ status });
  const summary = await getDailySummary();

  return (
    <>
      <Header role={role} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Dashboard
          initialOrders={orders}
          initialSummary={summary}
          role={role}
          statusFilter={status}
        />
      </main>
    </>
  );
}
