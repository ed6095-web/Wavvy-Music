const express = require('express');
const router = express.Router();
const { getSongInfo, streamSong } = require('../controllers/playerController');

router.get('/info/:videoId', getSongInfo);
router.get('/stream/:videoId', streamSong);

module.exports = router;
