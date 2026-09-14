const express = require('express');
const router = express.Router();
const { register, login, verify, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/verify', authenticateToken, verify);
router.post('/logout', logout); // ← NEU

module.exports = router;