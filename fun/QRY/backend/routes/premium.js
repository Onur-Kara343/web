const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const auth = require('../middleware/auth');

router.post('/checkout', auth, premiumController.createCheckout);
router.post('/verify', auth, premiumController.verifyPurchase);
router.post('/webhook', premiumController.webhookHandler);

module.exports = router;