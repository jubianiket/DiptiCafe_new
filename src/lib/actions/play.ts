'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { PlaySession, TableType } from '@/lib/types';
import { formatDistance } from 'date-fns';

function getSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    !supabaseAnonKey ||
    supabaseAnonKey.trim() === '' ||
    supabaseAnonKey === 'your-supabase-anon-key'
  ) {
    throw new Error(
      "Your project's Supabase anon key is missing! Please update the NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. Check your Supabase project's API settings to find this value: https://supabase.com/dashboard/project/_/settings/api"
    );
  }


  return createServerClient(supabaseUrl, supabaseAnonKey, {
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

    const { data: sessionToEnd, error: fetchError } = await supabase
        .from('play_sessions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !sessionToEnd) {
        console.error('Failed to fetch session to end:', fetchError?.message);
        return { error: 'Could not find the session to end.' };
    }

    if (sessionToEnd.status === 'finished') {
        return { error: 'Session has already been finished.' };
    }
    
    const endTime = new Date();
    const startTime = new Date(sessionToEnd.start_time);
    const durationMs = endTime.getTime() - startTime.getTime();
    
    const TABLE_RATES = {
      pool: 120,
      snooker: 150,
    };
    const rate = TABLE_RATES[sessionToEnd.table_type];
    const cost = (durationMs / (1000 * 60 * 60)) * rate;
    const durationStr = formatDistance(endTime, startTime, { includeSeconds: true });


    const { data: updatedSession, error: updateError } = await supabase
        .from('play_sessions')
        .update({ status: 'finished', end_time: endTime.toISOString() })
        .eq('id', id)
        .select()
        .single();
        
    if (updateError) {
        console.error('Failed to end play session:', updateError.message);
        return { error: 'Database error ending session.' };
    }

    return { success: true, session: updatedSession, cost, durationStr };
}
