'use client';

import { RoleSwitcher } from '@/components/auth/RoleSwitcher';
import { NewOrderSheet } from '@/components/dashboard/NewOrderSheet';
import type { UserRole, MenuItem } from '@/lib/types';
import { MobileNav } from './MobileNav';

interface HeaderProps {
  role: UserRole;
  menuItems: MenuItem[];
}

export function Header({ role, menuItems }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card/80 px-4 lg:h-[60px] lg:px-6 backdrop-blur-sm sticky top-0 z-30">
        <MobileNav />
        <div className="w-full flex-1">
            {/* Can add search here if needed */}
        </div>
        <NewOrderSheet menuItems={menuItems} />
        <RoleSwitcher currentRole={role} />
    </header>
  );
}
