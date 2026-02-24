'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlaySession, TableType, Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { startPlaySession } from '@/lib/actions/play';
import { DurationClock } from './DurationClock';
import { EndSessionDialog } from './EndSessionDialog';

const TABLE_CONFIG = {
  pool: { name: 'Pool Table', rate: 120 }, // Rate per hour
  snooker: { name: 'Snooker Table', rate: 150 }, // Rate per hour
};

interface PlayClientPageProps {
  initialActiveSessions: PlaySession[];
  activeOrders: Order[];
}

export function PlayClientPage({ initialActiveSessions: sessions, activeOrders }: PlayClientPageProps) {
  const [isPending, startTransition] = useTransition();
  const [endingSession, setEndingSession] = useState<PlaySession | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const getActiveSession = (tableType: TableType) => {
    return sessions.find(s => s.table_type === tableType && s.status === 'active');
  };

  const handleStart = (tableType: TableType) => {
    startTransition(async () => {
      const result = await startPlaySession(tableType);
      if (result.error || !result.session) {
        toast({ title: 'Error', description: result.error || 'Could not start session.', variant: 'destructive' });
      } else {
        toast({ title: 'Session Started', description: `${TABLE_CONFIG[tableType].name} session has begun.` });
        router.refresh();
      }
    });
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {(['pool', 'snooker'] as TableType[]).map(tableType => {
          const activeSession = getActiveSession(tableType);
          const config = TABLE_CONFIG[tableType];

          return (
            <Card key={tableType}>
              <CardHeader>
                <CardTitle>{config.name}</CardTitle>
                <CardDescription>Rate: Rs. {config.rate} per hour</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeSession ? (
                  <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Session in progress</p>
                    <DurationClock startTime={activeSession.start_time} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Table is available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {activeSession ? (
                  <Button variant="destructive" className="w-full" onClick={() => setEndingSession(activeSession)} disabled={isPending}>
                    {isPending ? <Loader className="animate-spin" /> : <><Square className="mr-2" /> End Session</>}
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleStart(tableType)} disabled={isPending || !!getActiveSession(tableType)}>
                    {isPending ? <Loader className="animate-spin" /> : <><Play className="mr-2" /> Start Session</>}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {endingSession && (
        <EndSessionDialog
          session={endingSession}
          activeOrders={activeOrders}
          onClose={() => setEndingSession(null)}
        />
      )}
    </>
  );
}
