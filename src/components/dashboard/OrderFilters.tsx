import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OrderStatus } from '@/lib/types';

interface OrderFiltersProps {
  currentFilter?: OrderStatus;
}

const filters: { label: string; value?: OrderStatus }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Paid', value: 'paid' },
];

export function OrderFilters({ currentFilter }: OrderFiltersProps) {
  return (
    <Tabs value={currentFilter || 'All'} className="mb-4">
      <TabsList>
        {filters.map((filter) => (
          <TabsTrigger value={filter.value || 'All'} key={filter.label} asChild>
            <Link href={filter.value ? `/?status=${filter.value}` : '/'}>
              {filter.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
