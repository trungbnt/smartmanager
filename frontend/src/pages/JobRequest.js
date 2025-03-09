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
        status: 'pending',
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');

    useEffect(() => {
        fetchJobRequests();
        fetchCustomers();
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

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/customers', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCustomers(response.data);
        } catch (err) {
            console.error('Error fetching customers:', err);
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
            
            if (!selectedCustomer) {
                addNotification('Vui lòng chọn khách hàng', 'error');
                return;
            }

            if (!title.trim() || !description.trim()) {
                addNotification('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }

            // Get customer data
            const selectedCustomerData = customers.find(c => c._id === selectedCustomer);
            if (!selectedCustomerData) {
                addNotification('Không tìm thấy thông tin khách hàng', 'error');
                return;
            }

            let newRequestId;
            do {
                newRequestId = generateRandomId();
            } while (!isIdUnique(newRequestId, jobRequests));

            const token = localStorage.getItem('token');
            const requestData = { 
                title: title.trim(), 
                description: description.trim(),
                requestId: newRequestId,
                customerId: selectedCustomer,
                customerName: selectedCustomerData.name,
                customerEmail: selectedCustomerData.email,
                customerPhone: selectedCustomerData.phone
            };

            console.log('Sending request:', requestData);
            
            const response = await axios.post(
                'http://localhost:5000/api/auth/job-requests', 
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Response:', response.data);

            if (response.data) {
                setTitle('');
                setDescription('');
                setSelectedCustomer('');
                setShowAddModal(false);
                await fetchJobRequests();
                addNotification('Tạo yêu cầu thành công');
            }
        } catch (err) {
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            addNotification(
                err.response?.data?.message || 'Không thể tạo yêu cầu mới', 
                'error'
            );
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
        setSelectedCustomer(request.customerId);
        setEditData({
            title: request.title,
            description: request.description,
            status: request.status || 'pending',
            customerId: request.customerId,
            customerName: request.customerName,
            customerEmail: request.customerEmail,
            customerPhone: request.customerPhone
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ title: '', description: '', status: 'pending', customerId: '', customerName: '', customerEmail: '', customerPhone: '' });
    };

    const handleSaveEdit = async (id) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Đảm bảo có đầy đủ thông tin khách hàng
            if (!editData.customerId || !editData.title || !editData.description) {
                addNotification('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }
            
            // Tìm thông tin khách hàng từ danh sách customers
            const customer = customers.find(c => c._id === editData.customerId);
            if (!customer) {
                addNotification('Không tìm thấy thông tin khách hàng', 'error');
                return;
            }
            
            // Chuẩn bị dữ liệu để gửi lên server
            const updateData = {
                ...editData,
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone
            };
            
            // Gửi yêu cầu cập nhật
            const response = await axios.put(
                `http://localhost:5000/api/auth/job-requests/${id}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Xử lý kết quả
            if (response.data) {
                setEditingId(null);
                await fetchJobRequests();
                addNotification('Cập nhật yêu cầu thành công');
            }
        } catch (err) {
            addNotification('Không thể cập nhật yêu cầu', 'error');
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

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: 'status-yellow',     // Chờ xử lý - màu vàng
            processing: 'status-blue',    // Đang xử lý - màu xanh dương
            completed: 'status-green',    // Hoàn thành - màu xanh lá
            cancelled: 'status-red'       // Đã hủy - màu đỏ
        };
        
        const statusLabels = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };
        
        return (
            <span className={`status-badge ${statusClasses[status] || 'status-gray'}`}>
                {statusLabels[status] || status}
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

            <h1 className="page-title">Yêu cầu công việc</h1>
            
            {error && <div className="error-message">{error}</div>}

            <div className="table-header">
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary add-button">
                    + Gửi yêu cầu
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID Yêu cầu</th>
                            <th>Khách hàng</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Tiêu đề</th>
                            <th>Mô tả</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobRequests.map(request => {
                            const customer = customers.find(c => c._id === request.customerId);
                            return (
                                <tr key={request._id}>
                                    <td className="request-id">{request.requestId || 'N/A'}</td>
                                    <td>{customer?.name || request.customerName || 'N/A'}</td>
                                    <td>{customer?.email || request.customerEmail || 'N/A'}</td>
                                    <td>{customer?.phone || request.customerPhone || 'N/A'}</td>
                                    <td>{request.title}</td>
                                    <td>{request.description}</td>
                                    <td>
                                        {getStatusBadge(request.status)}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
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
                            <h3>Gửi yêu cầu mới</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={() => setShowAddModal(false)}
                                title="Đóng"
                            />
                        </div>
                        <form onSubmit={handleSubmit} className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Khách hàng:</label>
                                    <select 
                                        value={selectedCustomer}
                                        onChange={(e) => {
                                            setSelectedCustomer(e.target.value);
                                            const customer = customers.find(c => c._id === e.target.value);
                                            if (customer) {
                                                setEditData(prev => ({
                                                    ...prev,
                                                    customerEmail: customer.email,
                                                    customerPhone: customer.phone
                                                }));
                                            }
                                        }}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Chọn khách hàng</option>
                                        {customers.map(customer => (
                                            <option key={customer._id} value={customer._id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email khách hàng:</label>
                                    <input
                                        type="email"
                                        value={selectedCustomer ? customers.find(c => c._id === selectedCustomer)?.email || '' : ''}
                                        disabled
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại khách hàng:</label>
                                    <input
                                        type="text"
                                        value={selectedCustomer ? customers.find(c => c._id === selectedCustomer)?.phone || '' : ''}
                                        disabled
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tiêu đề:</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mô tả:</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="button-group">
                                <button 
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : <><FaSave /> Lưu</>}
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
                            <h3>Chỉnh sửa yêu cầu</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={handleCancelEdit}
                                title="Đóng"
                            />
                        </div>
                        <form className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Khách hàng:</label>
                                    <select 
                                        value={editData.customerId}
                                        onChange={(e) => {
                                            const customer = customers.find(c => c._id === e.target.value);
                                            setEditData({
                                                ...editData,
                                                customerId: e.target.value,
                                                customerEmail: customer?.email || '',
                                                customerPhone: customer?.phone || ''
                                            });
                                        }}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Chọn khách hàng</option>
                                        {customers.map(customer => (
                                            <option key={customer._id} value={customer._id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email khách hàng:</label>
                                    <input
                                        type="email"
                                        value={editData.customerEmail || ''}
                                        disabled
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại khách hàng:</label>
                                    <input
                                        type="text"
                                        value={editData.customerPhone || ''}
                                        disabled
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            {/* Existing fields */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tiêu đề:</label>
                                    <input
                                        type="text"
                                        value={editData.title}
                                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mô tả:</label>
                                    <textarea
                                        value={editData.description}
                                        onChange={(e) => setEditData({...editData, description: e.target.value})}
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
                                        className="status-select"
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