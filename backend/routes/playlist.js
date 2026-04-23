const express = require('express');
const router = express.Router();
const { getTrending, getMoodPlaylists, getRecommended } = require('../controllers/searchController');

router.get('/trending', getTrending);
router.get('/moods', getMoodPlaylists);
router.get('/recommended', getRecommended);

module.exports = router;
