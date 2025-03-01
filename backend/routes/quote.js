const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Quote = require('../models/Quote'); // Assuming you have a Quote model

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Đăng ký các route cho báo giá
router.post('/', auth(['admin', 'staff']), quoteController.createQuote);
router.get('/', auth(['admin', 'staff']), quoteController.getQuotes);
router.put('/:id/status', auth(['admin', 'staff']), quoteController.updateQuoteStatus);

// Backend route handler example
router.post('/quotes', upload.single('file'), async (req, res) => {
    try {
        const { jobRequestId, amount, details } = req.body;
        
        const quote = new Quote({
            jobRequestId,
            amount: parseFloat(amount),
            details,
            fileUrl: req.file ? `/uploads/${req.file.filename}` : null
        });

        await quote.save();
        res.status(201).json(quote);
    } catch (error) {
        console.error('Quote creation error:', error);
        res.status(400).json({ message: 'Error adding quote', error: error.message });
    }
});

module.exports = router;