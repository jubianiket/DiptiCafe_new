'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { OrderStatus, DailySummary, Order } from '@/lib/types';

// Schema for items coming from the form
const formItemSchema = z.object({
  id: z.string().optional(),
  item_name: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
});

// Schema for a new order coming from the form
const formOrderSchema = z.object({
  table_no: z.string().optional(),
  customer_name: z.string().optional(),
  phone_number: z.string().optional(),
  items: z.array(formItemSchema).min(1, 'At least one item is required'),
});

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

export async function createOrder(formData: FormData) {
  const rawData = {
    table_no: (formData.get('table_no') as string) || undefined,
    customer_name: (formData.get('customer_name') as string) || undefined,
    phone_number: (formData.get('phone_number') as string) || undefined,
    items: JSON.parse(formData.get('items') as string),
  };
  
  const validation = formOrderSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }
  
  if (!validation.data.table_no && !validation.data.customer_name) {
      return { error: { form: ['Either Table Number or Customer Name must be provided.'] } };
  }

  const { items, ...orderData } = validation.data;
  
  const total_amount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const supabase = getSupabaseClient();
  
  // 1. Insert the order
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      total_amount,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) {
    console.error('Supabase order insert error:', orderError.message);
    return { error: { form: ['Failed to create order. Please try again.'] } };
  }

  // 2. Prepare and insert order items
  const orderItemsData = items.map(item => ({
    order_id: newOrder.id,
    item_name: item.item_name,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);

  if (itemsError) {
    console.error('Supabase items insert error:', itemsError.message);
    // Attempt to roll back by deleting the order
    await supabase.from('orders').delete().eq('id', newOrder.id);
    return { error: { form: ['Failed to save order items. Order creation was rolled back.'] } };
  }

  return { success: true };
}

export async function getOrders({ status }: { status?: OrderStatus }): Promise<Order[]> {
    const supabase = getSupabaseClient();
    let query = supabase.from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });
  
    if (status) {
      query = query.eq('status', status);
    } else {
      // If no status filter is applied, show only pending and delivered orders on the main dashboard
      query = query.in('status', ['pending', 'delivered']);
    }
  
    const { data: ordersData, error: ordersError } = await query;
  
    if (ordersError) {
      console.error('Failed to fetch orders:', ordersError.message);
      return [];
    }
    if (!ordersData) {
        return [];
    }
  
    return ordersData as Order[];
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
    .eq('status', 'paid')
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  if (error) {
    console.error('Failed to fetch daily summary:', error);
    return { total_orders: 0, total_revenue: 0 };
  }
  
  const total_revenue = data ? data.reduce((acc, order) => acc + order.total_amount, 0) : 0;
  
  return { total_orders: count ?? 0, total_revenue };
}

export async function getWeeklyRevenue(): Promise<{ date: string; revenue: number }[]> {
  const supabase = getSupabaseClient();
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .eq('status', 'paid')
    .gte('created_at', sevenDaysAgo.toISOString())
    .lte('created_at', today.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch weekly revenue:', error);
    return [];
  }

  // Create map for all 7 days to ensure we have entries for days with zero revenue
  const dailyData: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dailyData[dateStr] = 0;
  }

  data?.forEach(order => {
    const dateStr = new Date(order.created_at).toISOString().split('T')[0];
    if (dailyData[dateStr] !== undefined) {
      dailyData[dateStr] += order.total_amount;
    }
  });

  return Object.entries(dailyData).map(([date, revenue]) => ({
    date,
    revenue
  }));
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);

  if (error) {
    console.error('Failed to update order status:', error);
    return { error: 'Database error.' };
  }
  return { success: true };
}

export async function deleteOrder(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('orders').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete order:', error);
    return { error: 'Database error.' };
  }
  return { success: true };
}

const updateOrderSchema = z.object({
  table_no: z.string().optional(),
  customer_name: z.string().optional(),
  phone_number: z.string().optional(),
  items: z.array(formItemSchema).min(1, 'Order must have at least one item.'),
}).refine(data => data.table_no || data.customer_name, {
  message: "Either Table Number or Customer Name is required.",
  path: ["customer_name"],
});


export async function updateOrder(orderId: string, formData: FormData) {
  const rawData = {
    table_no: (formData.get('table_no') as string) || undefined,
    customer_name: (formData.get('customer_name') as string) || undefined,
    phone_number: (formData.get('phone_number') as string) || undefined,
    items: formData.has('items') ? JSON.parse(formData.get('items') as string) : [],
  };

  const validation = updateOrderSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const { items, ...detailsToUpdate } = validation.data;
  const supabase = getSupabaseClient();

  // 1. Delete all existing items for the order
  const { error: deleteError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId);

  if (deleteError) {
    console.error('Supabase delete items error:', deleteError.message);
    return { error: { form: ['Failed to update items. Could not clear old items.'] } };
  }

  // 2. Prepare and insert the new set of items
  const newTotalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const newOrderItemsData = items.map(item => ({
    order_id: orderId,
    item_name: item.item_name,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: insertError } = await supabase.from('order_items').insert(newOrderItemsData);

  if (insertError) {
    console.error('Supabase insert new items error:', insertError.message);
    // In a real production app, you'd want to wrap this in a transaction or at least
    // attempt to restore the previously deleted items.
    return { error: { form: ['Failed to save new item list after clearing the old one. Order may be in an inconsistent state.'] } };
  }
  
  // 3. Update the order itself with new total and details
  const orderUpdatePayload = {
    ...detailsToUpdate,
    total_amount: newTotalAmount,
  };
  
  // Supabase client ignores undefined keys, so this is safe.
  const { error: updateError } = await supabase
      .from('orders')
      .update(orderUpdatePayload)
      .eq('id', orderId);
  
  if (updateError) {
      console.error('Supabase update order error:', updateError.message);
      return { error: { form: ['Failed to update order details and total.'] } };
  }

  return { success: true };
}
