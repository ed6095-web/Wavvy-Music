const express = require('express');
const cors = require('cors');
require('dotenv').config();

const searchRoutes = require('./routes/search');
const songRoutes = require('./routes/song');
const playlistRoutes = require('./routes/playlist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Bypass localtunnel's "click to continue" screen for API requests
app.use((req, res, next) => {
  res.setHeader('bypass-tunnel-reminder', 'true');
  next();
});

app.use('/api/search', searchRoutes);
app.use('/api/song', songRoutes);
app.use('/api', playlistRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Wavvy', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`🎵 Wavvy backend running at http://localhost:${PORT}`);
});

module.exports = app;
