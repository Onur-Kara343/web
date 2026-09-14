const express = require('express');
const LibraryController = require('../controllers/libraryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Alle Bibliotheksinhalte
router.get('/library', authenticateToken, LibraryController.getLibrary);

// Nur eBooks
router.get('/library/ebooks', authenticateToken, LibraryController.getEbooks);

module.exports = router;