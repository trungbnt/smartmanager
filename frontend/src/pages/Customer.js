import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import Notification from '../components/Notification';
import '../styles/pages.css';

const isValidPhoneNumber = (phone) => {
    // Validate Vietnamese phone numbers
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
};

function Customer() {
    const [customers, setCustomers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
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

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/customers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách khách hàng', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Add phone validation before submission
        if (!isValidPhoneNumber(phone)) {
            addNotification('Số điện thoại không hợp lệ', 'error');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/customers', 
                { name, email, phone, address },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setName('');
            setEmail('');
            setPhone('');
            setAddress('');
            addNotification('Thêm khách hàng thành công');
            await fetchCustomers();
        } catch (err) {
            addNotification('Không thể thêm khách hàng mới', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (customer) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'account') {
            addNotification('Người dùng không có quyền chỉnh sửa', 'error');
            return;
        }
        setEditingId(customer._id);
        setEditData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ name: '', email: '', phone: '', address: '' });
    };

    const handleSaveEdit = async (id) => {
        // Add phone validation before saving edit
        if (!isValidPhoneNumber(editData.phone)) {
            addNotification('Số điện thoại không hợp lệ', 'error');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/auth/customers/${id}`, 
                editData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            await fetchCustomers();
            setEditingId(null);
            setEditData({ name: '', email: '', phone: '', address: '' });
            addNotification('Cập nhật thành công');
        } catch (err) {
            addNotification('Không thể cập nhật thông tin khách hàng', 'error');
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
            await axios.delete(`http://localhost:5000/api/auth/customers/${deleteId}`, {
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
                    <Notification
                        key={note.id}
                        message={note.message}
                        type={note.type}
                        onClose={() => removeNotification(note.id)}
                    />
                ))}
            </div>

            <h1 className="page-title">Quản lý Khách hàng</h1>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>Tên:</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Số điện thoại:</label>
                    <input 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        pattern="(84|0[3|5|7|8|9])+([0-9]{8})\b"
                        title="Vui lòng nhập số điện thoại hợp lệ (VD: 0912345678)"
                        required 
                    />
                    <small className="form-text">
                        Định dạng: 10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc 84
                    </small>
                </div>

                <div className="form-group">
                    <label>Địa chỉ:</label>
                    <input 
                        type="text" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        required 
                    />
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Thêm Khách hàng'}
                </button>
            </form>

            <div className="table-container">
                <h2>Danh sách Khách hàng</h2>
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
                                    <td>
                                        {editingId === customer._id ? (
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                            />
                                        ) : (
                                            customer.name
                                        )}
                                    </td>
                                    <td>
                                        {editingId === customer._id ? (
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => setEditData({...editData, email: e.target.value})}
                                            />
                                        ) : (
                                            customer.email
                                        )}
                                    </td>
                                    <td>
                                        {editingId === customer._id ? (
                                            <input
                                                type="tel"
                                                value={editData.phone}
                                                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                                pattern="(84|0[3|5|7|8|9])+([0-9]{8})\b"
                                                title="Vui lòng nhập số điện thoại hợp lệ (VD: 0912345678)"
                                            />
                                        ) : (
                                            customer.phone
                                        )}
                                    </td>
                                    <td>
                                        {editingId === customer._id ? (
                                            <input
                                                type="text"
                                                value={editData.address}
                                                onChange={(e) => setEditData({...editData, address: e.target.value})}
                                            />
                                        ) : (
                                            customer.address
                                        )}
                                    </td>
                                    <td>
                                        {editingId === customer._id ? (
                                            <>
                                                <FaSave 
                                                    onClick={() => handleSaveEdit(customer._id)}
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
                                                    onClick={() => handleEdit(customer)}
                                                    className="action-icon edit"
                                                    title="Sửa"
                                                />
                                                <FaTrash 
                                                    onClick={() => handleDelete(customer._id)}
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
                ) : (
                    <p>Chưa có khách hàng nào.</p>
                )}
            </div>

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