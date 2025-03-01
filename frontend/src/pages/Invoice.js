import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Notification from '../components/Notification';
import '../styles/pages.css';

function Invoice() {
    const [invoices, setInvoices] = useState([]);
    const [formData, setFormData] = useState({
        quoteId: '',
        amount: ''
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

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/invoices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvoices(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách hóa đơn', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/invoices', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({ quoteId: '', amount: '' });
            await fetchInvoices();
            addNotification('Tạo hóa đơn thành công');
        } catch (err) {
            addNotification('Không thể tạo hóa đơn', 'error');
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

            <h1 className="page-title">Hóa đơn</h1>
            
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>ID báo giá:</label>
                    <input 
                        type="text"
                        value={formData.quoteId}
                        onChange={e => setFormData({...formData, quoteId: e.target.value})}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Số tiền:</label>
                    <input 
                        type="number"
                        min="0"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: e.target.value})}
                        required 
                    />
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Tạo hóa đơn'}
                </button>
            </form>

            <div className="table-container">
                <h2>Danh sách hóa đơn</h2>
                {loading ? (
                    <p>Đang tải...</p>
                ) : invoices.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ID Báo giá</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => (
                                <tr key={invoice._id}>
                                    <td>{invoice.quoteId}</td>
                                    <td>{invoice.amount.toLocaleString()} VNĐ</td>
                                    <td>{invoice.status}</td>
                                    <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa có hóa đơn nào.</p>
                )}
            </div>
        </div>
    );
}

export default Invoice;