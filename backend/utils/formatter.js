exports.formatSong = (video) => {
  const durationSec = video.duration || 0;
  return {
    id: video.id,
    title: video.title || 'Unknown Title',
    artist: video.channel?.name || video.uploader || 'Unknown Artist',
    thumbnail:
      video.thumbnail?.url ||
      video.thumbnails?.slice(-1)[0]?.url ||
      `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
    duration: formatDuration(Math.floor(durationSec / 1000)),
    durationSeconds: Math.floor(durationSec / 1000),
    views: formatViews(video.views),
    streamUrl: `/api/song/stream/${video.id}`,
    youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
  };
};

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViews(views) {
  if (!views) return '';
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views} views`;
}
