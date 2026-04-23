const { searchYouTube, searchByQuery } = require('../services/ytmusicService');

const MOOD_QUERIES = {
  happy: 'happy upbeat bollywood pop songs 2024',
  chill: 'chill lo-fi indian relaxing music',
  workout: 'workout gym punjabi motivation music',
  sad: 'sad emotional arijit singh songs playlist',
  focus: 'focus study indian classical instrumental music',
  party: 'party dance bollywood hits 2024',
};

const TRENDING_QUERY = 'top trending indian bollywood music hits 2024';
const RECOMMENDED_QUERY = 'popular hindi songs right now 2024';

exports.searchSongs = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });
    const results = await searchYouTube(q, parseInt(limit));
    res.json({ results, query: q });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const results = await searchByQuery(TRENDING_QUERY, 12);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get trending', message: err.message });
  }
};

exports.getRecommended = async (req, res) => {
  try {
    const results = await searchByQuery(RECOMMENDED_QUERY, 12);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recommendations', message: err.message });
  }
};

exports.getMoodPlaylists = async (req, res) => {
  try {
    const moods = Object.keys(MOOD_QUERIES).map((key) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      query: MOOD_QUERIES[key],
      gradient: getMoodGradient(key),
    }));
    res.json({ moods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get moods' });
  }
};

function getMoodGradient(mood) {
  const gradients = {
    happy: 'linear-gradient(135deg, #FFD700, #FF8C00)',
    chill: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    workout: 'linear-gradient(135deg, #f093fb, #f5576c)',
    sad: 'linear-gradient(135deg, #4776E6, #8E54E9)',
    focus: 'linear-gradient(135deg, #0f9b58, #00d2ff)',
    party: 'linear-gradient(135deg, #fc466b, #3f5efb)',
  };
  return gradients[mood] || 'linear-gradient(135deg, #7B2FFF, #E91E8C)';
}

exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ suggestions: [] });
    // Use youtube-sr directly for suggestions
    const yt = require('youtube-sr').default;
    const suggestions = await yt.getSuggestions(q);
    res.json({ suggestions });
  } catch (err) {
    res.json({ suggestions: [] });
  }
};

exports.getAutoplay = async (req, res) => {
  try {
    const { artist, title } = req.query;
    
    // Construct a highly contextual search query
    let searchQuery = TRENDING_QUERY;
    if (title && artist) {
      searchQuery = `songs like ${title} by ${artist} playlist`;
    } else if (artist) {
      searchQuery = `popular songs by ${artist} mix`;
    }

    const results = await searchYouTube(searchQuery, 15);
    
    if (results && results.length > 0) {
      // Filter out the exact same song if possible
      const filtered = results.filter(s => s.title !== title);
      const options = filtered.length > 0 ? filtered : results;
      
      // Return top 10 most related results for the "Nxt Wave" queue
      const queue = options.slice(0, 10);
      res.json({ song: queue[0], queue });
    } else {
      res.status(404).json({ error: 'No related songs found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch autoplay song', message: err.message });
  }
};
