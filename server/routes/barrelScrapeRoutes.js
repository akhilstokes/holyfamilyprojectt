const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/barrelScrapeController');

// Create scrape entry
router.post('/', protect, ctrl.createScrape);

// List scrapes (filter by barrelId/userId)
router.get('/', protect, ctrl.listScrapes);

module.exports = router;


