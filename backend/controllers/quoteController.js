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
        const quotes = await Quote.find();
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quotes' });
    }
};

// Thêm báo giá
exports.addQuote = async (req, res) => {
    const newQuote = new Quote(req.body);
    try {
        await newQuote.save();
        res.status(201).json(newQuote);
    } catch (error) {
        res.status(400).json({ message: 'Error adding quote' });
    }
};

// Cập nhật báo giá
exports.updateQuote = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedQuote = await Quote.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedQuote);
    } catch (error) {
        res.status(400).json({ message: 'Error updating quote' });
    }
};

// Xóa báo giá
exports.deleteQuote = async (req, res) => {
    const { id } = req.params;
    try {
        await Quote.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting quote' });
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