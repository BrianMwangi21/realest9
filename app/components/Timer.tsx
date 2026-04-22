/**
 * Timer — Shot Clock Style
 * ESPN broadcast countdown
 */

'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  status: string;
}

export default function Timer({ timeRemaining, totalTime, status }: TimerProps) {
  const [pulse, setPulse] = useState(false);
  const percentage = (timeRemaining / totalTime) * 100;
  const isLow = timeRemaining <= 15;
  const isCritical = timeRemaining <= 5;

  useEffect(() => {
    if (isLow && (status === 'playing' || status === 'answered')) {
      setPulse(true);
      const timeout = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining, isLow, status]);

  const getColor = () => {
    if (isCritical) return '#FF1744';
    if (isLow) return '#FFB800';
    return '#00B4D8';
  };

  const color = getColor();

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <span className="hidden sm:block text-[10px] text-[#64748B] font-[var(--font-oswald)] uppercase tracking-wider">
        Clock
      </span>

      {/* Shot clock circle */}
      <div className="relative">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - percentage / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>

        {/* Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className={`font-[var(--font-oswald)] text-xl font-bold tabular-nums ${pulse ? 'scale-110' : ''} transition-transform`}
            style={{ color }}
          >
            {timeRemaining}
          </span>
        </div>
      </div>
    </div>
  );
}
