/**
 * Results Screen — Post-Game Broadcast Analysis
 * ESPN-style final score graphic
 */

'use client';

import { useState, useEffect } from 'react';
import { Answer, Question } from '../lib/types';

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  answers: Answer[];
  questions: Question[];
  onPlayAgain: () => void;
}

export default function ResultsScreen({ score, totalQuestions, answers, questions, onPlayAgain }: ResultsScreenProps) {
  const [copied, setCopied] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const correctAnswers = answers.filter(a => a.correct).length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  
  const getRank = () => {
    if (accuracy >= 90) return { title: 'MALLORY MASTER', color: '#FFB800', emoji: '👑', desc: 'Elite tier knowledge' };
    if (accuracy >= 70) return { title: 'REALEST 9', color: '#00C853', emoji: '🔥', desc: 'Certified Bros fan' };
    if (accuracy >= 50) return { title: 'BRO IN TRAINING', color: '#00B4D8', emoji: '💪', desc: 'Keep watching the pod' };
    return { title: 'NEW LISTENER', color: '#94A3B8', emoji: '🎧', desc: 'Welcome to the community' };
  };

  const rank = getRank();

  // Animate score
  useEffect(() => {
    setShowScore(true);
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);

  const shareText = `I scored ${score}/${totalQuestions * 100} on the Realest 9 Game Show!\nRank: ${rank.title} ${rank.emoji}\n${correctAnswers}/${totalQuestions} correct\n\nTest your Mallory Bros knowledge!`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Realest 9 Game Show', text: shareText }); } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-8 transition-all duration-700 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      
      {/* Final Score Graphic */}
      <div className="relative w-full max-w-lg">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-[#E31837] px-4 py-2.5 rounded-t-xl">
          <span className="font-[var(--font-oswald)] text-white text-sm font-bold uppercase tracking-[0.1em]">Final Score</span>
          <span className="text-white/60 text-[10px] uppercase tracking-wider">Realest 9 Game Show</span>
        </div>
        
        {/* Main score area */}
        <div className="bg-[#0F1D33] border-x border-b border-[#1E3A5F] rounded-b-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            {/* Score */}
            <div className="text-center flex-1">
              <span className="block text-[10px] text-[#94A3B8] uppercase tracking-wider mb-1 font-medium">Score</span>
              <span className="font-[var(--font-oswald)] text-6xl md:text-7xl font-black text-white tabular-nums leading-none" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                {animatedScore}
              </span>
            </div>
            
            {/* Divider */}
            <div className="w-px h-24 bg-[#1E3A5F] mx-4" />
            
            {/* Rank */}
            <div className="text-center flex-1">
              <span className="block text-[10px] text-[#94A3B8] uppercase tracking-wider mb-1 font-medium">Rank</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl">{rank.emoji}</span>
                <span 
                  className="font-[var(--font-oswald)] text-base font-bold uppercase tracking-wide"
                  style={{ color: rank.color }}
                >
                  {rank.title}
                </span>
              </div>
            </div>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1A2B47]/60 rounded-lg p-3 text-center border border-[#1E3A5F]/40">
              <span className="block font-[var(--font-oswald)] text-xl font-bold text-white">{correctAnswers}/{totalQuestions}</span>
              <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider font-medium">Correct</span>
            </div>
            <div className="bg-[#1A2B47]/60 rounded-lg p-3 text-center border border-[#1E3A5F]/40">
              <span className="block font-[var(--font-oswald)] text-xl font-bold text-white">{accuracy}%</span>
              <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider font-medium">Accuracy</span>
            </div>
            <div className="bg-[#1A2B47]/60 rounded-lg p-3 text-center border border-[#1E3A5F]/40">
              <span className="block font-[var(--font-oswald)] text-xl font-bold text-white">{score}/{totalQuestions * 100}</span>
              <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider font-medium">Max</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={onPlayAgain}
          className="flex-1 px-6 py-4 rounded-xl font-[var(--font-oswald)] text-lg font-bold uppercase tracking-wider transition-all duration-200 bg-[#E31837] text-white hover:bg-[#ff1a3c] hover:scale-[1.02] active:scale-[0.98]"
          style={{ boxShadow: '0 4px 16px rgba(227, 24, 55, 0.35)' }}
        >
          Play Again
        </button>
        
        <button
          onClick={handleShare}
          className="flex-1 px-6 py-4 rounded-xl font-[var(--font-oswald)] text-lg font-bold uppercase tracking-wider transition-all duration-200 border-2 border-[#1E3A5F] text-white hover:border-[#00B4D8] hover:text-[#00B4D8] active:scale-[0.98]"
        >
          {copied ? 'Copied!' : 'Share Result'}
        </button>
      </div>
    </div>
  );
}
