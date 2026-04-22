/**
 * Next.js App Router - Main Page
 * Server component that loads episode data and passes to client game
 */

import GameShow from './components/GameShow';
import episodesData from './data/episodes.json';
import { Episode } from './lib/types';

export default async function Home() {
  // In production, this could fetch fresh data. For now we use the static JSON.
  const episodes: Episode[] = episodesData as Episode[];

  return (
    <main className="min-h-screen">
      <GameShow episodes={episodes} />
    </main>
  );
}
