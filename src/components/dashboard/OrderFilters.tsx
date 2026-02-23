import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OrderStatus } from '@/lib/types';

interface OrderFiltersProps {
  currentFilter?: OrderStatus;
}

const filters: { label: string; value?: OrderStatus }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'Pending' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Paid', value: 'Paid' },
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
