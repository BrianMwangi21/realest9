/**
 * Main Game Show Component
 * ESPN Broadcast layout with score bug, lower third, stat cards
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Episode, GameState, Answer } from '../lib/types';
import { generateQuestions } from '../lib/questions';
import { soundManager } from '../lib/sounds';
import StartScreen from './StartScreen';
import QuestionCard from './QuestionCard';
import Timer from './Timer';
import ResultsScreen from './ResultsScreen';

interface GameShowProps {
  episodes: Episode[];
}

export default function GameShow({ episodes }: GameShowProps) {
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    currentQuestionIndex: 0,
    questions: [],
    score: 0,
    answers: [],
    timeRemaining: 90,
  });
  
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newState = !prev;
      if (newState) soundManager.enable();
      else soundManager.disable();
      return newState;
    });
  }, []);

  const startGame = useCallback(() => {
    soundManager.playGameStart();
    const questions = generateQuestions(9);
    setGameState({
      status: 'playing',
      currentQuestionIndex: 0,
      questions,
      score: 0,
      answers: [],
      timeRemaining: 90,
    });
  }, []);

  const handleAnswer = useCallback((optionId: string) => {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = optionId === currentQuestion.correctOptionId;
    
    if (isCorrect) soundManager.playCorrect();
    else soundManager.playWrong();
    
    const pointsEarned = isCorrect ? 100 : 0;

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      correct: isCorrect,
      timeTaken: 0,
      pointsEarned,
    };

    const newAnswers = [...gameState.answers, answer];
    const newScore = gameState.score + pointsEarned;

    if (gameState.currentQuestionIndex >= gameState.questions.length - 1) {
      soundManager.playGameOver();
      setGameState(prev => ({
        ...prev,
        status: 'results',
        score: newScore,
        answers: newAnswers,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        status: 'answered',
        score: newScore,
        answers: newAnswers,
      }));
      
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          status: 'playing',
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
      }, 600);
    }
  }, [gameState]);

  // Timer effect — continuous countdown
  useEffect(() => {
    if (gameState.status === 'playing' || gameState.status === 'answered') {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 10 && newTime > 0) soundManager.playTick();
          if (newTime <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState.status]);

  // Time up — end game
  useEffect(() => {
    if ((gameState.status === 'playing' || gameState.status === 'answered') && gameState.timeRemaining === 0) {
      const answeredCount = gameState.answers.length;
      const remainingQuestions = gameState.questions.slice(answeredCount);
      const remainingAnswers: Answer[] = remainingQuestions.map(q => ({
        questionId: q.id, selectedOptionId: null, correct: false, timeTaken: 0, pointsEarned: 0,
      }));
      soundManager.playGameOver();
      setGameState(prev => ({
        ...prev,
        status: 'results',
        answers: [...prev.answers, ...remainingAnswers],
      }));
    }
  }, [gameState.timeRemaining, gameState.status]);

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-[#0B1121]">
      {/* Broadcast studio background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a2b47_0%,_#0B1121_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Score Bug — Top Bar */}
      {(gameState.status === 'playing' || gameState.status === 'answered') && (
        <div className="relative z-20 w-full">
          <div className="score-bug flex items-center justify-between px-4 md:px-6 py-3 mx-4 mt-4 rounded-xl">
            {/* Left: Show branding */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#E31837] flex items-center justify-center">
                <span className="font-[var(--font-oswald)] text-white text-sm font-bold">9</span>
              </div>
              <span className="hidden sm:block font-[var(--font-oswald)] text-white/80 text-sm font-semibold tracking-wider uppercase">
                Realest 9
              </span>
            </div>

            {/* Center: Question progress */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {gameState.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < gameState.answers.length
                        ? gameState.answers[i]?.correct
                          ? 'bg-[#00C853]'
                          : 'bg-[#E31837]'
                        : i === gameState.currentQuestionIndex
                        ? 'bg-white'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <span className="font-[var(--font-oswald)] text-white/60 text-sm tabular-nums">
                {gameState.currentQuestionIndex + 1}/{gameState.questions.length}
              </span>
            </div>

            {/* Right: Score + Timer */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block font-[var(--font-oswald)] text-white text-xl font-bold tabular-nums leading-none">
                  {gameState.score}
                </span>
                <span className="text-[9px] text-white/40 uppercase tracking-wider">PTS</span>
              </div>
              <Timer 
                timeRemaining={gameState.timeRemaining} 
                totalTime={90}
                status={gameState.status}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sound Toggle */}
      <button
        onClick={toggleSound}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-lg bg-[#0F1D33] border border-[#1E3A5F] text-[#94A3B8] hover:text-white hover:border-[#00B4D8] transition-all duration-200"
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {soundEnabled ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
        )}
      </button>

      {/* Game content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {gameState.status === 'idle' && (
          <StartScreen onStart={startGame} episodeCount={episodes.length} />
        )}

        {(gameState.status === 'playing' || gameState.status === 'answered') && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-6 animate-slide-up">
            <QuestionCard
              question={gameState.questions[gameState.currentQuestionIndex]}
              onAnswer={handleAnswer}
              status={gameState.status}
              lastAnswer={gameState.answers[gameState.answers.length - 1]}
            />
          </div>
        )}

        {gameState.status === 'results' && (
          <ResultsScreen
            score={gameState.score}
            totalQuestions={gameState.questions.length}
            answers={gameState.answers}
            questions={gameState.questions}
            onPlayAgain={startGame}
          />
        )}
      </div>
    </div>
  );
}
