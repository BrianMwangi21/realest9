/**
 * Build script to fetch YouTube data and save to static JSON
 * Run this before building the app: tsx scripts/fetch-youtube-data.ts
 */

import 'dotenv/config';
import { fetchChannelId, fetchEpisodes } from '../app/lib/youtube';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🎬 Fetching Mallory Bros YouTube data...');
  
  const channelId = await fetchChannelId();
  
  if (!channelId) {
    console.error('❌ Could not find channel ID');
    process.exit(1);
  }
  
  console.log(`✅ Found channel: ${channelId}`);
  
  const episodes = await fetchEpisodes(channelId, 100);
  
  if (episodes.length === 0) {
    console.error('❌ No episodes found');
    process.exit(1);
  }
  
  console.log(`✅ Fetched ${episodes.length} episodes`);
  
  const dataPath = join(__dirname, '../app/data/episodes.json');
  writeFileSync(dataPath, JSON.stringify(episodes, null, 2));
  
  console.log(`💾 Saved to ${dataPath}`);
  console.log('🎉 Done!');
}

main();
