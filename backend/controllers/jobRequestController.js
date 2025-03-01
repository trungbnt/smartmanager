const JobRequest = require('../models/JobRequest');

// Tạo yêu cầu công việc mới
const createJobRequest = async (req, res) => {
    const newJobRequest = new JobRequest(req.body);
    try {
        await newJobRequest.save();
        res.status(201).json(newJobRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error adding job request' });
    }
};

// Lấy danh sách yêu cầu công việc
const getJobRequests = async (req, res) => {
    try {
        const jobRequests = await JobRequest.find();
        res.json(jobRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job requests' });
    }
};

// Thêm yêu cầu công việc
const addJobRequest = async (req, res) => {
    const newJobRequest = new JobRequest({
        customerId: req.user.id,
        title: req.body.title,
        description: req.body.description,
        requestId: req.body.requestId // Add this line for the new requestId field
    });

    try {
        await newJobRequest.save();
        res.status(201).json(newJobRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error adding job request' });
    }
};

// Cập nhật yêu cầu công việc
const updateJobRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        
        const jobRequest = await JobRequest.findById(id);
        
        if (!jobRequest) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu công việc' });
        }

        // Kiểm tra quyền cập nhật
        const userRole = req.user.role;
        if (userRole !== 'admin' && userRole !== 'account' && req.user.id !== jobRequest.customerId.toString()) {
            return res.status(403).json({ message: 'Không có quyền cập nhật' });
        }

        // Cập nhật thông tin
        jobRequest.title = title;
        jobRequest.description = description;
        jobRequest.status = status;

        await jobRequest.save();
        res.json(jobRequest);
    } catch (error) {
        console.error('Error updating job request:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa yêu cầu công việc
const deleteJobRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await JobRequest.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting job request' });
    }
};

// Export all functions
module.exports = {
    createJobRequest,
    getJobRequests,
    addJobRequest,
    updateJobRequest,
    deleteJobRequest
};