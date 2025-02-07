const Invoice = require('../models/Invoice');
const Quote = require('../models/Quote');

// Tạo hóa đơn mới
exports.createInvoice = async (req, res) => {
    try {
        const { quoteId, amount } = req.body;
        const invoice = new Invoice({ quoteId, amount });
        await invoice.save();
        res.status(201).send(invoice);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách hóa đơn
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('quoteId');
        res.status(200).send(invoices);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Cập nhật trạng thái hóa đơn
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const invoice = await Invoice.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).send(invoice);
    } catch (error) {
        res.status(400).send(error);
    }
}; 