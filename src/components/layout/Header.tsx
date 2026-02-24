'use client';

import { RoleSwitcher } from '@/components/auth/RoleSwitcher';
import { NewOrderSheet } from '@/components/dashboard/NewOrderSheet';
import type { UserRole, MenuItem } from '@/lib/types';
import { MobileNav } from './MobileNav';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface HeaderProps {
  role: UserRole;
  menuItems: MenuItem[];
}

export function Header({ role, menuItems }: HeaderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <header className="flex h-14 items-center gap-4 border-b bg-card/80 px-4 lg:h-[60px] lg:px-6 backdrop-blur-sm sticky top-0 z-30">
        <Skeleton className="h-10 w-10 shrink-0 md:hidden" />
        <div className="w-full flex-1">
            {/* Can add search here if needed */}
        </div>
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-[120px]" />
      </header>
    );
  }

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
