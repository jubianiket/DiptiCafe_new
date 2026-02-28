'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is missing.");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

export async function getSetting(key: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error(`Failed to fetch setting ${key}:`, error.message);
    return null;
  }
  return data.value;
}

export async function updateSetting(key: string, value: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value });

  if (error) {
    console.error(`Failed to update setting ${key}:`, error.message);
    return { error: error.message };
  }

  return { success: true };
}
