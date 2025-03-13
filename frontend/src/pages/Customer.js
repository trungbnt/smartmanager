import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import '../styles/pages.css';

const isValidPhoneNumber = (phone) => {
    // Validate Vietnamese phone numbers
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
};

function Customer() {
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [phoneError, setPhoneError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/auth/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách khách hàng', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification, API_URL]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isValidPhoneNumber(formData.phone)) {
            addNotification('Số điện thoại không hợp lệ', 'error');
            setPhoneError('Vui lòng nhập số điện thoại hợp lệ');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/auth/customers`, 
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: ''
            });
            setShowAddModal(false);
            addNotification('Thêm khách hàng thành công');
            await fetchCustomers();
        } catch (err) {
            addNotification('Không thể thêm khách hàng mới', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (customer) => {
        setEditingId(customer._id);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address
        });
    };

    const handleSave = async (id) => {
        if (!isValidPhoneNumber(formData.phone)) {
            addNotification('Số điện thoại không hợp lệ', 'error');
            setPhoneError('Vui lòng nhập số điện thoại hợp lệ');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/auth/customers/${id}`, 
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setEditingId(null);
            addNotification('Cập nhật thành công');
            await fetchCustomers();
        } catch (err) {
            addNotification('Không thể cập nhật thông tin khách hàng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const numbersOnly = value.replace(/[^\d]/g, '');
        
        setFormData(prev => ({...prev, phone: numbersOnly}));
        
        if (numbersOnly && !isValidPhoneNumber(numbersOnly)) {
            setPhoneError('Vui lòng nhập số điện thoại hợp lệ');
        } else {
            setPhoneError('');
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
            await axios.delete(`${API_URL}/api/auth/customers/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            await fetchCustomers();
            addNotification('Xóa khách hàng thành công');
        } catch (err) {
            addNotification('Không thể xóa khách hàng', 'error');
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
                    <div key={note.id} className={`notification ${note.type}`}>
                        {note.message}
                    </div>
                ))}
            </div>

            <h1 className="page-title">Danh sách khách hàng</h1>

            <div className="table-header">
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary add-button">
                    + Thêm khách hàng
                </button>
            </div>

            <div className="table-container">
                {loading ? (
                    <p>Đang tải...</p>
                ) : customers.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Địa chỉ</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer._id}>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.address}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <FaEdit
                                                className="action-icon edit"
                                                onClick={() => handleEdit(customer)}
                                                title="Sửa"
                                            />
                                            <FaTrash
                                                className="action-icon delete"
                                                onClick={() => handleDelete(customer._id)}
                                                title="Xóa"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa có khách hàng nào.</p>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="overlay">
                    <div className="modal">
                        <h3>Thêm khách hàng mới</h3>
                        <form onSubmit={handleSubmit} className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tên:</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số điện thoại:</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        required
                                        className={phoneError ? 'input-error' : ''}
                                    />
                                    {phoneError && <span className="error-message">{phoneError}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Địa chỉ:</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="button-group">
                                <button 
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading || phoneError}
                                >
                                    {loading ? 'Đang xử lý...' : <><FaSave /> Lưu</>}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setPhoneError('');
                                    }}
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
                        <h3>Chỉnh sửa thông tin khách hàng</h3>
                        <form className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tên:</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số điện thoại:</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        required
                                        className={phoneError ? 'input-error' : ''}
                                    />
                                    {phoneError && <span className="error-message">{phoneError}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Địa chỉ:</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="button-group">
                                <button 
                                    type="button"
                                    onClick={() => handleSave(editingId)}
                                    className="btn btn-primary"
                                    disabled={loading || phoneError}
                                >
                                    {loading ? 'Đang xử lý...' : <><FaSave /> Lưu</>}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setPhoneError('');
                                    }}
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
                        <p>Bạn có chắc chắn muốn xóa khách hàng này không?</p>
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

export default Customer;