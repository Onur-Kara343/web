const express = require('express');
const EbookController = require('../controllers/ebookController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/my-ebooks', authenticateToken, EbookController.getMyEbooks);
router.get('/download/:ebookSlug', authenticateToken, EbookController.downloadEbook);

module.exports = router;