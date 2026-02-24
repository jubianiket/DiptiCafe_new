'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PlaySession, TableType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { startPlaySession, endPlaySession } from '@/lib/actions/play';
import { DurationClock } from './DurationClock';
import { formatDistance } from 'date-fns';

const TABLE_CONFIG = {
  pool: { name: 'Pool Table', rate: 120 }, // Rate per hour
  snooker: { name: 'Snooker Table', rate: 150 }, // Rate per hour
};

interface PlayClientPageProps {
  initialActiveSessions: PlaySession[];
}

export function PlayClientPage({ initialActiveSessions: sessions }: PlayClientPageProps) {
  const [isPending, startTransition] = useTransition();
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

  const handleEnd = (session: PlaySession) => {
    startTransition(async () => {
      const result = await endPlaySession(session.id);
      if (result.error || !result.session) {
        toast({ title: 'Error', description: result.error || 'Could not end session.', variant: 'destructive' });
      } else {
        const endedSession = result.session;
        
        // Calculate duration and cost
        const startTime = new Date(endedSession.start_time);
        const endTime = new Date(endedSession.end_time!);
        const durationMs = endTime.getTime() - startTime.getTime();
        
        // Use formatDistance for a user-friendly duration string
        const durationStr = formatDistance(endTime, startTime, { includeSeconds: true });
        
        const rate = TABLE_CONFIG[endedSession.table_type].rate;
        const cost = (durationMs / (1000 * 60 * 60)) * rate;

        toast({
          title: 'Session Ended',
          description: (
            <div>
              <p>Duration: {durationStr}</p>
              <p>Total Charge: Rs. {cost.toFixed(2)}</p>
            </div>
          ),
          duration: 10000,
        });
        router.refresh();
      }
    });
  };

  return (
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
                <Button variant="destructive" className="w-full" onClick={() => handleEnd(activeSession)} disabled={isPending}>
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
  );
}
