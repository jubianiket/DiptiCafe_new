import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign, ClipboardList } from 'lucide-react';
import type { DailySummary } from '@/lib/types';

interface SalesSummaryProps {
  summary: DailySummary;
}

export function SalesSummary({ summary }: SalesSummaryProps) {
  const { total_orders, total_revenue } = summary;

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(total_revenue);

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Today's Summary</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedRevenue.replace('₹', 'Rs. ')}</div>
            <p className="text-xs text-muted-foreground">From paid orders today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{total_orders}</div>
            <p className="text-xs text-muted-foreground">Total orders marked as paid today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
