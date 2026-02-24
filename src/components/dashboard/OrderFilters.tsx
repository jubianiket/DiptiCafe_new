'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const handleFilterChange = (value: string) => {
    if (value === 'All') {
      router.push('/');
    } else {
      router.push(`/?status=${value}`);
    }
  };

  return (
    <Tabs
      value={currentFilter || 'All'}
      onValueChange={handleFilterChange}
      className="mb-4"
    >
      <TabsList>
        {filters.map((filter) => (
          <TabsTrigger value={filter.value || 'All'} key={filter.label}>
            {filter.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
