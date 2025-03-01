import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import Notification from '../components/Notification';
import '../styles/pages.css';

const STATUS_OPTIONS = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
};

const generateRandomId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = '';
    
    // Generate 7 random letters
    for (let i = 0; i < 7; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Generate 7 random numbers
    for (let i = 0; i < 7; i++) {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return result;
};

const isIdUnique = (id, existingRequests) => {
    return !existingRequests.some(request => request.requestId === id);
};

function JobRequest() {
    const [jobRequests, setJobRequests] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ 
        title: '', 
        description: '', 
        status: 'pending' 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchJobRequests();
    }, []);

    const fetchJobRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/job-requests', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setJobRequests(response.data);
        } catch (err) {
            setError('Không thể tải danh sách yêu cầu');
        }
    };

    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeNotification(id);
        }, 5000); // Auto remove after 5 seconds
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(note => note.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Generate unique ID
            let newRequestId;
            do {
                newRequestId = generateRandomId();
            } while (!isIdUnique(newRequestId, jobRequests));

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/job-requests', 
                { 
                    title, 
                    description,
                    requestId: newRequestId 
                }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setTitle('');
            setDescription('');
            await fetchJobRequests();
            addNotification('Tạo yêu cầu thành công');
        } catch (err) {
            addNotification('Không thể tạo yêu cầu mới', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (request) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'account') {
            setMessage('Người dùng không có quyền chỉnh sửa');
            setShowPopup(true);
            return;
        }
        setEditingId(request._id);
        setEditData({
            title: request.title,
            description: request.description,
            status: request.status || 'pending'
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ title: '', description: '', status: 'pending' });
    };

    const handleSaveEdit = async (id) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/auth/job-requests/${id}`, 
                editData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            await fetchJobRequests();
            setEditingId(null);
            setEditData({ title: '', description: '', status: 'pending' });
            addNotification('Cập nhật thành công');
        } catch (err) {
            addNotification('Không thể cập nhật yêu cầu công việc', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'account') {
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
            await axios.delete(`http://localhost:5000/api/auth/job-requests/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            await fetchJobRequests();
            addNotification('Xóa yêu cầu thành công');
        } catch (err) {
            addNotification('Không thể xóa yêu cầu', 'error');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setDeleteId(null);
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

            <h1 className="page-title">Yêu cầu công việc</h1>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>Tiêu đề:</label>
                    <input 
                        type="text" 
                        placeholder="Tiêu đề" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Mô tả:</label>
                    <textarea 
                        placeholder="Mô tả" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                </button>
            </form>

            <div className="table-container">
                <h2>Danh sách yêu cầu công việc</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID Yêu cầu</th>
                            <th>Tiêu đề</th>
                            <th>Mô tả</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobRequests.map(request => (
                            <tr key={request._id}>
                                <td className="request-id">
                                    {request.requestId || 'N/A'}
                                </td>
                                <td>
                                    {editingId === request._id ? (
                                        <input
                                            type="text"
                                            value={editData.title}
                                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                                        />
                                    ) : (
                                        request.title
                                    )}
                                </td>
                                <td>
                                    {editingId === request._id ? (
                                        <textarea
                                            value={editData.description}
                                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                                        />
                                    ) : (
                                        request.description
                                    )}
                                </td>
                                <td>
                                    {editingId === request._id ? (
                                        <select
                                            value={editData.status}
                                            onChange={(e) => setEditData({...editData, status: e.target.value})}
                                            className="status-select"
                                        >
                                            {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className={`status-badge status-${request.status}`}>
                                            {STATUS_OPTIONS[request.status] || STATUS_OPTIONS.pending}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {editingId === request._id ? (
                                        <>
                                            <FaSave 
                                                onClick={() => handleSaveEdit(request._id)}
                                                className="action-icon save"
                                                title="Lưu"
                                            />
                                            <FaTimes
                                                onClick={handleCancelEdit}
                                                className="action-icon cancel"
                                                title="Hủy"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <FaEdit 
                                                onClick={() => handleEdit(request)}
                                                className="action-icon edit"
                                                title="Sửa"
                                            />
                                            <FaTrash 
                                                onClick={() => handleDelete(request._id)}
                                                className="action-icon delete"
                                                title="Xóa"
                                            />
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showDeleteConfirm && (
                <div className="overlay">
                    <div className="popup">
                        <h3>Xác nhận xóa</h3>
                        <p>Bạn có chắc chắn muốn xóa yêu cầu này không?</p>
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

            {showPopup && (
                <div className="overlay">
                    <div className="popup">
                        <p>{message}</p>
                        <button 
                            onClick={() => setShowPopup(false)}
                            className="btn"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobRequest;