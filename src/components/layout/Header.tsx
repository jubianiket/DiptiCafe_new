'use client';

import { Coffee } from 'lucide-react';
import { RoleSwitcher } from '@/components/auth/RoleSwitcher';
import { NewOrderSheet } from '@/components/dashboard/NewOrderSheet';
import type { UserRole } from '@/lib/types';

interface HeaderProps {
  role: UserRole;
}

export function Header({ role }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-md">
            <Coffee className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
            Dipti’s Orders
          </h1>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <NewOrderSheet />
            <RoleSwitcher currentRole={role} />
          </nav>
        </div>
      </div>
    </header>
  );
}
