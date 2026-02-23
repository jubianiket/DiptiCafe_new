'use server';

import { cookies } from 'next/headers';
import type { UserRole } from '@/lib/types';

export async function switchRole(role: UserRole) {
  cookies().set('role', role, {
    httpOnly: true,
    path: '/',
  });
}
