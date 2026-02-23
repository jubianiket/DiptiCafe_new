import { Header } from '@/components/layout/Header';
import { getRole } from '@/lib/actions/auth';
import type { UserRole } from '@/lib/types';
import { getMenuItems } from '@/lib/actions/menu';
import { MenuList } from '@/components/menu/MenuList';
import { NewMenuItemForm } from '@/components/menu/NewMenuItemForm';
import { UploadMenuForm } from '@/components/menu/UploadMenuForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default async function MenuPage() {
  const role = await getRole();
  const menuItems = await getMenuItems();

  return (
    <>
      <Header role={role} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Menu Management</h1>
        </div>
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="new">Add New</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all">
            <Card>
                <CardHeader>
                    <CardTitle>Menu</CardTitle>
                    <CardDescription>
                        Manage your restaurant's menu items.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MenuList items={menuItems} />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="new">
             <Card>
                <CardHeader>
                    <CardTitle>Add New Menu Item</CardTitle>
                    <CardDescription>
                        Add a single item to your menu.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <NewMenuItemForm />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upload">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Menu</CardTitle>
                    <CardDescription>
                        Bulk upload menu items from an Excel (.xlsx) file. The file should have two columns: 'name' and 'price'.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UploadMenuForm />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
