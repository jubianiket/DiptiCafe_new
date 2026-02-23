'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { switchRole } from '@/lib/actions/auth';
import type { UserRole } from '@/lib/types';

interface RoleSwitcherProps {
  currentRole: UserRole;
}

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onRoleChange = (role: UserRole) => {
    startTransition(async () => {
      await switchRole(role);
      router.refresh();
    });
  };

  return (
    <Select value={currentRole} onValueChange={onRoleChange} disabled={isPending}>
      <SelectTrigger className="w-[120px] h-10">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Staff">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Staff</span>
          </div>
        </SelectItem>
        <SelectItem value="Admin">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
