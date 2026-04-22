/**
 * Start Screen — Broadcast Intro
 * ESPN-style opening graphic
 */

'use client';

import { useState, useEffect } from 'react';

interface StartScreenProps {
  onStart: () => void;
  episodeCount: number;
}

export default function StartScreen({ onStart, episodeCount }: StartScreenProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[70vh] gap-10 transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      
      {/* Top bar — Live / On Air feel */}
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
        </span>
        <span className="text-red-500 font-[var(--font-oswald)] font-bold text-sm tracking-[0.2em] uppercase">
          Live Game Show
        </span>
      </div>

      {/* Main Title — Big broadcast graphic */}
      <div className="relative">
        <h1 
          className="font-[var(--font-oswald)] text-7xl md:text-9xl font-black tracking-tight text-center uppercase"
          style={{ 
            color: '#ffffff',
            textShadow: '0 2px 0 #1a2b47, 0 4px 8px rgba(0,0,0,0.5)',
          }}
        >
          REALEST
        </h1>
        <h1 
          className="font-[var(--font-oswald)] text-7xl md:text-9xl font-black tracking-tight text-center uppercase -mt-2 md:-mt-4"
          style={{ 
            color: '#E31837',
            textShadow: '0 2px 0 #8B0F21, 0 4px 12px rgba(227,24,55,0.4)',
          }}
        >
          NINE
        </h1>
      </div>

      {/* Broadcast info strip */}
      <div className="flex items-center gap-6 bg-[#0F1D33] border border-[#1E3A5F] rounded-lg px-6 py-3">
        <div className="text-center">
          <span className="block text-2xl font-[var(--font-oswald)] font-bold text-white">9</span>
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">Questions</span>
        </div>
        <div className="w-px h-8 bg-[#1E3A5F]" />
        <div className="text-center">
          <span className="block text-2xl font-[var(--font-oswald)] font-bold text-white">90s</span>
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">Total</span>
        </div>
        <div className="w-px h-8 bg-[#1E3A5F]" />
        <div className="text-center">
          <span className="block text-2xl font-[var(--font-oswald)] font-bold text-white">{episodeCount}</span>
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">Episodes</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="group relative px-14 py-5 font-[var(--font-oswald)] text-xl font-bold uppercase tracking-[0.15em] text-white bg-[#E31837] rounded overflow-hidden transition-all duration-200 hover:bg-[#ff1a3c] hover:scale-[1.02] active:scale-[0.98]"
        style={{ boxShadow: '0 4px 20px rgba(227, 24, 55, 0.4)' }}
      >
        <span className="relative z-10">Start Game</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>

      {/* Footer */}
      <p className="text-xs text-[#64748B] font-medium">
        Made for the Mallory Bros community
      </p>
    </div>
  );
}
