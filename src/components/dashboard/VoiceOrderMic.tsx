'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { voiceToOrder, type VoiceOrderOutput } from '@/ai/flows/voice-order-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceOrderMicProps {
  onOrderParsed: (data: VoiceOrderOutput) => void;
  className?: string;
}

export function VoiceOrderMic({ onOrderParsed, className }: VoiceOrderMicProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          processVoiceOrder(base64Audio);
        };
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: 'Microphone Error',
        description: 'Could not access the microphone. Please check your permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceOrder = async (audioDataUri: string) => {
    setIsProcessing(true);
    try {
      const result = await voiceToOrder({ audioDataUri });
      onOrderParsed(result);
      toast({
        title: 'Voice Order Processed',
        description: 'Form populated from your voice recording.',
      });
    } catch (err) {
      console.error('Error processing voice order:', err);
      toast({
        title: 'Processing Error',
        description: 'Could not understand the recording. Please try again or type manually.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        className={cn(
          "rounded-full h-12 w-12 transition-all",
          isRecording && "animate-pulse scale-110 shadow-lg shadow-destructive/50"
        )}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isRecording ? (
          <Square className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5 text-primary" />
        )}
      </Button>
      {isRecording && (
        <span className="text-sm font-medium text-destructive animate-pulse">
          Listening...
        </span>
      )}
      {isProcessing && (
        <span className="text-sm font-medium text-muted-foreground">
          Transcribing...
        </span>
      )}
    </div>
  );
}
