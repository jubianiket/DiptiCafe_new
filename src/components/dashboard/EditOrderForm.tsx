'use client';

import { useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addItemsToOrder } from '@/lib/actions/orders';
import { Plus, Trash2, Loader } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Order } from '@/lib/types';
import { Separator } from '../ui/separator';

const itemSchema = z.object({
  id: z.string(),
  item_name: z.string().min(1, 'Name is required'),
  quantity: z.coerce.number().min(1, 'Min 1'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1, 'You must add at least one new item.'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditOrderFormProps {
  order: Order;
  onFormSubmit: () => void;
}

export function EditOrderForm({ order, onFormSubmit }: EditOrderFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ id: crypto.randomUUID(), item_name: '', quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');
  const newItemsTotal = watchedItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
  const newGrandTotal = order.total_amount + newItemsTotal;

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('items', JSON.stringify(data.items));

      const result = await addItemsToOrder(order.id, formData);

      if (result?.error) {
        let errorMessage = 'Could not add items to order.';
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else {
            const formError = (result.error as any).form;
            const itemsError = (result.error as any).items;
            if (formError) {
                errorMessage = Array.isArray(formError) ? formError.join(', ') : formError;
            } else if (itemsError) {
                errorMessage = Array.isArray(itemsError) ? itemsError.join(', ') : itemsError;
            }
        }
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Items added to order.' });
        form.reset();
        onFormSubmit();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6 h-[calc(100vh-8rem)] flex flex-col">
       <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Existing Items</Label>
            <div className='p-4 border rounded-lg bg-muted/50 text-sm'>
              <ul className="text-muted-foreground space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.item_name}
                    </span>
                    <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-foreground">
                  <span>Current Total</span>
                  <span>Rs. {order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>New Items</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <div className="col-span-3">
                    <Label htmlFor={`items.${index}.item_name`} className="text-xs">Name</Label>
                    <Input {...form.register(`items.${index}.item_name`)} id={`items.${index}.item_name`} placeholder="e.g., Extra Fries"/>
                  </div>
                  <div>
                    <Label htmlFor={`items.${index}.quantity`} className="text-xs">Qty</Label>
                    <Input type="number" {...form.register(`items.${index}.quantity`)} id={`items.${index}.quantity`}/>
                  </div>
                  <div>
                    <Label htmlFor={`items.${index}.price`} className="text-xs">Price</Label>
                    <Input type="number" step="0.01" {...form.register(`items.${index}.price`)} id={`items.${index}.price`}/>
                  </div>
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
             {form.formState.errors.items && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.items.message || form.formState.errors.items.root?.message}</p>}
          </div>

          <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), item_name: '', quantity: 1, price: 0 })}>
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>
      </ScrollArea>
      <div className="mt-auto pt-6 border-t space-y-4">
        <div className="flex justify-between items-center text-lg font-bold">
            <span>New Total:</span>
            <span>Rs. {newGrandTotal.toFixed(2)}</span>
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader className="animate-spin" /> : 'Add Items to Order'}
        </Button>
      </div>
    </form>
  );
}
