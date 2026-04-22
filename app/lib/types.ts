/**
 * Realest 9 - Game Show Types
 */

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  thumbnail: string;
  duration?: string;
}

export type QuestionType =
  | 'episodeTitle'
  | 'viewCountBattle'
  | 'chronology'
  | 'episodeNumberGuess'
  | 'contentRecall'
  | 'viewEstimate';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: Option[];
  correctOptionId: string;
  points: number;
  timeLimit: number; // seconds
  relatedEpisodes: string[]; // episode IDs for reference
}

export interface Option {
  id: string;
  text: string;
  image?: string;
}

export interface GameState {
  status: 'idle' | 'playing' | 'answered' | 'results';
  currentQuestionIndex: number;
  questions: Question[];
  score: number;
  answers: Answer[];
  timeRemaining: number;
}

export interface Answer {
  questionId: string;
  selectedOptionId: string | null;
  correct: boolean;
  timeTaken: number;
  pointsEarned: number;
}

export interface ShareResult {
  score: number;
  totalQuestions: number;
  rank: string;
  shareText: string;
}
