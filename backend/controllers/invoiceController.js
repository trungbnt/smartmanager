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
        const invoices = await Invoice.find();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
};

// Thêm hóa đơn
exports.addInvoice = async (req, res) => {
    const newInvoice = new Invoice(req.body);
    try {
        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(400).json({ message: 'Error adding invoice' });
    }
};

// Cập nhật hóa đơn
exports.updateInvoice = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: 'Error updating invoice' });
    }
};

// Xóa hóa đơn
exports.deleteInvoice = async (req, res) => {
    const { id } = req.params;
    try {
        await Invoice.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting invoice' });
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