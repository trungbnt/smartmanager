import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import Notification from '../components/Notification';
import '../styles/pages.css';

const STATUS_OPTIONS = {
    scheduled: 'Đã lên lịch',
    in_progress: 'Đang thực hiện',
    completed: 'Hoàn thành'
};

function Schedule() {
    const [schedules, setSchedules] = useState([]);
    const [formData, setFormData] = useState({
        jobRequestId: '',
        vehicleId: '',
        startTime: '',
        endTime: '',
        status: 'scheduled'
    });
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [jobRequests, setJobRequests] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        jobRequestId: '',
        vehicleId: '',
        startTime: '',
        endTime: '',
        status: 'scheduled'
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

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

    const fetchJobRequests = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/job-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobRequests(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách yêu cầu công việc', 'error');
        }
    }, [addNotification]);

    const fetchEquipment = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/equipment', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEquipment(response.data);
        } catch (err) {
            console.error('Error fetching equipment:', err);
            addNotification('Không thể tải danh sách thiết bị', 'error');
        }
    }, [addNotification]);

    useEffect(() => {
        fetchSchedules();
        fetchJobRequests();
        fetchEquipment();
    }, [fetchSchedules, fetchJobRequests, fetchEquipment]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            if (!formData.jobRequestId || !formData.vehicleId || !formData.startTime || !formData.endTime) {
                addNotification('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/schedules', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setFormData({
                jobRequestId: '',
                vehicleId: '',
                startTime: '',
                endTime: '',
                status: 'scheduled'
            });
            
            setShowAddModal(false);
            addNotification('Tạo lịch trình thành công!');
            await fetchSchedules();
        } catch (err) {
            addNotification('Không thể tạo lịch trình', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (schedule) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'account') {
            addNotification('Người dùng không có quyền chỉnh sửa', 'error');
            return;
        }
        
        setEditingId(schedule._id);
        setEditData({
            jobRequestId: schedule.jobRequestId,
            vehicleId: schedule.vehicleId,
            startTime: new Date(schedule.startTime).toISOString().slice(0, 16),
            endTime: new Date(schedule.endTime).toISOString().slice(0, 16),
            status: schedule.status || 'scheduled'
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            jobRequestId: '',
            vehicleId: '',
            startTime: '',
            endTime: '',
            status: 'scheduled'
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            setLoading(true);
            
            if (!editData.jobRequestId || !editData.vehicleId || !editData.startTime || !editData.endTime) {
                addNotification('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }

            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/auth/schedules/${id}`,
                editData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data) {
                setEditingId(null);
                await fetchSchedules();
                addNotification('Cập nhật lịch trình thành công');
            }
        } catch (err) {
            addNotification('Không thể cập nhật lịch trình', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin') {
            addNotification('Người dùng không có quyền xóa', 'error');
            return;
        }
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/auth/schedules/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            await fetchSchedules();
            addNotification('Xóa lịch trình thành công');
        } catch (err) {
            addNotification('Không thể xóa lịch trình', 'error');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    // Hàm hiển thị trạng thái với màu sắc đồng bộ với các trang khác
    const getStatusBadge = (status) => {
        const statusClasses = {
            scheduled: 'status-blue',
            in_progress: 'status-orange',
            completed: 'status-green'
        };
        
        return (
            <span className={`status-badge ${statusClasses[status] || 'status-gray'}`}>
                {STATUS_OPTIONS[status] || status}
            </span>
        );
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
            
            <div className="table-header">
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary add-button">
                    + Tạo lịch trình mới
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Yêu cầu công việc</th>
                            <th>Thiết bị</th>
                            <th>Thời gian bắt đầu</th>
                            <th>Thời gian kết thúc</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map(schedule => {
                            // Tìm thông tin thiết bị tương ứng
                            const equipmentItem = equipment.find(item => item._id === schedule.vehicleId);
                            // Tìm thông tin yêu cầu công việc tương ứng
                            const jobRequest = jobRequests.find(req => req._id === schedule.jobRequestId);
                            
                            return (
                                <tr key={schedule._id}>
                                    <td>
                                        {jobRequest ? `${jobRequest.requestId} - ${jobRequest.title}` : schedule.jobRequestId}
                                    </td>
                                    <td>
                                        {equipmentItem ? 
                                            `${equipmentItem.equipmentId} - ${equipmentItem.type} ${equipmentItem.model} (${equipmentItem.licensePlate})` 
                                            : schedule.vehicleId}
                                    </td>
                                    <td>{new Date(schedule.startTime).toLocaleString()}</td>
                                    <td>{new Date(schedule.endTime).toLocaleString()}</td>
                                    <td>{getStatusBadge(schedule.status)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <FaEdit 
                                                onClick={() => handleEdit(schedule)}
                                                className="action-icon edit"
                                                title="Sửa"
                                            />
                                            <FaTrash 
                                                onClick={() => handleDelete(schedule._id)}
                                                className="action-icon delete"
                                                title="Xóa"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Tạo lịch trình mới</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={() => setShowAddModal(false)}
                                title="Đóng"
                            />
                        </div>
                        <form className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Yêu cầu công việc:</label>
                                    <select 
                                        value={formData.jobRequestId}
                                        onChange={e => setFormData({...formData, jobRequestId: e.target.value})}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Chọn yêu cầu công việc</option>
                                        {jobRequests
                                            .filter(request => request.status === 'processing')
                                            .map(request => (
                                                <option key={request._id} value={request._id}>
                                                    {request.requestId} - {request.title}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Thiết bị:</label>
                                    <select 
                                        value={formData.vehicleId}
                                        onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Chọn thiết bị</option>
                                        {equipment
                                            .filter(item => {
                                                if (item.status !== 'available') return false;
                                                
                                                const registrationExpiry = item.registrationExpiry ? new Date(item.registrationExpiry) : null;
                                                if (registrationExpiry && registrationExpiry < new Date()) return false;
                                                
                                                const insuranceExpiry = item.insuranceExpiry ? new Date(item.insuranceExpiry) : null;
                                                if (insuranceExpiry && insuranceExpiry < new Date()) return false;
                                                
                                                return true;
                                            })
                                            .map(item => (
                                                <option key={item._id} value={item._id}>
                                                    {item.equipmentId} - {item.type} {item.model} ({item.licensePlate})
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
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
                            </div>

                            <div className="button-group">
                                <button 
                                    type="button"
                                    onClick={handleSubmit}
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Tạo lịch trình'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn btn-secondary"
                                >
                                    <FaTimes /> Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingId && (
                <div className="overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Chỉnh sửa lịch trình</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={handleCancelEdit}
                                title="Đóng"
                            />
                        </div>
                        <form className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Yêu cầu công việc:</label>
                                    <select 
                                        value={editData.jobRequestId}
                                        onChange={e => setEditData({...editData, jobRequestId: e.target.value})}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Chọn yêu cầu công việc</option>
                                        {jobRequests
                                            .filter(request => request.status === 'processing')
                                            .map(request => (
                                                <option key={request._id} value={request._id}>
                                                    {request.requestId} - {request.title}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Thiết bị:</label>
                                    <select 
                                        value={editData.vehicleId}
                                        onChange={e => setEditData({...editData, vehicleId: e.target.value})}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Chọn thiết bị</option>
                                        {equipment
                                            .filter(item => {
                                                if (item.status !== 'available') return false;
                                                
                                                const registrationExpiry = item.registrationExpiry ? new Date(item.registrationExpiry) : null;
                                                if (registrationExpiry && registrationExpiry < new Date()) return false;
                                                
                                                const insuranceExpiry = item.insuranceExpiry ? new Date(item.insuranceExpiry) : null;
                                                if (insuranceExpiry && insuranceExpiry < new Date()) return false;
                                                
                                                return true;
                                            })
                                            .map(item => (
                                                <option key={item._id} value={item._id}>
                                                    {item.equipmentId} - {item.type} {item.model} ({item.licensePlate})
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Thời gian bắt đầu:</label>
                                    <input 
                                        type="datetime-local"
                                        value={editData.startTime}
                                        onChange={e => setEditData({...editData, startTime: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Thời gian kết thúc:</label>
                                    <input 
                                        type="datetime-local"
                                        value={editData.endTime}
                                        onChange={e => setEditData({...editData, endTime: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Trạng thái:</label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                                        className="form-select"
                                    >
                                        {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="button-group">
                                <button 
                                    type="button"
                                    onClick={() => handleSaveEdit(editingId)}
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : <><FaSave /> Lưu</>}
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="btn btn-secondary"
                                >
                                    <FaTimes /> Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="overlay">
                    <div className="popup">
                        <h3>Xác nhận xóa</h3>
                        <p>Bạn có chắc chắn muốn xóa lịch trình này không?</p>
                        <div className="button-group">
                            <button 
                                onClick={confirmDelete}
                                className="btn btn-danger"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Xóa'}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteId(null);
                                }}
                                className="btn btn-secondary"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Schedule;