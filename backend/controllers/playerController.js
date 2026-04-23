const ytDlp = require('yt-dlp-exec');
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

    // Set correct headers for WebM audio streaming (Opus)
    res.setHeader('Content-Type', 'audio/webm');
    res.setHeader('Cache-Control', 'no-cache');

    const ytDlpProcess = ytDlp.exec(url, {
      output: '-',
      format: 'bestaudio[ext=webm]/bestaudio',
      quiet: true,
      noWarnings: true,
      // Increase reliability
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    // Pipe the stdout of yt-dlp directly to the Express response
    ytDlpProcess.stdout.pipe(res);

    // Handle process errors
    ytDlpProcess.on('error', (err) => {
      console.error('yt-dlp error:', err);
      if (!res.headersSent) {
        res.status(500).end('Stream failed');
      }
    });

    // Handle client disconnects to prevent zombie processes
    req.on('close', () => {
      if (ytDlpProcess && !ytDlpProcess.killed) {
        ytDlpProcess.kill('SIGKILL');
      }
    });

  } catch (err) {
    console.error('Stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream failed', message: err.message });
    }
  }
};
