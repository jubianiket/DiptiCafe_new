'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addInventoryItem } from '@/lib/actions/inventory';
import { Loader } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.coerce.number().int(),
  unit: z.string().optional(),
  low_stock_threshold: z.coerce.number().int().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewInventoryItemForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', quantity: 0, unit: '', low_stock_threshold: null },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('quantity', data.quantity.toString());
      if(data.unit) formData.append('unit', data.unit);
      if(data.low_stock_threshold) formData.append('low_stock_threshold', data.low_stock_threshold.toString());

      const result = await addInventoryItem(formData);

      if (result?.error) {
        if(typeof result.error !== 'string') {
          for (const [field, messages] of Object.entries(result.error)) {
             if (messages) {
                if (field === 'form') {
                    toast({ title: 'Error', description: (messages as string[]).join(', '), variant: 'destructive' });
                } else {
                    form.setError(field as keyof FormValues, { type: 'manual', message: (messages as string[]).join(', ') });
                }
            }
          }
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
      } else {
        toast({ title: 'Success', description: 'New inventory item added.' });
        form.reset();
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input id="name" {...form.register('name')} />
        {form.formState.errors.name && <p className="text-sm font-medium text-destructive">{form.formState.errors.name.message}</p>}
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" {...form.register('quantity')} />
            {form.formState.errors.quantity && <p className="text-sm font-medium text-destructive">{form.formState.errors.quantity.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="unit">Unit (e.g., kg, L, pcs)</Label>
            <Input id="unit" {...form.register('unit')} />
            {form.formState.errors.unit && <p className="text-sm font-medium text-destructive">{form.formState.errors.unit.message}</p>}
        </div>
       </div>
       <div className="space-y-2">
        <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
        <Input id="low_stock_threshold" type="number" {...form.register('low_stock_threshold')} placeholder="Optional"/>
        {form.formState.errors.low_stock_threshold && <p className="text-sm font-medium text-destructive">{form.formState.errors.low_stock_threshold.message}</p>}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader className="animate-spin" /> : 'Add Item'}
      </Button>
    </form>
  );
}
