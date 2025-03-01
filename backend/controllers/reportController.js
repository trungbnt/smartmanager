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
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports' });
    }
};

// Thêm báo cáo
exports.addReport = async (req, res) => {
    const newReport = new Report(req.body);
    try {
        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        res.status(400).json({ message: 'Error adding report' });
    }
};

// Cập nhật báo cáo
exports.updateReport = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedReport = await Report.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedReport);
    } catch (error) {
        res.status(400).json({ message: 'Error updating report' });
    }
};

// Xóa báo cáo
exports.deleteReport = async (req, res) => {
    const { id } = req.params;
    try {
        await Report.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting report' });
    }
}; 