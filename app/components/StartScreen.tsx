/**
 * Start Screen Component
 * Welcome screen with game branding and start button
 */

'use client';

import { useState, useEffect } from 'react';

interface StartScreenProps {
  onStart: () => void;
  episodeCount: number;
}

export default function StartScreen({ onStart, episodeCount }: StartScreenProps) {
  const [hovered, setHovered] = useState(false);
  const [glitchText, setGlitchText] = useState('REALEST 9');

  useEffect(() => {
    const interval = setInterval(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      const original = 'REALEST 9';
      let glitched = '';
      for (let i = 0; i < original.length; i++) {
        if (original[i] === ' ') {
          glitched += ' ';
        } else if (Math.random() > 0.85) {
          glitched += chars[Math.floor(Math.random() * chars.length)];
        } else {
          glitched += original[i];
        }
      }
      setGlitchText(glitched);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in duration-700">
      {/* Logo / Title */}
      <div className="relative">
        <h1 
          className="text-6xl md:text-8xl font-black tracking-tighter text-center"
          style={{
            color: '#00f0ff',
            textShadow: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3), 0 0 60px rgba(0, 240, 255, 0.1)',
          }}
        >
          {glitchText}
        </h1>
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50" />
      </div>

      {/* Subtitle */}
      <div className="text-center space-y-2">
        <p className="text-xl md:text-2xl text-[#ff00ff] font-bold tracking-wide">
          GAME SHOW
        </p>
        <p className="text-sm md:text-base text-gray-400 max-w-md">
          Test your knowledge of the Mallory Bros Podcast
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-8 text-center">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#39ff14]">9</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Questions</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#ffff00]">90s</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#00f0ff]">{episodeCount}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Episodes</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative group px-12 py-5 text-xl font-bold uppercase tracking-widest transition-all duration-300"
        style={{
          background: hovered 
            ? 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(255,0,255,0.2))'
            : 'transparent',
          border: '2px solid #00f0ff',
          color: '#00f0ff',
          boxShadow: hovered 
            ? '0 0 30px rgba(0,240,255,0.4), inset 0 0 30px rgba(0,240,255,0.1)'
            : '0 0 15px rgba(0,240,255,0.2)',
        }}
      >
        <span className="relative z-10">Start Game</span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/0 via-[#00f0ff]/10 to-[#00f0ff]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </button>

      {/* Footer */}
      <p className="text-xs text-gray-600 mt-4">
        Made for the Mallory Bros community 💜
      </p>
    </div>
  );
}
