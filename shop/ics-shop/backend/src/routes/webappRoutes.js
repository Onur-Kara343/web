const express = require('express');
const WebappController = require('../controllers/webappController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/my-webapps', authenticateToken, WebappController.getMyWebapps);
router.get('/webapp-access/:slug', authenticateToken, WebappController.getWebappAccess);

module.exports = router;