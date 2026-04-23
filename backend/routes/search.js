const express = require('express');
const router = express.Router();
const { searchSongs, getSuggestions, getAutoplay } = require('../controllers/searchController');

router.get('/', searchSongs);
router.get('/suggest', getSuggestions);
router.get('/autoplay', getAutoplay);

module.exports = router;
