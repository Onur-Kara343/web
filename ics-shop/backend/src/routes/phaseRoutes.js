const express = require('express');
const PhaseController = require('../controllers/phaseController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routes
router.get('/phases', PhaseController.getAll);
router.get('/phases/:phaseId/ebooks', PhaseController.getPhaseEbooks);

// Geschützte Routes
router.get('/my-phases', authenticateToken, PhaseController.getUserPhases);
router.get('/phases/download/:slug', authenticateToken, PhaseController.downloadPhaseEbook);

module.exports = router;