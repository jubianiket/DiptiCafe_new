'use client';

import { useState, useRef, useTransition } from 'react';
import { Camera, Upload, Trash2, Loader, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateSetting } from '@/lib/actions/settings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QRUploadSectionProps {
  initialUrl: string;
}

export function QRUploadSection({ initialUrl }: QRUploadSectionProps) {
  const [qrUrl, setQrUrl] = useState(initialUrl);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage in DB
        toast({
            variant: 'destructive',
            title: 'File too large',
            description: 'Please upload an image smaller than 1MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to capture a QR code.',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Capture at a reasonable resolution for QR codes
      const targetSize = 600;
      const scale = Math.min(targetSize / video.videoWidth, targetSize / video.videoHeight);
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress a bit
        setQrUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSetting('qr_code_url', qrUrl);
      if (result?.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Payment QR code updated successfully.' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>QR Code Image Source</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => document.getElementById('qr-file-upload')?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
            <Button variant="outline" onClick={startCamera}>
              <Camera className="mr-2 h-4 w-4" /> Use Camera
            </Button>
            {qrUrl && (
              <Button variant="destructive" onClick={() => setQrUrl('')}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
          <input 
            type="file" 
            id="qr-file-upload" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
          />
        </div>

        {showCamera && (
          <div className="relative border-2 border-primary rounded-lg overflow-hidden bg-black max-w-md mx-auto w-full aspect-video flex flex-col items-center justify-center shadow-xl">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
             <div className="absolute bottom-4 flex gap-3">
                <Button size="icon" className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 border-4 border-white shadow-lg" onClick={captureImage}>
                    <div className="h-6 w-6 rounded-full bg-white animate-pulse" />
                </Button>
                <Button variant="secondary" className="rounded-full px-6" onClick={stopCamera}>
                    <XCircle className="mr-2 h-4 w-4" /> Close
                </Button>
             </div>
             {hasCameraPermission === false && (
                <Alert variant="destructive" className="absolute inset-x-4 top-4">
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>Please check your browser settings to allow camera access.</AlertDescription>
                </Alert>
             )}
          </div>
        )}

        {qrUrl && !showCamera && (
          <div className="space-y-2 animate-in fade-in zoom-in duration-300">
            <Label>Preview</Label>
            <div className="p-6 border rounded-lg bg-muted/50 flex flex-col items-center shadow-inner">
               <img src={qrUrl} alt="QR Code Preview" className="max-w-[240px] h-auto rounded-lg border-4 border-white shadow-md bg-white" />
               <p className="text-xs text-muted-foreground mt-4 font-medium uppercase tracking-wider">
                {qrUrl.startsWith('data:') ? 'Stored locally as Image data' : 'Linked from URL'}
               </p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="pt-4">
            <Button onClick={handleSave} disabled={isPending || !qrUrl} className="w-full h-12 text-base font-semibold shadow-lg transition-transform active:scale-[0.98]">
            {isPending ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
            Save Payment Settings
            </Button>
        </div>

        {qrUrl && qrUrl.startsWith('data:') && (
            <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-800 text-xs">
                    <strong>Note:</strong> Uploaded images are stored as text. Due to length limits, the QR code image itself won't be sent in WhatsApp messages, but customers will be notified to scan it at the counter.
                </AlertDescription>
            </Alert>
        )}
      </div>
    </div>
  );
}
