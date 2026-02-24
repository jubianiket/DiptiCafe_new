import { Header } from '@/components/layout/Header';
import { getRole } from '@/lib/actions/auth';
import { getMenuItems } from '@/lib/actions/menu';
import { getInventoryItems } from '@/lib/actions/inventory';
import { InventoryClientPage } from '@/components/inventory/InventoryClientPage';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const role = await getRole();
  const menuItems = await getMenuItems(); // Header needs this
  const inventoryItems = await getInventoryItems();

  return (
    <>
      <Header role={role} menuItems={menuItems} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Inventory Management</h1>
        </div>
        <InventoryClientPage initialItems={inventoryItems} />
      </main>
    </>
  )
}
