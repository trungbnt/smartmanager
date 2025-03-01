import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Notification from '../components/Notification';
import '../styles/pages.css';

function Report() {
    const [reports, setReports] = useState([]);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalJobs, setTotalJobs] = useState(0);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(note => note.id !== id));
    }, []);

    const addNotification = useCallback((message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    }, [removeNotification]);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/reports', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setReports(response.data);
        } catch (err) {
            addNotification('Không thể tải báo cáo. Vui lòng thử lại sau.', 'error');
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/reports', 
                { 
                    month, 
                    year, 
                    totalRevenue, 
                    totalExpenses, 
                    totalJobs 
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Reset form
            setMonth('');
            setYear('');
            setTotalRevenue(0);
            setTotalExpenses(0);
            setTotalJobs(0);
            
            // Fetch updated reports
            await fetchReports();
            addNotification('Tạo báo cáo thành công!');
        } catch (err) {
            addNotification('Không thể tạo báo cáo. Vui lòng thử lại sau.', 'error');
            console.error('Error creating report:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="notifications-container">
                {notifications.map(note => (
                    <Notification
                        key={note.id}
                        message={note.message}
                        type={note.type}
                        onClose={() => removeNotification(note.id)}
                    />
                ))}
            </div>

            <h1 className="page-title">Báo cáo</h1>
            
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>Tháng:</label>
                    <input 
                        type="number" 
                        min="1" 
                        max="12"
                        placeholder="Tháng" 
                        value={month} 
                        onChange={(e) => setMonth(e.target.value)}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Năm:</label>
                    <input 
                        type="number"
                        min="2000"
                        max="2100"
                        placeholder="Năm" 
                        value={year} 
                        onChange={(e) => setYear(e.target.value)}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Doanh thu:</label>
                    <input 
                        type="number"
                        min="0"
                        placeholder="Doanh thu" 
                        value={totalRevenue} 
                        onChange={(e) => setTotalRevenue(Number(e.target.value))}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Chi phí:</label>
                    <input 
                        type="number"
                        min="0"
                        placeholder="Chi phí" 
                        value={totalExpenses} 
                        onChange={(e) => setTotalExpenses(Number(e.target.value))}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Số lượng công việc:</label>
                    <input 
                        type="number"
                        min="0"
                        placeholder="Số lượng công việc" 
                        value={totalJobs} 
                        onChange={(e) => setTotalJobs(Number(e.target.value))}
                        required 
                    />
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Tạo báo cáo'}
                </button>
            </form>

            <div className="table-container">
                <h2>Danh sách báo cáo</h2>
                {loading ? (
                    <p>Đang tải...</p>
                ) : reports.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Tháng</th>
                                <th>Năm</th>
                                <th>Doanh thu</th>
                                <th>Chi phí</th>
                                <th>Số công việc</th>
                                <th>Lợi nhuận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report._id}>
                                    <td>{report.month}</td>
                                    <td>{report.year}</td>
                                    <td>{report.totalRevenue.toLocaleString()} VNĐ</td>
                                    <td>{report.totalExpenses.toLocaleString()} VNĐ</td>
                                    <td>{report.totalJobs}</td>
                                    <td>{(report.totalRevenue - report.totalExpenses).toLocaleString()} VNĐ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa có báo cáo nào.</p>
                )}
            </div>
        </div>
    );
}

export default Report;