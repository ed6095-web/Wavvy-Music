const ytdl = require('@distube/ytdl-core');
const { getVideoInfo } = require('../services/ytmusicService');

exports.getSongInfo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const info = await getVideoInfo(videoId);
    res.json(info);
  } catch (err) {
    console.error('Song info error:', err.message);
    res.status(500).json({ error: 'Failed to get song info', message: err.message });
  }
};

exports.streamSong = async (req, res) => {
  try {
    const { videoId } = req.params;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    if (!ytdl.validateID(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }

    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    if (!format) {
      return res.status(404).json({ error: 'No audio format found' });
    }

    // Set correct Content-Type so browser knows how to decode the stream
    res.setHeader('Content-Type', format.mimeType || 'audio/webm');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Song-Title', encodeURIComponent(info.videoDetails.title));

    ytdl(url, {
      format,
      filter: 'audioonly',
      quality: 'highestaudio',
    }).pipe(res);
  } catch (err) {
    console.error('Stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream failed', message: err.message });
    }
  }
};
