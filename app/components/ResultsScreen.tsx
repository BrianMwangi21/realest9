/**
 * Results Screen Component
 * Shows final score, answers review, and share functionality
 */

'use client';

import { useRef, useState } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);

  const correctAnswers = answers.filter(a => a.correct).length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Determine rank
  const getRank = () => {
    if (accuracy >= 90) return { title: 'MALLORY MASTER', color: '#00f0ff', emoji: '👑' };
    if (accuracy >= 70) return { title: 'REALEST 9', color: '#39ff14', emoji: '🔥' };
    if (accuracy >= 50) return { title: 'BRO IN TRAINING', color: '#ffff00', emoji: '💪' };
    return { title: 'NEW LISTENER', color: '#ff00ff', emoji: '🎧' };
  };

  const rank = getRank();
  const maxPossibleScore = totalQuestions * 100; // flat 100 pts per correct
  const scorePercent = Math.min(100, Math.round((score / maxPossibleScore) * 100));

  const shareText = `I scored ${score} points (${correctAnswers}/${totalQuestions} correct) on the Realest 9 Game Show! Rank: ${rank.title} ${rank.emoji}\n\nTest your Mallory Bros knowledge! 🎬🔥`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Realest 9 Game Show',
          text: shareText,
        });
      } catch {
        // User cancelled
      }
    } else {
      // Copy to clipboard
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCard = async () => {
    if (!cardRef.current) return;
    
    try {
      // For now, just copy the text
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Results Card */}
      <div 
        ref={cardRef}
        className="relative w-full max-w-md p-8 rounded-2xl border-2 overflow-hidden"
        style={{
          borderColor: rank.color,
          background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(20,20,20,0.98))',
          boxShadow: `0 0 40px ${rank.color}30, 0 0 80px ${rank.color}10`,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50" />
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20" style={{ background: rank.color }} />
        
        {/* Rank */}
        <div className="text-center mb-6">
          <span className="text-5xl mb-2 block">{rank.emoji}</span>
          <h2 
            className="text-2xl font-black tracking-wider"
            style={{ 
              color: rank.color,
              textShadow: `0 0 20px ${rank.color}80`,
            }}
          >
            {rank.title}
          </h2>
        </div>

        {/* Score */}
        <div className="text-center mb-6">
          <div className="text-5xl font-black text-white mb-1" style={{ textShadow: '0 0 30px rgba(0,240,255,0.3)' }}>
            {score}
          </div>
          <div className="text-sm text-gray-400">POINTS</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <div className="text-xl font-bold text-[#39ff14]">{correctAnswers}/{totalQuestions}</div>
            <div className="text-[10px] text-gray-500 uppercase">Correct</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <div className="text-xl font-bold text-[#ffff00]">{accuracy}%</div>
            <div className="text-[10px] text-gray-500 uppercase">Accuracy</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <div className="text-xl font-bold text-[#00f0ff]">{scorePercent}%</div>
            <div className="text-[10px] text-gray-500 uppercase">Max Score</div>
          </div>
        </div>

        {/* Answer review */}
        <div className="space-y-2 mb-6 max-h-48 overflow-y-auto custom-scrollbar">
          {answers.map((answer, i) => {
            const question = questions[i];
            return (
              <div 
                key={i}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                  answer.correct ? 'bg-[#39ff14]/10' : 'bg-[#ff0040]/10'
                }`}
              >
                <span className={`text-lg ${answer.correct ? 'text-[#39ff14]' : 'text-[#ff0040]'}`}>
                  {answer.correct ? '✓' : '✗'}
                </span>
                <span className="text-gray-300 truncate flex-1">
                  Q{i + 1}: {question?.text.substring(0, 40)}...
                </span>
                <span className="text-gray-500 text-xs">
                  +{answer.pointsEarned}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={onPlayAgain}
          className="flex-1 px-6 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 border-2 border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]"
        >
          Play Again
        </button>
        
        <button
          onClick={handleShare}
          className="flex-1 px-6 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 border-2 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/10 hover:shadow-[0_0_30px_rgba(255,0,255,0.3)]"
        >
          {copied ? 'Copied!' : 'Share Result'}
        </button>
      </div>

      {/* Copy card button */}
      <button
        onClick={handleCopyCard}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4"
      >
        Copy results as image (coming soon)
      </button>
    </div>
  );
}
