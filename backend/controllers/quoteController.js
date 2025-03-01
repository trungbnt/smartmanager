const Quote = require('../models/Quote');
const JobRequest = require('../models/JobRequest');

// Tạo báo giá mới
exports.createQuote = async (req, res) => {
    try {
        const { jobRequestId, amount, details } = req.body;

        // Validate required fields
        if (!jobRequestId || !amount || !details) {
            return res.status(400).json({
                message: 'Vui lòng điền đầy đủ thông tin',
                received: { jobRequestId, amount, details }
            });
        }

        // Parse amount to ensure it's a number
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
            return res.status(400).json({ message: 'Số tiền không hợp lệ' });
        }

        // Create quote data
        const quoteData = {
            jobRequestId,
            amount: parsedAmount,
            details,
            status: 'pending'
        };

        // Add file URL if file was uploaded
        if (req.file) {
            quoteData.fileUrl = `/uploads/${req.file.filename}`;
        }

        const quote = new Quote(quoteData);
        await quote.save();
        res.status(201).json(quote);
    } catch (error) {
        console.error('Quote creation error:', error);
        res.status(400).json({ 
            message: 'Không thể tạo báo giá',
            error: error.message 
        });
    }
};

// Lấy danh sách báo giá
exports.getQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find().sort({ createdAt: -1 });
        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ message: 'Không thể lấy danh sách báo giá' });
    }
};

// Cập nhật báo giá
exports.updateQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { jobRequestId, amount, details, status } = req.body;

        // Validate amount if it's being updated
        if (amount) {
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount)) {
                return res.status(400).json({ message: 'Số tiền không hợp lệ' });
            }
            req.body.amount = parsedAmount;
        }

        const quote = await Quote.findById(id);
        if (!quote) {
            return res.status(404).json({ message: 'Không tìm thấy báo giá' });
        }

        // Update file if new one is uploaded
        if (req.file) {
            req.body.fileUrl = `/uploads/${req.file.filename}`;
        }

        const updatedQuote = await Quote.findByIdAndUpdate(id, req.body, { 
            new: true,
            runValidators: true 
        });
        res.json(updatedQuote);
    } catch (error) {
        console.error('Error updating quote:', error);
        res.status(400).json({ message: 'Không thể cập nhật báo giá' });
    }
};

// Xóa báo giá
exports.deleteQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const quote = await Quote.findById(id);
        
        if (!quote) {
            return res.status(404).json({ message: 'Không tìm thấy báo giá' });
        }

        // Delete associated file if exists
        if (quote.fileUrl) {
            const filePath = path.join(__dirname, '..', quote.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await quote.deleteOne();
        res.json({ message: 'Xóa báo giá thành công' });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(400).json({ message: 'Không thể xóa báo giá' });
    }
};

// Cập nhật trạng thái báo giá
exports.updateQuoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const quote = await Quote.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true, runValidators: true }
        );

        if (!quote) {
            return res.status(404).json({ message: 'Không tìm thấy báo giá' });
        }

        res.json(quote);
    } catch (error) {
        console.error('Error updating quote status:', error);
        res.status(400).json({ message: 'Không thể cập nhật trạng thái' });
    }
};