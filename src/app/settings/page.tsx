import { Header } from '@/components/layout/Header';
import { getRole } from '@/lib/actions/auth';
import { getMenuItems } from '@/lib/actions/menu';
import { getSetting, updateSetting } from '@/lib/actions/settings';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { revalidatePath } from 'next/cache';

export default async function SettingsPage() {
  const role = await getRole();
  if (role !== 'Admin') {
    redirect('/');
  }

  const menuItems = await getMenuItems();
  const qrCodeUrl = await getSetting('qr_code_url') || '';

  async function handleSaveQR(formData: FormData) {
    'use server';
    const url = formData.get('qr_code_url') as string;
    await updateSetting('qr_code_url', url);
    revalidatePath('/settings');
  }

  return (
    <>
      <Header role={role} menuItems={menuItems} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Global Settings</h1>
        </div>
        
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
              <CardDescription>
                Set up the QR code image URL that will be shared with customers via WhatsApp for payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSaveQR} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr_code_url">QR Code Image URL</Label>
                  <Input 
                    id="qr_code_url" 
                    name="qr_code_url" 
                    placeholder="https://example.com/your-qr-code.png" 
                    defaultValue={qrCodeUrl}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Upload your QR code to an image hosting service and paste the direct image link here.
                  </p>
                </div>
                {qrCodeUrl && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/50 flex flex-col items-center">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <img src={qrCodeUrl} alt="Payment QR Code Preview" className="max-w-[200px] h-auto rounded border shadow-sm" />
                  </div>
                )}
                <Button type="submit">Save Settings</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
