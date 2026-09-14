const express = require('express');
const ModuleController = require('../controllers/moduleController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routes
router.get('/modules', ModuleController.getAll);

// Geschützte Routes
router.get('/my-modules', authenticateToken, ModuleController.getUserModules);
router.post('/modules/purchase', authenticateToken, ModuleController.purchase);

module.exports = router;