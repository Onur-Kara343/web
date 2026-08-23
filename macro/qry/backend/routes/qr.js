const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const auth = require('../middleware/auth');

router.post('/generate', auth, qrController.generate);
router.get('/history', auth, qrController.getHistory);
router.delete('/history/:id', auth, qrController.deleteHistory);

module.exports = router;