import { Header } from '@/components/layout/Header';
import { cookies } from 'next/headers';
import type { UserRole } from '@/lib/types';
import { getActivePlaySessions } from '@/lib/actions/play';
import { PlayClientPage } from '@/components/play/PlayClientPage';

export default async function PlayPage() {
  const cookieStore = cookies();
  const role = (cookieStore.get('role')?.value || 'Staff') as UserRole;
  const activeSessions = await getActivePlaySessions();

  return (
    <>
      <Header role={role} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Play Zone</h1>
        </div>
        <PlayClientPage initialActiveSessions={activeSessions} />
      </main>
    </>
  );
}
