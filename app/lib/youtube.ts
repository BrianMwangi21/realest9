/**
 * YouTube Data API Fetcher
 * Fetches episode data from Mallory Bros Podcast channel
 */

import { Episode } from './types';

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_HANDLE = '@mallorybrospodcast';

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: { medium: { url: string } };
  };
}

interface YouTubeVideoItem {
  id: string;
  statistics: {
    viewCount: string;
    likeCount: string;
  };
  contentDetails?: {
    duration: string;
  };
}

function parseEpisodeNumber(title: string): number | null {
  // Match patterns like "Ep.299", "Ep. 299", "Episode 299", "Ep 299"
  const patterns = [
    /Ep\.?\s*(\d+)/i,
    /Episode\s+(\d+)/i,
    /#(\d+)/,
    /\b(\d{3})\b/,
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > 0 && num < 1000) return num;
    }
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  // Handles named entities, decimal entities (&#123;), and hex entities (&#x1F;)
  return text.replace(/&([a-zA-Z]+);|&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, name, decimal, hex) => {
    if (decimal) return String.fromCharCode(parseInt(decimal, 10));
    if (hex) return String.fromCharCode(parseInt(hex, 16));
    // Named entities
    const named: Record<string, string> = {
      amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
      nbsp: ' ', copy: '©', reg: '®', trade: '™',
    };
    return named[name] || match;
  });
}

function processEpisodeTitle(title: string): { cleanTitle: string; episodeNumber: number | null } {
  const episodeNumber = parseEpisodeNumber(title);
  
  // Strip episode number prefix patterns like "Ep.300 | ", "Ep 300 | ", "Episode 300 | "
  let clean = title;
  const prefixPatterns = [
    /Ep\.?\s*\d+\s*\|\s*/i,
    /Episode\s+\d+\s*\|\s*/i,
    /#\d+\s*\|\s*/i,
  ];
  
  for (const pattern of prefixPatterns) {
    clean = clean.replace(pattern, '');
  }
  
  // Decode HTML entities
  clean = decodeHtmlEntities(clean);
  
  return { cleanTitle: clean.trim(), episodeNumber };
}

export async function fetchChannelId(): Promise<string | null> {
  if (!API_KEY) {
    console.warn('YOUTUBE_API_KEY not found in environment');
    return null;
  }

  try {
    // Search for channel by handle
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(CHANNEL_HANDLE)}&type=channel&key=${API_KEY}&maxResults=5`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id.channelId;
    }
    return null;
  } catch (error) {
    console.error('Error fetching channel ID:', error);
    return null;
  }
}

export async function fetchEpisodes(channelId: string, maxResults: number = 100): Promise<Episode[]> {
  if (!API_KEY) {
    console.warn('YOUTUBE_API_KEY not found');
    return [];
  }

  try {
    const allItems: YouTubeSearchItem[] = [];
    let nextPageToken: string | undefined = undefined;
    const maxPerPage = 50; // YouTube API limit
    const maxPages = Math.ceil(maxResults / maxPerPage);
    
    // Fetch multiple pages to get up to maxResults
    for (let page = 0; page < maxPages; page++) {
      if (allItems.length >= maxResults) break;
      
      const pageTokenParam: string = nextPageToken ? `&pageToken=${nextPageToken}` : '';
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&key=${API_KEY}&maxResults=${Math.min(maxPerPage, maxResults - allItems.length)}${pageTokenParam}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.error) {
        console.error('YouTube API error:', searchData.error);
        break;
      }
      
      if (!searchData.items || searchData.items.length === 0) {
        break;
      }
      
      allItems.push(...searchData.items);
      
      if (!searchData.nextPageToken) {
        break;
      }
      nextPageToken = searchData.nextPageToken;
    }

    if (allItems.length === 0) {
      return [];
    }

    // Get video IDs for statistics (batch in chunks of 50)
    const videoIds = allItems.map((item: YouTubeSearchItem) => item.id.videoId);
    const videoStats = new Map<string, YouTubeVideoItem>();
    
    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      const chunkIds = chunk.join(',');
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${chunkIds}&key=${API_KEY}`;
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();
      
      videosData.items?.forEach((item: YouTubeVideoItem) => {
        videoStats.set(item.id, item);
      });
    }

    // Map to Episode type
    const episodes: Episode[] = allItems.map((item: YouTubeSearchItem) => {
      const stats = videoStats.get(item.id.videoId);
      const { cleanTitle, episodeNumber } = processEpisodeTitle(item.snippet.title);
      
      return {
        id: item.id.videoId,
        title: cleanTitle,
        episodeNumber: episodeNumber || 0,
        publishedAt: item.snippet.publishedAt,
        viewCount: stats ? parseInt(stats.statistics.viewCount, 10) : 0,
        likeCount: stats ? parseInt(stats.statistics.likeCount || '0', 10) : 0,
        thumbnail: item.snippet.thumbnails?.medium?.url || '',
        duration: stats?.contentDetails?.duration || '',
      };
    });

    // Filter out episodes with no episode number and sort by episode number desc
    return episodes
      .filter(ep => ep.episodeNumber > 0)
      .sort((a, b) => b.episodeNumber - a.episodeNumber)
      .slice(0, maxResults);

  } catch (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }
}
