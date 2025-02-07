const JobRequest = require('../models/JobRequest');

// Tạo yêu cầu công việc mới
exports.createJobRequest = async (req, res) => {
    try {
        const jobRequest = new JobRequest({
            customerId: req.user.id,
            title: req.body.title,
            description: req.body.description
        });
        await jobRequest.save();
        res.status(201).send(jobRequest);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách yêu cầu công việc của khách hàng
exports.getJobRequests = async (req, res) => {
    try {
        const jobRequests = await JobRequest.find({ customerId: req.user.id });
        res.status(200).send(jobRequests);
    } catch (error) {
        res.status(500).send(error);
    }
}; 