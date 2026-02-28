
'use client';

import { useTransition, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { toJpeg } from 'html-to-image';
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
import { getSetting } from '@/lib/actions/settings';
import type { Order, UserRole, OrderStatus, MenuItem } from '@/lib/types';
import {
  Hourglass,
  CheckCircle,
  CircleDollarSign,
  Trash2,
  Loader,
  Share2,
  Coffee,
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
  menuItems: MenuItem[];
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

export function OrderCard({ order, role, menuItems }: OrderCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isSharing, setIsSharing] = useState(false);
  const billRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const CurrentStatusIcon = statusInfo[order.status].icon;
  const [timeAgo, setTimeAgo] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const date = new Date(order.created_at);
    if (isNaN(date.getTime())) return;

    setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));

    const interval = setInterval(() => {
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    }, 60000);

    return () => clearInterval(interval);
  }, [order.created_at]);

  // Pre-fetch QR code for sharing
  useEffect(() => {
    async function loadQR() {
      const url = await getSetting('qr_code_url');
      setQrCodeUrl(url);
    }
    loadQR();
  }, []);

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

  const handleShareOnWhatsApp = async () => {
    setIsSharing(true);
    try {
      if (!billRef.current) throw new Error("Bill template not found");

      // Generate Image from hidden receipt element
      const dataUrl = await toJpeg(billRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      // Prepare Share Data
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `bill-${order.customer_name || order.table_no}.jpg`, { type: 'image/jpeg' });

      let textMessage = `*Dipti's Cafe Bill*\n`;
      textMessage += `Order for: ${order.customer_name || `Table ${order.table_no}`}\n`;
      textMessage += `Total: Rs. ${order.total_amount.toFixed(2)}`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Dipti's Cafe Bill",
          text: textMessage,
        });
      } else {
        // Fallback for desktop: Traditional text message
        const phone = order.phone_number?.replace(/\D/g, '') || '';
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(textMessage + "\n(Please check attached receipt)")}`;
        window.open(whatsappUrl, '_blank');
        
        // Also provide a manual download option if they want the image
        const link = document.createElement('a');
        link.download = `bill-${order.id}.jpg`;
        link.href = dataUrl;
        link.click();
        
        toast({
          title: "Browser Limited",
          description: "Text bill sent. Receipt image downloaded to your device.",
        });
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      toast({
        variant: 'destructive',
        title: "Share Failed",
        description: "Could not generate bill image. Please try again.",
      });
    } finally {
      setIsSharing(false);
    }
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
    <>
      {/* Hidden Bill Receipt Template for Image Generation */}
      <div className="fixed -left-[9999px] top-0">
        <div 
          ref={billRef} 
          className="w-[400px] bg-white p-8 text-black flex flex-col items-center"
          style={{ fontFamily: 'monospace' }}
        >
          <Coffee className="h-12 w-12 text-primary mb-2" />
          <h1 className="text-2xl font-bold uppercase tracking-widest">Dipti's Cafe</h1>
          <p className="text-sm opacity-70 mb-4">Quality & Freshness Since Always</p>
          
          <div className="w-full border-t border-dashed border-black/30 my-4" />
          
          <div className="w-full space-y-1 text-sm">
            <div className="flex justify-between">
              <span>ORDER ID:</span>
              <span className="font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE:</span>
              <span>{format(new Date(order.created_at), 'dd MMM yyyy HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span>CUSTOMER:</span>
              <span className="font-bold">{order.customer_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>TABLE:</span>
              <span className="font-bold">{order.table_no || 'N/A'}</span>
            </div>
          </div>

          <div className="w-full border-t border-dashed border-black/30 my-4" />
          
          <div className="w-full space-y-3">
            <div className="flex justify-between font-bold text-xs uppercase opacity-60">
              <span>Item Description</span>
              <span>Amt</span>
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex flex-col">
                   <span className="font-bold text-sm uppercase">{item.item_name}</span>
                   <span className="text-xs opacity-70">{item.quantity} x Rs. {item.price.toFixed(2)}</span>
                </div>
                <span className="font-bold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="w-full border-t border-dashed border-black/30 my-4" />
          
          <div className="w-full flex justify-between items-center py-2">
            <span className="text-lg font-bold uppercase">Grand Total</span>
            <span className="text-2xl font-bold">Rs. {order.total_amount.toFixed(2)}</span>
          </div>

          <div className="w-full border-t border-dashed border-black/30 my-4" />

          {qrCodeUrl && (
            <div className="flex flex-col items-center mt-4">
              <p className="text-xs font-bold mb-3 uppercase tracking-wider">Scan to Pay via UPI/WhatsApp</p>
              <div className="p-2 border-2 border-black rounded-lg bg-white">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR" 
                  className="w-32 h-32"
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-[10px] mt-4 text-center opacity-60">
                Thank you for your visit! <br />
                We hope to see you again soon.
              </p>
            </div>
          )}
          
          {!qrCodeUrl && (
            <p className="text-xs mt-4 text-center opacity-60 italic">
               * Please pay at the counter * <br />
               Thank you for your visit!
            </p>
          )}
        </div>
      </div>

      {/* Visible Order Card */}
      <Card className="flex flex-col transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle>{order.customer_name || `Table ${order.table_no}`}</CardTitle>
                  <CardDescription>
                    {order.phone_number && <span className="font-medium">{order.phone_number} &middot; </span>}
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
            <div className="flex w-full gap-2">
              <Button onClick={() => handleUpdateStatus('paid')} disabled={isPending} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                  {isPending ? <Loader className="animate-spin" /> : 'Mark Paid'}
              </Button>
              <Button variant="outline" size="icon" onClick={handleShareOnWhatsApp} disabled={isSharing} title="Share Receipt Image">
                  {isSharing ? <Loader className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
          
          {order.status !== 'paid' && <EditOrderSheet order={order} menuItems={menuItems} />}

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
    </>
  );
}
