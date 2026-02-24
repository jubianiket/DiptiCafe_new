'use client';

import { useState } from 'react';
import type { Order, MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { EditOrderForm } from './EditOrderForm';
import { Pencil } from 'lucide-react';

interface EditOrderSheetProps {
  order: Order;
  menuItems: MenuItem[];
}

export function EditOrderSheet({ order, menuItems }: EditOrderSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="w-full sm:w-auto">
          <Pencil className="h-4 w-4" />
          <span className="sm:hidden ml-2">Edit Order</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full">
        <SheetHeader>
          <SheetTitle>Edit Order for {order.customer_name || `Table ${order.table_no}`}</SheetTitle>
          <SheetDescription>
            Add new items to this existing order.
          </SheetDescription>
        </SheetHeader>
        <EditOrderForm order={order} onFormSubmit={() => setOpen(false)} menuItems={menuItems} />
      </SheetContent>
    </Sheet>
  );
}
