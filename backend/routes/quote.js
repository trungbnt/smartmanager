const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middleware/auth');

// Đăng ký các route cho báo giá
router.post('/', auth(['admin', 'staff']), quoteController.createQuote);
router.get('/', auth(['admin', 'staff']), quoteController.getQuotes);
router.put('/:id/status', auth(['admin', 'staff']), quoteController.updateQuoteStatus);

module.exports = router; 