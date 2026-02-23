'use client';

import { useState, useEffect } from 'react';

function pad(num: number) {
  return num.toString().padStart(2, '0');
}

export function DurationClock({ startTime }: { startTime: string }) {
  const [duration, setDuration] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const intervalId = setInterval(() => {
      const now = Date.now();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setDuration({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  return (
    <div className="text-3xl font-bold font-mono tracking-widest text-foreground">
      <span>{pad(duration.hours)}</span>:
      <span>{pad(duration.minutes)}</span>:
      <span>{pad(duration.seconds)}</span>
    </div>
  );
}
