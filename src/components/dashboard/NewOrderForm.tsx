'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/actions/orders';
import { Plus, Trash2, Loader } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const itemSchema = z.object({
  item_name: z.string().min(1, 'Name is required'),
  quantity: z.coerce.number().min(1, 'Min 1'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
});

const formSchema = z.object({
  table_no: z.string().optional(),
  customer_name: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Order must have at least one item.'),
}).refine(data => data.table_no || data.customer_name, {
  message: "Either Table Number or Customer Name is required.",
  path: ["customer_name"],
});

type FormValues = z.infer<typeof formSchema>;

interface NewOrderFormProps {
  onFormSubmit: () => void;
}

export function NewOrderForm({ onFormSubmit }: NewOrderFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ item_name: '', quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');
  const total = watchedItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (data.table_no) formData.append('table_no', data.table_no);
      if (data.customer_name) formData.append('customer_name', data.customer_name);
      formData.append('items', JSON.stringify(data.items));

      const result = await createOrder(formData);

      if (result?.error) {
        if(typeof result.error !== 'string') {
          for (const [field, messages] of Object.entries(result.error)) {
            if (field === 'form' && messages) {
               toast({ title: 'Error', description: messages.join(', '), variant: 'destructive' });
            } else {
              form.setError(field as keyof FormValues, { type: 'manual', message: messages?.join(', ') });
            }
          }
        } else {
           toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
      } else {
        toast({ title: 'Success', description: 'New order created.' });
        form.reset();
        onFormSubmit();
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6 h-[calc(100vh-8rem)] flex flex-col">
       <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input id="customer_name" {...form.register('customer_name')} />
             {form.formState.errors.customer_name && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.customer_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="table_no">Table Number</Label>
            <Input id="table_no" {...form.register('table_no')} />
          </div>

          <div className="space-y-2">
            <Label>Items</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md bg-muted/50">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <div className="col-span-3">
                    <Label htmlFor={`items.${index}.item_name`} className="text-xs">Name</Label>
                    <Input {...form.register(`items.${index}.item_name`)} id={`items.${index}.item_name`} placeholder="e.g., Cappuccino"/>
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
             {form.formState.errors.items?.root && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.items.root.message}</p>}
             {form.formState.errors.items && typeof form.formState.errors.items !== 'undefined' && !form.formState.errors.items.root && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.items.message}</p>}
          </div>

          <Button type="button" variant="outline" onClick={() => append({ item_name: '', quantity: 1, price: 0 })}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </ScrollArea>
      <div className="mt-auto pt-6 border-t space-y-4">
        <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span>Rs. {total.toFixed(2)}</span>
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader className="animate-spin" /> : 'Create Order'}
        </Button>
      </div>
    </form>
  );
}
