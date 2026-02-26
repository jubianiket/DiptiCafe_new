'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { InventoryItem } from '@/lib/types';

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

const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  quantity: z.coerce.number().int('Quantity must be a whole number.'),
  unit: z.string().optional(),
  low_stock_threshold: z.coerce.number().int('Threshold must be a whole number.').optional().nullable(),
});

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('inventory').select('*').order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch inventory items:', error.message);
    return [];
  }
  return data as InventoryItem[];
}

export async function addInventoryItem(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    quantity: formData.get('quantity'),
    unit: formData.get('unit'),
    low_stock_threshold: formData.get('low_stock_threshold') || null,
  };
  const validation = inventoryItemSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }
  
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('inventory').insert([validation.data]);

  if (error) {
    console.error('Supabase inventory item insert error:', error.message);
    if (error.code === '23505') { // unique constraint violation
        return { error: { name: ['An item with this name already exists.'] } };
    }
    return { error: { form: ['Failed to create inventory item.'] } };
  }

  return { success: true };
}

export async function updateInventoryItem(id: string, formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        quantity: formData.get('quantity'),
        unit: formData.get('unit'),
        low_stock_threshold: formData.get('low_stock_threshold') || null,
    };

    const validation = inventoryItemSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('inventory').update(validation.data).eq('id', id);

    if (error) {
        console.error('Supabase inventory update error:', error.message);
        if (error.code === '23505') {
            return { error: { name: ['An item with this name already exists.'] } };
        }
        return { error: { form: ['Failed to update inventory item.'] } };
    }

    return { success: true };
}

export async function deleteInventoryItem(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('inventory').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete inventory item:', error);
    return { error: 'Database error.' };
  }
  return { success: true };
}

/**
 * Adjusts the stock of an inventory item by a given delta.
 * If the item does not exist in inventory, it does nothing.
 * @param itemName The name of the item to adjust.
 * @param quantityDelta Positive to add to stock, negative to subtract.
 */
export async function adjustInventoryStock(itemName: string, quantityDelta: number) {
  const supabase = getSupabaseClient();
  
  // 1. Find the item
  const { data: item, error: fetchError } = await supabase
    .from('inventory')
    .select('id, quantity')
    .eq('name', itemName)
    .single();

  if (fetchError || !item) {
    // Item not found in inventory, skip silently as it might be a service/non-stocked item
    return;
  }

  // 2. Update the quantity
  const newQuantity = item.quantity + quantityDelta;
  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity: newQuantity })
    .eq('id', item.id);

  if (updateError) {
    console.error(`Failed to adjust inventory for ${itemName}:`, updateError.message);
  }
}
