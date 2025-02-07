const Schedule = require('../models/Schedule');

// Tạo lịch trình mới
exports.createSchedule = async (req, res) => {
    try {
        const { jobRequestId, vehicleId, startTime, endTime } = req.body;
        const schedule = new Schedule({ jobRequestId, vehicleId, startTime, endTime });
        await schedule.save();
        res.status(201).send(schedule);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách lịch trình
exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find().populate('jobRequestId');
        res.status(200).send(schedules);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Cập nhật trạng thái lịch trình
exports.updateScheduleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const schedule = await Schedule.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).send(schedule);
    } catch (error) {
        res.status(400).send(error);
    }
}; 