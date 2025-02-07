import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Report() {
    const [reports, setReports] = useState([]);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalJobs, setTotalJobs] = useState(0);

    useEffect(() => {
        const fetchReports = async () => {
            const response = await axios.get('/api/reports');
            setReports(response.data);
        };
        fetchReports();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/reports', { month, year, totalRevenue, totalExpenses, totalJobs });
        setMonth('');
        setYear('');
        setTotalRevenue(0);
        setTotalExpenses(0);
        setTotalJobs(0);
        // Cập nhật lại danh sách báo cáo
        const response = await axios.get('/api/reports');
        setReports(response.data);
    };

    return (
        <div>
            <h1>Báo cáo</h1>
            <form onSubmit={handleSubmit}>
                <input type="number" placeholder="Tháng" value={month} onChange={(e) => setMonth(e.target.value)} required />
                <input type="number" placeholder="Năm" value={year} onChange={(e) => setYear(e.target.value)} required />
                <input type="number" placeholder="Doanh thu" value={totalRevenue} onChange={(e) => setTotalRevenue(e.target.value)} required />
                <input type="number" placeholder="Chi phí" value={totalExpenses} onChange={(e) => setTotalExpenses(e.target.value)} required />
                <input type="number" placeholder="Số lượng công việc" value={totalJobs} onChange={(e) => setTotalJobs(e.target.value)} required />
                <button type="submit">Tạo báo cáo</button>
            </form>
            <h2>Danh sách báo cáo</h2>
            <ul>
                {reports.map(report => (
                    <li key={report._id}>Tháng: {report.month}, Năm: {report.year}, Doanh thu: {report.totalRevenue}, Chi phí: {report.totalExpenses}, Công việc: {report.totalJobs}</li>
                ))}
            </ul>
        </div>
    );
}

export default Report; 