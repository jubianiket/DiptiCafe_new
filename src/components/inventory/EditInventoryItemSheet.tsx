'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { InventoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { updateInventoryItem } from '@/lib/actions/inventory';
import { Loader, Pencil } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.coerce.number().int(),
  unit: z.string().optional(),
  low_stock_threshold: z.coerce.number().int().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;


interface EditInventoryItemSheetProps {
  item: InventoryItem;
}

export function EditInventoryItemSheet({ item }: EditInventoryItemSheetProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
        name: item.name, 
        quantity: item.quantity,
        unit: item.unit || '',
        low_stock_threshold: item.low_stock_threshold
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('quantity', data.quantity.toString());
      if(data.unit) formData.append('unit', data.unit);
      if(data.low_stock_threshold) formData.append('low_stock_threshold', data.low_stock_threshold.toString());

      const result = await updateInventoryItem(item.id, formData);

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
        toast({ title: 'Success', description: 'Inventory item updated.' });
        setOpen(false);
        router.refresh();
      }
    });
  };


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit {item.name}</SheetTitle>
          <SheetDescription>
            Update the details for this inventory item.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
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
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" {...form.register('unit')} />
                    {form.formState.errors.unit && <p className="text-sm font-medium text-destructive">{form.formState.errors.unit.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
                <Input id="low_stock_threshold" type="number" {...form.register('low_stock_threshold')} placeholder="Optional" />
                {form.formState.errors.low_stock_threshold && <p className="text-sm font-medium text-destructive">{form.formState.errors.low_stock_threshold.message}</p>}
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? <Loader className="animate-spin" /> : 'Save Changes'}
            </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
