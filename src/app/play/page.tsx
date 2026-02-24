import { Header } from '@/components/layout/Header';
import { getRole } from '@/lib/actions/auth';
import { getMenuItems } from '@/lib/actions/menu';
import { getActivePlaySessions } from '@/lib/actions/play';
import { getOrders } from '@/lib/actions/orders';
import { PlayClientPage } from '@/components/play/PlayClientPage';

export const dynamic = 'force-dynamic';

export default async function PlayPage() {
  const role = await getRole();
  const menuItems = await getMenuItems(); // Header needs this
  const activeSessions = await getActivePlaySessions();
  // Get active orders ('pending' or 'delivered') to add the play session bill to.
  const activeOrders = await getOrders({});

  return (
    <>
      <Header role={role} menuItems={menuItems} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Play Sessions</h1>
        </div>
        <PlayClientPage initialActiveSessions={activeSessions} activeOrders={activeOrders} />
      </main>
    </>
  )
}
