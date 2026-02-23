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
import { createMenuItem } from '@/lib/actions/menu';
import { Loader } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

export function NewMenuItemForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', price: 0 },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('price', data.price.toString());

      const result = await createMenuItem(formData);

      if (result?.error) {
        toast({ title: 'Error', description: result.error.form || 'An error occurred.', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'New menu item created.' });
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
       <div className="space-y-2">
        <Label htmlFor="price">Price (Rs.)</Label>
        <Input id="price" type="number" step="0.01" {...form.register('price')} />
        {form.formState.errors.price && <p className="text-sm font-medium text-destructive">{form.formState.errors.price.message}</p>}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader className="animate-spin" /> : 'Add Item'}
      </Button>
    </form>
  );
}
