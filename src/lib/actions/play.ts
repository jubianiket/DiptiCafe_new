'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { PlaySession, TableType } from '@/lib/types';

function getSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (
    !supabaseUrl ||
    supabaseUrl.trim() === '' ||
    supabaseUrl === 'your-supabase-project-url'
  ) {
    throw new Error(
      "Your project's Supabase URL is missing! Please update the NEXT_PUBLIC_SUPABASE_URL in your .env.local file. Check your Supabase project's API settings to find this value: https://supabase.com/dashboard/project/_/settings/api"
    );
  }
  
  if (!supabaseUrl.startsWith('http')) {
      throw new Error(
      `Your Supabase URL looks invalid. It must be a valid HTTP or HTTPS URL. You provided: '${supabaseUrl}'. Please correct it in your .env.local file.`
    );
  }

  if (
    !supabasePublishableKey ||
    supabasePublishableKey.trim() === '' ||
    supabasePublishableKey === 'your-supabase-publishable-key'
  ) {
    throw new Error(
      "Your project's Supabase publishable key is missing! Please update the NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your .env.local file. Check your Supabase project's API settings to find this value: https://supabase.com/dashboard/project/_/settings/api"
    );
  }


  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

export async function getActivePlaySessions(): Promise<PlaySession[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('play_sessions')
        .select('*')
        .eq('status', 'active');
    
    if (error) {
        console.error('Failed to fetch active play sessions:', error.message);
        return [];
    }
    return data;
}

export async function startPlaySession(tableType: TableType) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('play_sessions')
        .insert({ table_type: tableType, status: 'active' })
        .select()
        .single();
    
    if (error) {
        console.error('Failed to start play session:', error.message);
        return { error: 'Database error starting session.' };
    }

    return { success: true, session: data };
}

export async function endPlaySession(id: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('play_sessions')
        .update({ status: 'finished', end_time: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
    if (error) {
        console.error('Failed to end play session:', error.message);
        return { error: 'Database error ending session.' };
    }

    return { success: true, session: data };
}
