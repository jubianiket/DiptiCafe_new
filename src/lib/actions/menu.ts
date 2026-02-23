'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { MenuItem } from '@/lib/types';
import * as xlsx from 'xlsx';

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

const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
});

export async function createMenuItem(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    price: formData.get('price'),
  };
  const validation = menuItemSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }
  
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('menu_items').insert([validation.data]);

  if (error) {
    console.error('Supabase menu item insert error:', error.message);
    return { error: { form: 'Failed to create menu item. Please try again.' } };
  }

  return { success: true };
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch menu items:', error.message);
    return [];
  }
  return data as MenuItem[];
}

export async function uploadMenuItems(formData: FormData) {
  const file = formData.get('file') as File | null;
  if (!file) {
    return { error: 'No file uploaded.' };
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(worksheet) as { name: string; price: number }[];

    const menuItems = json.map(item => ({
      name: String(item.name),
      price: Number(item.price),
    }));

    // Validate data
    const validatedItems = z.array(menuItemSchema).safeParse(menuItems);
    if (!validatedItems.success) {
        return { error: 'Invalid file format. Please ensure columns are "name" and "price", and data is valid.' };
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('menu_items').insert(validatedItems.data);

    if (error) {
      console.error('Supabase bulk insert error:', error.message);
      return { error: 'Failed to upload menu items. Please check the data and try again.' };
    }

    return { success: true };
  } catch (e) {
    console.error('File upload error:', e);
    return { error: 'Failed to parse the uploaded file.' };
  }
}
