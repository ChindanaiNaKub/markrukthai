import { useEffect, useState } from 'react';
import type { PieceColor } from '@shared/types';

interface ClockProps {
  time: number;
  isActive: boolean;
  color: PieceColor;
  playerName: string;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function Clock({ time, isActive, color, playerName }: ClockProps) {
  const [displayTime, setDisplayTime] = useState(time);

  useEffect(() => {
    setDisplayTime(time);
  }, [time]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setDisplayTime(prev => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(interval);
  }, [isActive]);

  const isLow = displayTime < 30000;
  const isCritical = displayTime < 10000;

  return (
    <div className={`
      flex items-center justify-between rounded-xl px-4 sm:px-5 py-2.5 w-full
      transition-all duration-200
      ${isActive
        ? isCritical
          ? 'bg-danger/15 border border-danger/30 shadow-sm shadow-danger/10'
          : 'bg-primary/10 border border-primary/25 shadow-sm shadow-primary/10'
        : 'bg-surface-alt border border-surface-hover/60'
      }
    `}>
      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full ring-2 ${
          color === 'white'
            ? 'bg-white/90 ring-white/30'
            : 'bg-surface ring-text-dim/30'
        }`} />
        <span className="text-text-bright text-sm font-medium">{playerName}</span>
      </div>
      <div className={`
        font-mono text-xl sm:text-2xl font-bold tabular-nums tracking-tight
        ${isCritical ? 'text-danger' : isLow ? 'text-accent' : 'text-text-bright'}
        ${isActive && isCritical ? 'animate-pulse' : ''}
      `}>
        {formatTime(displayTime)}
      </div>
    </div>
  );
}
