/**
 * Question Card — Lower Third + Stat Cards
 * ESPN broadcast style
 */

'use client';

import { useState, useEffect } from 'react';
import { Question, Answer } from '../lib/types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (optionId: string) => void;
  status: string;
  lastAnswer?: Answer;
}

export default function QuestionCard({ question, onAnswer, status, lastAnswer }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
    setAnimateIn(false);
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, [question.id]);

  useEffect(() => {
    if (status === 'answered' && lastAnswer) {
      setSelectedOption(lastAnswer.selectedOptionId);
      setShowResult(true);
    }
  }, [status, lastAnswer]);

  const handleSelect = (optionId: string) => {
    if (status !== 'playing') return;
    setSelectedOption(optionId);
    onAnswer(optionId);
  };

  const getOptionStyle = (optionId: string) => {
    if (!showResult) {
      return selectedOption === optionId
        ? 'border-[#00B4D8] bg-[#00B4D8]/10 shadow-[0_0_20px_rgba(0,180,216,0.15)]'
        : 'border-[#1E3A5F] bg-[#0F1D33]/80 hover:border-[#00B4D8]/40 hover:bg-[#1A2B47]/60';
    }

    const isCorrect = optionId === question.correctOptionId;
    const isSelected = optionId === selectedOption;

    if (isCorrect) {
      return 'border-[#00C853] bg-[#00C853]/10 shadow-[0_0_20px_rgba(0,200,83,0.15)]';
    }
    if (isSelected && !isCorrect) {
      return 'border-[#FF1744] bg-[#FF1744]/10';
    }
    return 'border-[#1E3A5F]/40 bg-[#0F1D33]/30 opacity-40';
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      episodeTitle: { label: 'EPISODE ID', color: '#00B4D8' },
      viewCountBattle: { label: 'VIEW BATTLE', color: '#FFB800' },
      chronology: { label: 'TIMELINE', color: '#00C853' },
      episodeNumberGuess: { label: 'EPISODE #', color: '#E31837' },
      contentRecall: { label: 'CONTENT', color: '#9C27B0' },
      viewEstimate: { label: 'VIEW EST.', color: '#FF6D00' },
    };
    return badges[type] || { label: type, color: '#64748B' };
  };

  const badge = getTypeBadge(question.type);

  return (
    <div className={`w-full max-w-3xl transition-all duration-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      
      {/* Question Type Badge */}
      <div className="flex justify-center mb-3">
        <div 
          className="flex items-center gap-2 px-3 py-1 rounded-md"
          style={{ backgroundColor: `${badge.color}12`, border: `1px solid ${badge.color}35` }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: badge.color }} />
          <span className="text-[10px] font-[var(--font-oswald)] font-bold uppercase tracking-[0.15em]" style={{ color: badge.color }}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Question — Lower Third Style */}
      <div className="relative mb-5">
        <div 
          className="relative px-6 py-5 md:px-8 md:py-6 rounded-xl overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, rgba(227, 24, 55, 0.92) 0%, rgba(180, 15, 40, 0.85) 100%)',
            boxShadow: '0 8px 32px rgba(227, 24, 55, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          {/* Side accent */}
          <div className="absolute top-4 left-0 w-1 h-12 bg-white/30 rounded-r" />
          
          <h2 className="relative text-base md:text-lg font-semibold text-white leading-relaxed pl-3">
            {question.text.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < question.text.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h2>
        </div>
      </div>

      {/* Options — Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={status !== 'playing'}
            className={`relative p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-150 ${getOptionStyle(option.id)} ${
              status !== 'playing' ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            {/* Option letter badge */}
            <div className={`absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold font-[var(--font-oswald)] ${
              showResult && option.id === question.correctOptionId
                ? 'bg-[#00C853] text-white'
                : showResult && option.id === selectedOption && option.id !== question.correctOptionId
                ? 'bg-[#FF1744] text-white'
                : 'bg-[#1E3A5F] text-[#94A3B8]'
            }`}>
              {String.fromCharCode(65 + index)}
            </div>
            
            {/* Option text */}
            <span className="text-sm md:text-[15px] font-medium text-white/90 pr-12 leading-relaxed">
              {option.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
