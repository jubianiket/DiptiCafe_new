'use client';

import type { InventoryItem } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryList } from './InventoryList';
import { NewInventoryItemForm } from './NewInventoryItemForm';

interface InventoryClientPageProps {
    initialItems: InventoryItem[];
}

export function InventoryClientPage({ initialItems }: InventoryClientPageProps) {
  // We pass initialItems to the list, but forms will trigger revalidation (router.refresh)
  // so the page will get new data.

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="new">Add New Item</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all">
        <Card>
            <CardHeader>
                <CardTitle>Current Inventory</CardTitle>
                <CardDescription>
                    View and manage your stock levels.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <InventoryList items={initialItems} />
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="new">
         <Card>
            <CardHeader>
                <CardTitle>Add New Inventory Item</CardTitle>
                <CardDescription>
                    Add a new raw material or product to your inventory.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <NewInventoryItemForm />
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
