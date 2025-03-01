const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const customerController = require('../controllers/customerController');
const jobRequestController = require('../controllers/jobRequestController');
const quoteController = require('../controllers/quoteController');
const scheduleController = require('../controllers/scheduleController');
const invoiceController = require('../controllers/invoiceController');
const reportController = require('../controllers/reportController');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Đăng ký người dùng mới
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !user.comparePassword(password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = user.generateToken();
    res.json({
        token,
        role: user.role,
    });
});

// Route yêu cầu quyền truy cập
router.get('/customers', authMiddleware(['admin', 'account', 'sales']), customerController.getCustomers);
router.post('/customers', authMiddleware(['admin', 'account']), customerController.addCustomer);
router.put('/customers/:id', authMiddleware(['admin', 'account']), customerController.updateCustomer);
router.delete('/customers/:id', authMiddleware(['admin']), customerController.deleteCustomer);

// Route cho yêu cầu công việc
router.get('/job-requests', authMiddleware(['admin', 'account', 'sales', 'customer']), jobRequestController.getJobRequests);
router.post('/job-requests', authMiddleware(['admin', 'account', 'customer']), jobRequestController.addJobRequest);
router.put('/job-requests/:id', authMiddleware(['admin', 'account']), jobRequestController.updateJobRequest);
router.delete('/job-requests/:id', authMiddleware(['admin']), jobRequestController.deleteJobRequest);

// Route cho báo giá
router.get('/quotes', authMiddleware(['admin', 'account', 'sales']), quoteController.getQuotes);
router.post('/quotes', authMiddleware(['admin', 'account']), quoteController.addQuote);
router.put('/quotes/:id', authMiddleware(['admin', 'account']), quoteController.updateQuote);
router.delete('/quotes/:id', authMiddleware(['admin']), quoteController.deleteQuote);

// Route cho lịch trình
router.get('/schedules', authMiddleware(['admin', 'account', 'sales']), scheduleController.getSchedules);
router.post('/schedules', authMiddleware(['admin', 'account']), scheduleController.addSchedule);
router.put('/schedules/:id', authMiddleware(['admin', 'account']), scheduleController.updateSchedule);
router.delete('/schedules/:id', authMiddleware(['admin']), scheduleController.deleteSchedule);

// Route cho hóa đơn
router.get('/invoices', authMiddleware(['admin', 'account']), invoiceController.getInvoices);
router.post('/invoices', authMiddleware(['admin', 'account']), invoiceController.addInvoice);
router.put('/invoices/:id', authMiddleware(['admin', 'account']), invoiceController.updateInvoice);
router.delete('/invoices/:id', authMiddleware(['admin']), invoiceController.deleteInvoice);

// Route cho báo cáo
router.get('/reports', authMiddleware(['admin', 'account']), reportController.getReports);
router.post('/reports', authMiddleware(['admin', 'account']), reportController.addReport);
router.put('/reports/:id', authMiddleware(['admin', 'account']), reportController.updateReport);
router.delete('/reports/:id', authMiddleware(['admin']), reportController.deleteReport);

module.exports = router; 