/**
 * Timer Component
 * Animated countdown timer with neon styling
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
    if (isLow && status === 'playing') {
      setPulse(true);
      const timeout = setTimeout(() => setPulse(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining, isLow, status]);

  const getColor = () => {
    if (isCritical) return '#ff0040';
    if (isLow) return '#ffff00';
    return '#00f0ff';
  };

  const color = getColor();

  return (
    <div className="w-full max-w-md">
      {/* Time display */}
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs text-gray-500 font-mono uppercase">Total Time Left</span>
        <span 
          className={`text-3xl font-black font-mono transition-all duration-300 ${pulse ? 'scale-110' : ''}`}
          style={{ 
            color,
            textShadow: `0 0 20px ${color}80`,
          }}
        >
          {timeRemaining}s
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}40, ${color})`,
            boxShadow: `0 0 10px ${color}60`,
          }}
        />
        {/* Glow effect */}
        <div 
          className="absolute inset-y-0 rounded-full"
          style={{ 
            left: `${percentage}%`,
            width: '2px',
            background: color,
            boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
