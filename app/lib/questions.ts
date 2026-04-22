/**
 * Question Generation Engine
 * Creates quiz questions from episode data
 */

import { Episode, Question, QuestionType, Option } from './types';
import episodesData from '../data/episodes.json';

const EPISODES: Episode[] = episodesData as Episode[];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomEpisodes(count: number, exclude?: Episode[]): Episode[] {
  const filtered = exclude 
    ? EPISODES.filter(ep => !exclude.find(e => e.id === ep.id))
    : [...EPISODES];
  return shuffleArray(filtered).slice(0, count);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Question Generators

function generateEpisodeTitleQuestion(): Question | null {
  const target = EPISODES[Math.floor(Math.random() * EPISODES.length)];
  if (!target) return null;
  
  const distractors = getRandomEpisodes(3, [target]);
  const options: Option[] = shuffleArray([
    { id: 'a', text: target.title },
    ...distractors.map((ep, i) => ({ id: ['b', 'c', 'd'][i], text: ep.title })),
  ]);
  
  return {
    id: `title-${target.id}`,
    type: 'episodeTitle',
    text: `What is the full title of Episode ${target.episodeNumber}?`,
    options,
    correctOptionId: options.find(o => o.text === target.title)?.id || 'a',
    points: 100,
    timeLimit: 90,
    relatedEpisodes: [target.id],
  };
}

function generateViewCountBattleQuestion(): Question | null {
  const [ep1, ep2] = getRandomEpisodes(2);
  if (!ep1 || !ep2) return null;
  
  const winner = ep1.viewCount > ep2.viewCount ? ep1 : ep2;
  const options: Option[] = [
    { id: 'a', text: `${ep1.title} (${formatNumber(ep1.viewCount)} views)` },
    { id: 'b', text: `${ep2.title} (${formatNumber(ep2.viewCount)} views)` },
  ];
  
  return {
    id: `battle-${ep1.id}-${ep2.id}`,
    type: 'viewCountBattle',
    text: 'Which episode has more views?',
    options,
    correctOptionId: winner.id === ep1.id ? 'a' : 'b',
    points: 100,
    timeLimit: 90,
    relatedEpisodes: [ep1.id, ep2.id],
  };
}

function generateChronologyQuestion(): Question | null {
  const [ep1, ep2] = getRandomEpisodes(2);
  if (!ep1 || !ep2) return null;
  
  const date1 = new Date(ep1.publishedAt);
  const date2 = new Date(ep2.publishedAt);
  const first = date1 < date2 ? ep1 : ep2;
  
  const options: Option[] = [
    { id: 'a', text: `${ep1.title} (${formatDate(ep1.publishedAt)})` },
    { id: 'b', text: `${ep2.title} (${formatDate(ep2.publishedAt)})` },
  ];
  
  return {
    id: `chrono-${ep1.id}-${ep2.id}`,
    type: 'chronology',
    text: 'Which episode was released FIRST?',
    options,
    correctOptionId: first.id === ep1.id ? 'a' : 'b',
    points: 100,
    timeLimit: 90,
    relatedEpisodes: [ep1.id, ep2.id],
  };
}

function generateEpisodeNumberGuessQuestion(): Question | null {
  const target = EPISODES[Math.floor(Math.random() * EPISODES.length)];
  if (!target) return null;
  
  // Generate 3 distractors that are close to the real number
  const distractors: number[] = [];
  while (distractors.length < 3) {
    const offset = Math.floor(Math.random() * 20) - 10; // -10 to +10
    const num = target.episodeNumber + offset;
    if (num > 0 && num !== target.episodeNumber && !distractors.includes(num)) {
      distractors.push(num);
    }
  }
  
  const options: Option[] = shuffleArray([
    { id: 'a', text: `Episode ${target.episodeNumber}` },
    ...distractors.map((num, i) => ({ id: ['b', 'c', 'd'][i], text: `Episode ${num}` })),
  ]);
  
  return {
    id: `num-${target.id}`,
    type: 'episodeNumberGuess',
    text: `What episode number is this title from?\n\n"${target.title}"`,
    options,
    correctOptionId: options.find(o => o.text === `Episode ${target.episodeNumber}`)?.id || 'a',
    points: 100,
    timeLimit: 90,
    relatedEpisodes: [target.id],
  };
}

function generateContentRecallQuestion(): Question | null {
  const target = EPISODES[Math.floor(Math.random() * EPISODES.length)];
  if (!target) return null;
  
  // Extract keywords from the title (topics mentioned)
  const titleLower = target.title.toLowerCase();
  const distractorTopics = [
    'Drake', 'Kendrick', 'Kanye', 'J Cole', 'LeBron', 'Oscars',
    'Grammys', 'Super Bowl', 'NBA', 'NFL', 'Boxing', 'Movie',
    'Album', 'Tour', 'Debate', 'Ranking', 'Recap', 'Review',
  ];
  
  // Find which topics are actually in the title
  const actualTopics = distractorTopics.filter(t => titleLower.includes(t.toLowerCase()));
  const fakeTopics = distractorTopics.filter(t => !titleLower.includes(t.toLowerCase()));
  
  // Need at least 1 actual topic and 3 fake ones
  if (actualTopics.length === 0 || fakeTopics.length < 3) return null;
  
  const correctTopic = actualTopics[Math.floor(Math.random() * actualTopics.length)];
  const wrongTopics = shuffleArray(fakeTopics).slice(0, 3);
  
  const options: Option[] = shuffleArray([
    { id: 'a', text: correctTopic },
    ...wrongTopics.map((t, i) => ({ id: ['b', 'c', 'd'][i], text: t })),
  ]);
  
  return {
    id: `content-${target.id}`,
    type: 'contentRecall',
    text: `Which topic was discussed in ${target.title.substring(0, 60)}...?`,
    options,
    correctOptionId: options.find(o => o.text === correctTopic)?.id || 'a',
    points: 100,
    timeLimit: 90,
    relatedEpisodes: [target.id],
  };
}

function generateViewEstimateQuestion(): Question | null {
  const target = EPISODES[Math.floor(Math.random() * EPISODES.length)];
  if (!target) return null;
  
  const actualViews = target.viewCount;
  const ranges = [
    { min: 0, max: 5000, label: '0 - 5K' },
    { min: 5000, max: 15000, label: '5K - 15K' },
    { min: 15000, max: 30000, label: '15K - 30K' },
    { min: 30000, max: 50000, label: '30K - 50K' },
    { min: 50000, max: 100000, label: '50K - 100K' },
    { min: 100000, max: 500000, label: '100K - 500K' },
  ];
  
  // Find which range the actual view count falls into
  const correctRange = ranges.find(r => actualViews >= r.min && actualViews < r.max);
  if (!correctRange) return null;
  
  // Pick 3 other ranges that don't overlap
  const otherRanges = ranges.filter(r => r !== correctRange);
  const selectedWrong = shuffleArray(otherRanges).slice(0, 3);
  
  const options: Option[] = shuffleArray([
    { id: 'a', text: correctRange.label },
    ...selectedWrong.map((r, i) => ({ id: ['b', 'c', 'd'][i], text: r.label })),
  ]);
  
  return {
    id: `estimate-${target.id}`,
    type: 'viewEstimate',
    text: `How many views does "${target.title.substring(0, 50)}..." have?`,
    options,
    correctOptionId: options.find(o => o.text === correctRange.label)?.id || 'a',
    points: 100,
    timeLimit: 90,
    relatedEpisodes: [target.id],
  };
}

// Question generator registry
const questionGenerators = [
  generateEpisodeTitleQuestion,
  generateViewCountBattleQuestion,
  generateChronologyQuestion,
  generateEpisodeNumberGuessQuestion,
  generateContentRecallQuestion,
  generateViewEstimateQuestion,
];

export function generateQuestions(count: number = 9): Question[] {
  const questions: Question[] = [];
  const usedGenerators: Set<number> = new Set();
  
  // Ensure we get a variety of question types
  for (let i = 0; i < count; i++) {
    let question: Question | null = null;
    let attempts = 0;
    
    while (!question && attempts < 20) {
      // Pick a random generator, preferring unused ones
      let generatorIndex: number;
      if (usedGenerators.size < questionGenerators.length && Math.random() > 0.3) {
        const unused = questionGenerators.map((_, i) => i).filter(i => !usedGenerators.has(i));
        generatorIndex = unused[Math.floor(Math.random() * unused.length)];
      } else {
        generatorIndex = Math.floor(Math.random() * questionGenerators.length);
      }
      
      usedGenerators.add(generatorIndex);
      question = questionGenerators[generatorIndex]();
      attempts++;
    }
    
    if (question) {
      questions.push(question);
    }
  }
  
  return questions;
}

export { EPISODES };
