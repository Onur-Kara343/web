const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getPremiumStatus, activatePremium, createCheckout } = require('../controllers/premiumController');

router.get('/status', authenticateToken, getPremiumStatus);
router.post('/activate', authenticateToken, activatePremium);
router.post('/checkout', authenticateToken, createCheckout);

module.exports = router;