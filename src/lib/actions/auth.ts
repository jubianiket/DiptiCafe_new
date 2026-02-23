'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/lib/types';

export async function switchRole(role: UserRole) {
  cookies().set('role', role, {
    httpOnly: true,
    path: '/',
  });
  revalidatePath('/');
}
