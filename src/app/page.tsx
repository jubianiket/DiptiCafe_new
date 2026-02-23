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
    <div className="flex flex-col min-h-screen">
      <Header role={role} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Dashboard
          initialOrders={orders}
          initialSummary={summary}
          role={role}
          statusFilter={status}
        />
      </main>
    </div>
  );
}
