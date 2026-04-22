/**
 * Question Card Component
 * Displays a question with multiple choice options
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

  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
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
        ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]'
        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/5';
    }

    const isCorrect = optionId === question.correctOptionId;
    const isSelected = optionId === selectedOption;

    if (isCorrect) {
      return 'border-[#39ff14] bg-[#39ff14]/20 text-[#39ff14]';
    }
    if (isSelected && !isCorrect) {
      return 'border-[#ff0040] bg-[#ff0040]/20 text-[#ff0040]';
    }
    return 'border-gray-700 bg-gray-800/30 text-gray-500';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      episodeTitle: '🎬 Episode Title',
      viewCountBattle: '⚔️ View Battle',
      chronology: '📅 Timeline',
      episodeNumberGuess: '🔢 Episode Number',
      contentRecall: '🧠 Content Recall',
      viewEstimate: '📊 View Estimate',
    };
    return labels[type] || type;
  };

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Question Type Badge */}
      <div className="flex justify-center mb-4">
        <span className="px-4 py-1 rounded-full text-xs font-mono font-bold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
          {getTypeLabel(question.type)}
        </span>
      </div>

      {/* Question Text */}
      <div className="mb-8 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
          {question.text.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < question.text.split('\n').length - 1 && <br />}
            </span>
          ))}
        </h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={status !== 'playing'}
            className={`relative p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-300 ${getOptionStyle(option.id)} ${
              status !== 'playing' ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
            }`}
          >
            {/* Option letter */}
            <span className="absolute top-3 right-3 text-xs font-mono font-bold opacity-50">
              {String.fromCharCode(65 + index)}
            </span>
            
            {/* Option text */}
            <span className="text-sm md:text-base font-medium pr-8">
              {option.text}
            </span>

            {/* Result indicators */}
            {status === 'answered' && (
              <>
                {option.id === question.correctOptionId && (
                  <span className="absolute bottom-3 right-3 text-[#39ff14] text-xl">✓</span>
                )}
                {lastAnswer && option.id === lastAnswer.selectedOptionId && 
                 option.id !== question.correctOptionId && (
                  <span className="absolute bottom-3 right-3 text-[#ff0040] text-xl">✗</span>
                )}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
