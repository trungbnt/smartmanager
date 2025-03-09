const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');
const customerController = require('../controllers/customerController');
const jobRequestController = require('../controllers/jobRequestController');
const { createQuote, getQuotes, updateQuote, deleteQuote, updateQuoteStatus } = require('../controllers/quoteController');
const scheduleController = require('../controllers/scheduleController');
const invoiceController = require('../controllers/invoiceController');
const reportController = require('../controllers/reportController');
const User = require('../models/User');
const auth = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');
const equipmentController = require('../controllers/equipmentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Get the file name without extension
        const fileName = path.parse(file.originalname).name;
        // Get the file extension
        const fileExt = path.extname(file.originalname);
        // Create unique suffix
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Combine original filename with unique suffix
        cb(null, `${fileName}-${uniqueSuffix}${fileExt}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

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
router.get('/customers', auth(['admin', 'account', 'sales']), customerController.getCustomers);
router.post('/customers', auth(['admin', 'account']), customerController.addCustomer);
router.put('/customers/:id', auth(['admin', 'account']), customerController.updateCustomer);
router.delete('/customers/:id', auth(['admin']), customerController.deleteCustomer);

// Route cho yêu cầu công việc
router.get('/job-requests', auth(['admin', 'account', 'sales', 'customer']), jobRequestController.getJobRequests);
router.post('/job-requests', auth(['admin', 'account', 'customer']), jobRequestController.addJobRequest);
router.put('/job-requests/:id', auth(['admin', 'account']), jobRequestController.updateJobRequest);
router.delete('/job-requests/:id', auth(['admin']), jobRequestController.deleteJobRequest);

// Route cho báo giá
router.get('/quotes', auth(['admin', 'account', 'sales']), getQuotes);
router.post('/quotes', auth(['admin', 'account']), upload.single('file'), createQuote);
router.put('/quotes/:id', auth(['admin', 'account']), upload.single('file'), updateQuote);
router.delete('/quotes/:id', auth(['admin']), deleteQuote);
router.patch('/quotes/:id/status', auth(['admin']), updateQuoteStatus);

// Route cho lịch trình
router.get('/schedules', auth(['admin', 'account', 'sales']), scheduleController.getSchedules);
router.post('/schedules', auth(['admin', 'account']), scheduleController.addSchedule);
router.put('/schedules/:id', auth(['admin', 'account']), scheduleController.updateSchedule);
router.delete('/schedules/:id', auth(['admin']), scheduleController.deleteSchedule);

// Route cho hóa đơn
router.get('/invoices', auth(['admin', 'account']), invoiceController.getInvoices);
router.post('/invoices', auth(['admin', 'account']), invoiceController.addInvoice);
router.put('/invoices/:id', auth(['admin', 'account']), invoiceController.updateInvoice);
router.delete('/invoices/:id', auth(['admin']), invoiceController.deleteInvoice);

// Route cho báo cáo
router.get('/reports', auth(['admin', 'account']), reportController.getReports);
router.post('/reports', auth(['admin', 'account']), reportController.addReport);
router.put('/reports/:id', auth(['admin', 'account']), reportController.updateReport);
router.delete('/reports/:id', auth(['admin']), reportController.deleteReport);

// Employee routes
router.post('/employees', auth(['admin']), employeeController.createEmployee);
router.get('/employees', auth(['admin']), employeeController.getEmployees);
router.put('/employees/:id', auth(['admin']), employeeController.updateEmployee);
router.delete('/employees/:id', auth(['admin']), employeeController.deleteEmployee);

// Equipment routes
router.post('/equipment', auth(['admin', 'engineering']), equipmentController.createEquipment);
router.get('/equipment', auth(['admin', 'engineering']), equipmentController.getEquipments);
router.put('/equipment/:id', auth(['admin', 'engineering']), equipmentController.updateEquipment);
router.delete('/equipment/:id', auth(['admin']), equipmentController.deleteEquipment);
router.post('/equipment/:id/maintenance', auth(['admin', 'engineering']), equipmentController.addMaintenance);

module.exports = router;