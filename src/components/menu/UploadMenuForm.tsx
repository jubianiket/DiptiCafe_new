'use client';

import { useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { uploadMenuItems } from '@/lib/actions/menu';
import { Loader, Upload } from 'lucide-react';

export function UploadMenuForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      const result = await uploadMenuItems(formData);
      if (result?.error) {
        toast({ title: 'Upload Failed', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Upload Successful', description: 'Menu items have been added.' });
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Excel File (.xlsx)</Label>
        <Input id="file-upload" name="file" type="file" accept=".xlsx" required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader className="animate-spin" /> : <><Upload className="mr-2 h-4 w-4" /> Upload File</>}
      </Button>
    </form>
  );
}
