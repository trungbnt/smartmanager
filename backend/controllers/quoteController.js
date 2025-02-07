const Quote = require('../models/Quote');
const JobRequest = require('../models/JobRequest');

// Tạo báo giá mới
exports.createQuote = async (req, res) => {
    try {
        const { jobRequestId, amount, details } = req.body;
        const quote = new Quote({ jobRequestId, amount, details });
        await quote.save();
        res.status(201).send(quote);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách báo giá
exports.getQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find().populate('jobRequestId');
        res.status(200).send(quotes);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Cập nhật trạng thái báo giá
exports.updateQuoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const quote = await Quote.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).send(quote);
    } catch (error) {
        res.status(400).send(error);
    }
}; 