import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Notification from '../components/Notification';
import '../styles/pages.css';

function Schedule() {
    const [schedules, setSchedules] = useState([]);
    const [formData, setFormData] = useState({
        jobRequestId: '',
        vehicleId: '',
        startTime: '',
        endTime: ''
    });
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

    const fetchSchedules = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/schedules', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchedules(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách lịch trình', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/schedules', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({ jobRequestId: '', vehicleId: '', startTime: '', endTime: '' });
            addNotification('Tạo lịch trình thành công!');
            await fetchSchedules();
        } catch (err) {
            addNotification('Không thể tạo lịch trình', 'error');
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

            <h1 className="page-title">Lịch trình</h1>
            
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>ID Yêu cầu công việc:</label>
                    <input 
                        type="text"
                        value={formData.jobRequestId}
                        onChange={e => setFormData({...formData, jobRequestId: e.target.value})}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>ID Phương tiện:</label>
                    <input 
                        type="text"
                        value={formData.vehicleId}
                        onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Thời gian bắt đầu:</label>
                    <input 
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Thời gian kết thúc:</label>
                    <input 
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={e => setFormData({...formData, endTime: e.target.value})}
                        required 
                    />
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Tạo lịch trình'}
                </button>
            </form>

            <div className="table-container">
                <h2>Danh sách lịch trình</h2>
                {loading ? (
                    <p>Đang tải...</p>
                ) : schedules.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ID Yêu cầu</th>
                                <th>ID Phương tiện</th>
                                <th>Thời gian bắt đầu</th>
                                <th>Thời gian kết thúc</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map(schedule => (
                                <tr key={schedule._id}>
                                    <td>{schedule.jobRequestId}</td>
                                    <td>{schedule.vehicleId}</td>
                                    <td>{new Date(schedule.startTime).toLocaleString()}</td>
                                    <td>{new Date(schedule.endTime).toLocaleString()}</td>
                                    <td>{schedule.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa có lịch trình nào.</p>
                )}
            </div>
        </div>
    );
}

export default Schedule;