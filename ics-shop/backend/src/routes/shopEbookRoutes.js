const express = require('express');
const ShopEbookController = require('../controllers/shopEbookController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routes
router.get('/shop-ebooks', ShopEbookController.getAll);
router.get('/shop-ebooks/free', ShopEbookController.getFreeEbooks);
router.get('/shop-ebooks/paid', ShopEbookController.getPaidEbooks);
router.get('/shop-ebooks/download/free/:slug', ShopEbookController.downloadFreeEbook);

// Geschützte Routes
router.get('/my-shop-ebooks', authenticateToken, ShopEbookController.getUserEbooks);
router.post('/shop-ebooks/purchase', authenticateToken, ShopEbookController.purchase);
router.get('/shop-ebooks/download/:slug', authenticateToken, ShopEbookController.downloadPurchasedEbook);

module.exports = router;