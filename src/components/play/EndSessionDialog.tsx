'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { endPlaySession } from '@/lib/actions/play';
import { createOrder, updateOrder } from '@/lib/actions/orders';
import { Loader } from 'lucide-react';
import type { PlaySession, Order } from '@/lib/types';
import { Combobox } from '@/components/ui/combobox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const TABLE_CONFIG = {
  pool: { name: 'Pool Table', rate: 120 },
  snooker: { name: 'Snooker Table', rate: 150 },
};

interface EndSessionDialogProps {
  session: PlaySession;
  activeOrders: Order[];
  onClose: () => void;
}

export function EndSessionDialog({ session, activeOrders, onClose }: EndSessionDialogProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const customerOptions = useMemo(() => 
    activeOrders.map(order => ({
        value: order.id,
        label: order.customer_name || `Table ${order.table_no}`
    })), [activeOrders]);

  const handleConfirm = () => {
    startTransition(async () => {
      // 1. End the session to get cost and duration
      const endResult = await endPlaySession(session.id);
      if (endResult.error || !endResult.session) {
        toast({ title: 'Error', description: endResult.error || 'Could not end session.', variant: 'destructive' });
        return;
      }
      
      const { cost, durationStr } = endResult;
      const itemName = `${session.table_type === 'pool' ? 'Pool' : 'Snooker'} Table Play (${durationStr})`;
      const playItem = { item_name: itemName, quantity: 1, price: cost! };

      let orderResult;
      if (mode === 'existing') {
          if (!selectedOrderId) {
              toast({ title: 'Error', description: 'Please select an existing order.', variant: 'destructive' });
              return;
          }
          const existingOrder = activeOrders.find(o => o.id === selectedOrderId);
          if (!existingOrder) {
              toast({ title: 'Error', description: 'Selected order not found.', variant: 'destructive' });
              return;
          }
          
          const formData = new FormData();
          formData.append('items', JSON.stringify([playItem]));
          // Pass customer name and table number to satisfy validation, though they won't be updated.
          if(existingOrder.customer_name) formData.append('customer_name', existingOrder.customer_name);
          if(existingOrder.table_no) formData.append('table_no', existingOrder.table_no);

          orderResult = await updateOrder(selectedOrderId, formData);

      } else { // mode === 'new'
          if (!newCustomerName.trim()) {
              toast({ title: 'Error', description: 'Please enter a customer name.', variant: 'destructive' });
              return;
          }
          const formData = new FormData();
          formData.append('customer_name', newCustomerName);
          formData.append('items', JSON.stringify([playItem]));
          orderResult = await createOrder(formData);
      }

      // 3. Handle order action result
      if (orderResult?.error) {
        const errorMessages = typeof orderResult.error === 'string' 
            ? orderResult.error 
            : Object.values(orderResult.error).flat().join(', ');
        toast({ title: 'Order Update Failed', description: errorMessages || 'Failed to add play session to order.', variant: 'destructive' });
      } else {
        toast({
          title: 'Session Ended & Billed',
          description: `Charge of Rs. ${cost?.toFixed(2)} added to order.`,
          duration: 10000,
        });
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End Session & Bill Customer</AlertDialogTitle>
          <AlertDialogDescription>
            Add the play charges to an existing customer's bill or create a new one.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
            <RadioGroup defaultValue="existing" onValueChange={(value: 'existing' | 'new') => setMode(value)}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="r-existing" disabled={customerOptions.length === 0} />
                    <Label htmlFor="r-existing" className={customerOptions.length === 0 ? 'text-muted-foreground' : ''}>
                        Add to Existing Order {customerOptions.length === 0 && '(None available)'}
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="r-new" />
                    <Label htmlFor="r-new">Create New Order</Label>
                </div>
            </RadioGroup>

            {mode === 'existing' ? (
                 <div className="pl-6 pt-2">
                    <Label>Select an active order</Label>
                    <Combobox 
                        options={customerOptions}
                        value={selectedOrderId}
                        onChange={setSelectedOrderId}
                        placeholder="Select customer/table..."
                        searchPlaceholder="Search orders..."
                        emptyPlaceholder="No active orders found."
                    />
                 </div>
            ) : (
                <div className="pl-6 pt-2">
                    <Label htmlFor="new-customer-name">New Customer Name</Label>
                    <Input 
                        id="new-customer-name"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        placeholder="Enter customer name..."
                    />
                </div>
            )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending || (mode === 'existing' && !selectedOrderId) || (mode === 'new' && !newCustomerName.trim())}>
            {isPending ? <Loader className="animate-spin" /> : 'Confirm & Bill'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
