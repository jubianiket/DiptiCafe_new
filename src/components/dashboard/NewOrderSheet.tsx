'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NewOrderForm } from './NewOrderForm';
import { Plus } from 'lucide-react';

export function NewOrderSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="-ml-1 h-4 w-4" />
          New Order
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full">
        <SheetHeader>
          <SheetTitle>Create New Order</SheetTitle>
          <SheetDescription>
            Add customer details and items to create a new order.
          </SheetDescription>
        </SheetHeader>
        <NewOrderForm onFormSubmit={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
