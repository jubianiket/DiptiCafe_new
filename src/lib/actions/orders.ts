'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { OrderStatus, DailySummary, Order, OrderItem } from '@/lib/types';

const itemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price cannot be negative'),
});

const orderSchema = z.object({
  table_number: z.coerce.number().optional(),
  customer_name: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
});

function getSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function createOrder(formData: FormData) {
  const rawData = {
    table_number: formData.get('table_number'),
    customer_name: formData.get('customer_name'),
    items: JSON.parse(formData.get('items') as string),
  };

  const validation = orderSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const { items, ...rest } = validation.data;
  
  const total_amount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!rest.table_number && !rest.customer_name) {
      return { error: { form: 'Either Table Number or Customer Name must be provided.' } };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('orders').insert({
    ...rest,
    items,
    total_amount,
    status: 'Pending',
  });

  if (error) {
    console.error('Supabase error:', error.message);
    return { error: { form: 'Failed to create order. Please try again.' } };
  }

  revalidatePath('/');
  return { success: true };
}

export async function getOrders({ status }: { status?: OrderStatus }): Promise<Order[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }

  return data as Order[];
}

export async function getDailySummary(): Promise<DailySummary> {
  const supabase = getSupabaseClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error, count } = await supabase
    .from('orders')
    .select('total_amount', { count: 'exact' })
    .eq('status', 'Paid')
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  if (error) {
    console.error('Failed to fetch daily summary:', error);
    return { total_orders: 0, total_revenue: 0 };
  }

  const total_revenue = data.reduce((acc, order) => acc + order.total_amount, 0);
  
  return { total_orders: count ?? 0, total_revenue };
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);

  if (error) {
    console.error('Failed to update order status:', error);
    return { error: 'Database error.' };
  }
  revalidatePath('/');
  return { success: true };
}

export async function deleteOrder(id: number) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('orders').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete order:', error);
    return { error: 'Database error.' };
  }
  revalidatePath('/');
  return { success: true };
}