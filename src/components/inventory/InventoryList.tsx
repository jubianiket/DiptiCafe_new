'use client';

import type { InventoryItem } from '@/lib/types';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Loader, AlertCircle } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { deleteInventoryItem } from '@/lib/actions/inventory';
import { EditInventoryItemSheet } from './EditInventoryItemSheet';

export function InventoryList({ items }: { items: InventoryItem[] }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    if (items.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No inventory items found. Add one to get started.</p>
    }

    const handleDelete = (id: string, name: string) => {
        startTransition(async () => {
            const result = await deleteInventoryItem(id);
            if (result.error) {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            } else {
                toast({ title: 'Success', description: `Deleted "${name}" from inventory.` });
                router.refresh();
            }
        });
    }

    return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
            const isLowStock = item.low_stock_threshold !== null && item.quantity <= item.low_stock_threshold;
            return (
              <TableRow key={item.id} className={isLowStock ? 'bg-destructive/10' : ''}>
                <TableCell className="font-medium flex items-center gap-2">
                    {item.name}
                    {isLowStock && <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Low Stock</Badge>}
                </TableCell>
                <TableCell className="text-right">{item.quantity} {item.unit || ''}</TableCell>
                <TableCell>{new Date(item.updated_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <EditInventoryItemSheet item={item} />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" disabled={isPending}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the inventory item.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id, item.name)} className="bg-destructive hover:bg-destructive/90">
                                    {isPending ? <Loader className="animate-spin" /> : 'Delete'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </TableCell>
              </TableRow>
            )
        })}
      </TableBody>
    </Table>
  );
}
