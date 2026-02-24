'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

interface OrderFiltersProps {
  currentFilter?: OrderStatus;
}

const filters: { label: string; value: OrderStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'pending' },
  { label: 'Delivered', value: 'delivered' },
];

export function OrderFilters({ currentFilter }: OrderFiltersProps) {
  const pathname = usePathname();

  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-4">
      {filters.map((filter) => {
        const href = filter.value === 'All' ? pathname : `${pathname}?status=${filter.value}`;
        // If currentFilter is undefined, it should match 'All'.
        const isActive = (currentFilter || 'All') === filter.value;

        return (
          <Link
            key={filter.label}
            href={href}
            // These classes mimic the shadcn TabsTrigger component
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
