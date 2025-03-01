const express = require('express');
const router = express.Router();
const jobRequestController = require('../controllers/jobRequestController');
const auth = require('../middleware/auth');

// Đăng ký các route cho yêu cầu công việc
router.post('/', auth(['admin', 'account', 'customer']), jobRequestController.createJobRequest);
router.get('/', auth(['admin', 'account', 'sales', 'customer']), jobRequestController.getJobRequests);
router.put('/:id', auth(['admin', 'account']), jobRequestController.updateJobRequest);
router.delete('/:id', auth(['admin']), jobRequestController.deleteJobRequest);

module.exports = router; 