const JobRequest = require('../models/JobRequest');

// Tạo yêu cầu công việc mới
exports.createJobRequest = async (req, res) => {
    const newJobRequest = new JobRequest(req.body);
    try {
        await newJobRequest.save();
        res.status(201).json(newJobRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error adding job request' });
    }
};

// Lấy danh sách yêu cầu công việc
exports.getJobRequests = async (req, res) => {
    try {
        const jobRequests = await JobRequest.find();
        res.json(jobRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job requests' });
    }
};

// Thêm yêu cầu công việc
exports.addJobRequest = async (req, res) => {
    const newJobRequest = new JobRequest({
        customerId: req.user.id, // Giả sử bạn muốn lưu ID của người dùng
        title: req.body.title,
        description: req.body.description,
        // Thêm các trường khác nếu cần
    });

    try {
        await newJobRequest.save();
        res.status(201).json(newJobRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error adding job request' });
    }
};

// Cập nhật yêu cầu công việc
exports.updateJobRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedJobRequest = await JobRequest.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedJobRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error updating job request' });
    }
};

// Xóa yêu cầu công việc
exports.deleteJobRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await JobRequest.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting job request' });
    }
}; 