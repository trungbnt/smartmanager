const Report = require('../models/Report');

// Tạo báo cáo mới
exports.createReport = async (req, res) => {
    try {
        const { month, year, totalRevenue, totalExpenses, totalJobs } = req.body;
        const report = new Report({ month, year, totalRevenue, totalExpenses, totalJobs });
        await report.save();
        res.status(201).send(report);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách báo cáo
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).send(reports);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Cập nhật báo cáo
exports.updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).send(report);
    } catch (error) {
        res.status(400).send(error);
    }
}; 