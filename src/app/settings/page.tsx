import { Header } from '@/components/layout/Header';
import { getRole } from '@/lib/actions/auth';
import { getMenuItems } from '@/lib/actions/menu';
import { getSetting } from '@/lib/actions/settings';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QRUploadSection } from '@/components/settings/QRUploadSection';

export default async function SettingsPage() {
  const role = await getRole();
  if (role !== 'Admin') {
    redirect('/');
  }

  const menuItems = await getMenuItems();
  const qrCodeUrl = await getSetting('qr_code_url') || '';

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
                Upload your payment QR code (UPI, WhatsApp Pay, etc.) to share with customers via WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRUploadSection initialUrl={qrCodeUrl} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
