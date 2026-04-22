/**
 * Main Game Show Component
 * Manages game state and renders different screens
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Episode, Question, GameState, Answer } from '../lib/types';
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
  
  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newState = !prev;
      if (newState) {
        soundManager.enable();
      } else {
        soundManager.disable();
      }
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
      timeRemaining: 90, // 90 seconds TOTAL for all questions
    });
  }, []);

  const handleAnswer = useCallback((optionId: string) => {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = optionId === currentQuestion.correctOptionId;
    
    // Play sound
    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    
    // Flat scoring: 100 points per correct answer, no speed bonus
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
      // Game over - all questions answered
      soundManager.playGameOver();
      setGameState(prev => ({
        ...prev,
        status: 'results',
        score: newScore,
        answers: newAnswers,
      }));
    } else {
      // Show result briefly then advance immediately (timer keeps running!)
      setGameState(prev => ({
        ...prev,
        status: 'answered',
        score: newScore,
        answers: newAnswers,
      }));
      
      // Advance after 600ms (timer keeps ticking during this)
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          status: 'playing',
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
      }, 600);
    }
  }, [gameState]);

  // Timer effect - 90 seconds total for entire game (runs during playing AND answered)
  useEffect(() => {
    if (gameState.status === 'playing' || gameState.status === 'answered') {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timeRemaining - 1;
          
          // Play tick sound when time is low
          if (newTime <= 10 && newTime > 0) {
            soundManager.playTick();
          }
          
          if (newTime <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.status]);

  // Handle time up - end game immediately
  useEffect(() => {
    if ((gameState.status === 'playing' || gameState.status === 'answered') && gameState.timeRemaining === 0) {
      // Mark remaining unanswered questions as wrong
      const answeredCount = gameState.answers.length;
      const remainingQuestions = gameState.questions.slice(answeredCount);
      
      const remainingAnswers: Answer[] = remainingQuestions.map(q => ({
        questionId: q.id,
        selectedOptionId: null,
        correct: false,
        timeTaken: 0,
        pointsEarned: 0,
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
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff00ff]/5 rounded-full blur-[100px]" />
      </div>

      {/* Sound Toggle */}
      <button
        onClick={toggleSound}
        className="absolute top-4 right-4 z-50 p-3 rounded-full border border-gray-700 bg-gray-800/80 text-gray-300 hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all duration-300"
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {soundEnabled ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </button>

      {/* Game content */}
      <div className="relative z-10 w-full max-w-4xl px-4 py-8">
        {gameState.status === 'idle' && (
          <StartScreen onStart={startGame} episodeCount={episodes.length} />
        )}

        {(gameState.status === 'playing' || gameState.status === 'answered') && (
          <div className="flex flex-col items-center gap-6">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="text-[#00f0ff] font-mono text-sm">
                QUESTION {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
              </div>
              <div className="text-[#39ff14] font-mono text-xl font-bold">
                {gameState.score} PTS
              </div>
            </div>

            {/* Timer */}
            <Timer 
              timeRemaining={gameState.timeRemaining} 
              totalTime={90}
              status={gameState.status}
            />

            {/* Question */}
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
