'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus, deleteOrder } from '@/lib/actions/orders';
import type { Order, UserRole, OrderStatus } from '@/lib/types';
import {
  Hourglass,
  CheckCircle,
  CircleDollarSign,
  Trash2,
  Loader,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditOrderSheet } from './EditOrderSheet';

interface OrderCardProps {
  order: Order;
  role: UserRole;
}

const statusInfo: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; color: string; badgeVariant: 'default' | 'secondary' | 'outline' }
> = {
  pending: {
    label: 'Pending',
    icon: Hourglass,
    color: 'text-amber-600',
    badgeVariant: 'outline',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'text-blue-600',
    badgeVariant: 'secondary',
  },
  paid: {
    label: 'Paid',
    icon: CircleDollarSign,
    color: 'text-green-600',
    badgeVariant: 'default',
  },
};

export function OrderCard({ order, role }: OrderCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const CurrentStatusIcon = statusInfo[order.status].icon;
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const date = new Date(order.created_at);
    if (!isNaN(date.getTime())) {
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    }

    const interval = setInterval(() => {
      if (!isNaN(date.getTime())) {
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [order.created_at]);

  const handleUpdateStatus = (status: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: `Order marked as ${status.toLowerCase()}.` });
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteOrder(order.id);
       if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Order deleted successfully.' });
        router.refresh();
      }
    });
  }

  return (
    <Card className="flex flex-col transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{order.customer_name || `Table ${order.table_no}`}</CardTitle>
                <CardDescription>
                {timeAgo}
                </CardDescription>
            </div>
            <Badge variant={statusInfo[order.status].badgeVariant}>
                <CurrentStatusIcon className={`mr-2 h-4 w-4 ${statusInfo[order.status].color}`} />
                {statusInfo[order.status].label}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Separator />
        <ul className="text-sm text-muted-foreground space-y-1">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.quantity}x {item.item_name}
              </span>
              <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex justify-between font-bold text-foreground">
            <span>Total</span>
            <span>Rs. {order.total_amount.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
        {order.status === 'pending' && (
          <Button onClick={() => handleUpdateStatus('delivered')} disabled={isPending} className="w-full" variant="secondary">
            {isPending ? <Loader className="animate-spin" /> : 'Mark Delivered'}
          </Button>
        )}
        {order.status === 'delivered' && (
          <Button onClick={() => handleUpdateStatus('paid')} disabled={isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {isPending ? <Loader className="animate-spin" /> : 'Mark Paid'}
          </Button>
        )}
        
        {order.status !== 'paid' && <EditOrderSheet order={order} />}

        {role === 'Admin' && order.status !== 'paid' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="w-full sm:w-auto" disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sm:hidden ml-2">Delete Order</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the order.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isPending ? <Loader className="animate-spin" /> : 'Delete'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
