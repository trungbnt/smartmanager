const express = require('express');
const router = express.Router();
const jobRequestController = require('../controllers/jobRequestController');
const auth = require('../middleware/auth');

// Đăng ký các route cho yêu cầu công việc
router.post('/', auth(['customer']), jobRequestController.createJobRequest);
router.get('/', auth(['customer']), jobRequestController.getJobRequests);

module.exports = router; 