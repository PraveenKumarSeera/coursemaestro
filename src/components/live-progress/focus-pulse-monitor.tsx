
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { HeartPulse } from 'lucide-react';

export default function FocusPulseMonitor({ pulse }: { pulse: number }) {
  const pulseRate = 2 - (pulse / 100) * 1.5; // Faster animation for higher pulse
  const glowOpacity = 0.2 + (pulse / 100) * 0.8;

  const getPulseColor = () => {
    if (pulse > 75) return 'hsl(var(--primary))';
    if (pulse > 40) return 'hsl(var(--chart-2))';
    return 'hsl(var(--muted-foreground))';
  };
  
  const pulseColor = getPulseColor();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HeartPulse className="h-5 w-5 text-primary" />
          <span>Class Focus Pulse</span>
        </CardTitle>
        <CardDescription>
          A real-time measure of overall class engagement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-12 w-full bg-muted/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-0 transition-all duration-1000 ease-out"
            style={{
              width: `${pulse}%`,
              backgroundColor: pulseColor,
              boxShadow: `0 0 20px ${pulseColor}`,
              animation: `pulse-animation ${pulseRate}s infinite ease-in-out`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white drop-shadow-md">
              {Math.round(pulse)}%
            </span>
          </div>
        </div>
      </CardContent>
      <style jsx>{`
        @keyframes pulse-animation {
          0% {
            transform: scaleX(1);
            opacity: 0.8;
          }
          50% {
            transform: scaleX(1.02);
            opacity: 1;
          }
          100% {
            transform: scaleX(1);
            opacity: 0.8;
          }
        }
      `}</style>
    </Card>
  );
}
