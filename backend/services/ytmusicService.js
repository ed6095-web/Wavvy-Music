const YouTube = require('youtube-sr').default;
const ytdl = require('@distube/ytdl-core');
const NodeCache = require('node-cache');
const { formatSong } = require('../utils/formatter');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const yts = require('yt-search');

exports.searchYouTube = async (query, limit = 20) => {
  const cacheKey = `search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // Try yt-search which is much more resilient to YouTube UI changes
    const r = await yts(query);
    const videos = r.videos.slice(0, limit);
    
    // Format to match our app's schema
    const formatted = videos.map(v => ({
      id: v.videoId,
      title: v.title,
      artist: v.author?.name || 'Unknown Artist',
      thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
      duration: v.timestamp || '0:00',
      durationSeconds: v.seconds || 0,
      views: v.views ? `${(v.views / 1000).toFixed(1)}K views` : '',
      streamUrl: `/api/song/stream/${v.videoId}`,
      youtubeUrl: v.url
    }));
    
    cache.set(cacheKey, formatted);
    return formatted;
  } catch (err) {
    console.error("Search failed with yt-search:", err);
    return [];
  }
};

exports.searchByQuery = async (query, limit = 12) => {
  return exports.searchYouTube(query, limit);
};

exports.getVideoInfo = async (videoId) => {
  const cacheKey = `info:${videoId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const info = await ytdl.getBasicInfo(url);
  const details = info.videoDetails;

  const result = {
    id: videoId,
    title: details.title,
    artist: details.author?.name || 'Unknown Artist',
    thumbnail: details.thumbnails?.slice(-1)[0]?.url || '',
    duration: formatDuration(parseInt(details.lengthSeconds)),
    durationSeconds: parseInt(details.lengthSeconds),
    streamUrl: `/api/song/stream/${videoId}`,
  };

  cache.set(cacheKey, result);
  return result;
};

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
