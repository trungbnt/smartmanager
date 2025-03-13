import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Notification from '../components/Notification';
import '../styles/pages.css';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

function Invoice() {
    const [invoices, setInvoices] = useState([]);
    const [formData, setFormData] = useState({
        quoteId: '',
        amount: '',
        dueDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [editData, setEditData] = useState({
        quoteId: '',
        amount: '',
        status: 'pending'
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [jobRequests, setJobRequests] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

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
    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/auth/invoices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvoices(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách hóa đơn', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification, API_URL]);

    const fetchCustomers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/auth/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách khách hàng', 'error');
        }
    }, [addNotification, API_URL]);

    const fetchQuotes = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/auth/quotes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuotes(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách báo giá', 'error');
        }
    }, [addNotification, API_URL]);

    const fetchJobRequests = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/auth/job-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobRequests(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách yêu cầu công việc', 'error');
        }
    }, [addNotification, API_URL]);

    useEffect(() => {
        fetchInvoices();
        fetchCustomers();
        fetchQuotes();
        fetchJobRequests();
    }, [fetchInvoices, fetchCustomers, fetchQuotes, fetchJobRequests]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            if (!formData.quoteId || !formData.amount || !formData.dueDate) {
                addNotification('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }
            
            // Kiểm tra nếu hạn thanh toán < ngày hiện tại
            const dueDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                const confirm = window.confirm(
                    'Hạn thanh toán nhỏ hơn ngày hiện tại. Hóa đơn sẽ được tạo với trạng thái "Quá hạn". Bạn có muốn tiếp tục?'
                );
                if (!confirm) {
                    setLoading(false);
                    return;
                }
            }
            
            // Tạo dữ liệu để gửi lên server
            const dataToSend = {
                quoteId: formData.quoteId,
                amount: formData.amount,
                customerId: formData.customerId,
                dueDate: formData.dueDate
            };
            
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/auth/invoices`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setFormData({
                quoteId: '',
                amount: '',
                dueDate: '',
                customerId: ''
            });
            
            setShowAddModal(false);
            await fetchInvoices();
            addNotification('Tạo hóa đơn thành công');
        } catch (err) {
            addNotification('Không thể tạo hóa đơn', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleQuoteChange = (quoteId) => {
        const selectedQuote = quotes.find(q => q._id === quoteId);
        if (selectedQuote) {
            // Tìm yêu cầu công việc tương ứng
            const jobRequest = jobRequests.find(req => req.requestId === selectedQuote.jobRequestId);
            
            // Tìm thông tin khách hàng từ yêu cầu công việc
            let customerId = null;
            if (jobRequest && jobRequest.customerId) {
                customerId = jobRequest.customerId;
                
                // Kiểm tra xem customerId có tồn tại trong danh sách khách hàng không
                const customerExists = customers.some(c => c._id === customerId);
                if (!customerExists) {
                    // Không cần log warning
                }
            }
            
            setFormData({
                ...formData,
                quoteId: quoteId,
                amount: selectedQuote.amount,
                customerId: customerId
            });
        } else {
            setFormData({
                ...formData,
                quoteId: quoteId,
                amount: '',
                customerId: ''
            });
        }
    };

    // Thêm hàm hiển thị trạng thái với màu sắc
    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: 'status-yellow',     // Chờ thanh toán - màu vàng
            paid: 'status-green',         // Đã thanh toán - màu xanh lá
            overdue: 'status-red',        // Quá hạn - màu đỏ
            cancelled: 'status-gray'      // Đã hủy - màu xám
        };
        
        const statusLabels = {
            pending: 'Chờ thanh toán',
            paid: 'Đã thanh toán',
            overdue: 'Quá hạn',
            cancelled: 'Đã hủy'
        };
        
        return (
            <span className={`status-badge ${statusClasses[status] || 'status-gray'}`}>
                {statusLabels[status] || status}
            </span>
        );
    };

    // Thêm hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Thêm hàm handleEdit
    const handleEdit = (invoice) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'account') {
            addNotification('Người dùng không có quyền chỉnh sửa', 'error');
            return;
        }
        
        setEditingId(invoice._id);
        setEditData({
            quoteId: invoice.quoteId,
            amount: invoice.amount,
            status: invoice.status || 'pending',
            dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : ''
        });
    };

    // Thêm hàm handleCancelEdit
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            quoteId: '',
            amount: '',
            status: 'pending',
            dueDate: ''
        });
    };

    // Thêm hàm handleSaveEdit
    const handleSaveEdit = async (id) => {
        try {
            setLoading(true);
            
            // Kiểm tra nếu hạn thanh toán < ngày hiện tại và trạng thái là pending
            if (editData.dueDate) {
                const dueDate = new Date(editData.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (dueDate < today && editData.status === 'pending') {
                    const confirm = window.confirm(
                        'Hạn thanh toán nhỏ hơn ngày hiện tại. Trạng thái sẽ được chuyển sang "Quá hạn". Bạn có muốn tiếp tục?'
                    );
                    if (confirm) {
                        editData.status = 'overdue';
                    } else {
                        setLoading(false);
                        return;
                    }
                }
            }
            
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/api/auth/invoices/${id}`,
                editData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data) {
                setEditingId(null);
                await fetchInvoices();
                addNotification('Cập nhật hóa đơn thành công');
            }
        } catch (err) {
            addNotification('Không thể cập nhật hóa đơn', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm handleDelete
    const handleDelete = (id) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin') {
            addNotification('Người dùng không có quyền xóa', 'error');
            return;
        }
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    // Thêm hàm confirmDelete
    const confirmDelete = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/auth/invoices/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            await fetchInvoices();
            addNotification('Xóa hóa đơn thành công');
        } catch (err) {
            addNotification('Không thể xóa hóa đơn', 'error');
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

            <h1 className="page-title">Hóa đơn</h1>
            
            <div className="table-header">
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary add-button">
                    + Tạo hóa đơn mới
                </button>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Tạo hóa đơn mới</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={() => setShowAddModal(false)}
                                title="Đóng"
                            />
                        </div>
                        <form onSubmit={handleSubmit} className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Báo giá:</label>
                                    <select 
                                        value={formData.quoteId}
                                        onChange={e => handleQuoteChange(e.target.value)}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Chọn báo giá</option>
                                        {quotes.map(quote => {
                                            // Tìm yêu cầu công việc tương ứng
                                            const jobRequest = jobRequests.find(req => req.requestId === quote.jobRequestId);
                                            
                                            return (
                                                <option key={quote._id} value={quote._id}>
                                                    {quote.quoteNumber || 'BG-' + quote._id.substring(0, 8)} - 
                                                    {jobRequest ? jobRequest.title : quote.jobRequestId} 
                                                    ({formatCurrency(quote.amount)})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tổng tiền:</label>
                                    <input 
                                        type="text"
                                        value={formData.amount ? formatCurrency(formData.amount) : ''}
                                        readOnly
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hạn thanh toán:</label>
                                    <input 
                                        type="date"
                                        value={formData.dueDate || ''}
                                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="button-group">
                                <button 
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Tạo hóa đơn'}
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

            <div className="table-container">
                {loading ? (
                    <p>Đang tải...</p>
                ) : invoices.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Mã hóa đơn</th>
                                <th>Khách hàng</th>
                                <th>Báo giá</th>
                                <th>Số tiền</th>
                                <th>Ngày tạo</th>
                                <th>Hạn thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => {
                                // Tìm thông tin khách hàng
                                const customer = customers.find(c => c._id === invoice.customerId);
                                // Tìm thông tin báo giá
                                const quote = quotes.find(q => q._id === invoice.quoteId);
                                
                                return (
                                    <tr key={invoice._id}>
                                        <td>{invoice.invoiceNumber || `HD-${invoice._id.substring(0, 8)}`}</td>
                                        <td>
                                            {customer ? customer.name : 
                                             (invoice.customerName || 
                                              (quote && quote.jobRequestId ? 
                                               (() => {
                                                   const jobRequest = jobRequests.find(req => req.requestId === quote.jobRequestId);
                                                   if (jobRequest) {
                                                       const customer = customers.find(c => c._id === jobRequest.customerId);
                                                       return customer ? customer.name : 'Khách hàng không xác định';
                                                   }
                                                   return 'Khách hàng không xác định';
                                               })() : 
                                               'Khách hàng không xác định')
                                             )
                                            }
                                        </td>
                                        <td>
                                            {quote ? 
                                             (quote.quoteNumber || `BG-${quote._id.substring(0, 8)}`) : 
                                             (invoice.quoteId ? `BG-${invoice.quoteId.substring(0, 8)}` : 'N/A')}
                                        </td>
                                        <td>{formatCurrency(invoice.amount)}</td>
                                        <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {invoice.dueDate ? 
                                             new Date(invoice.dueDate).toLocaleDateString('vi-VN') : 
                                             'Chưa thiết lập'}
                                        </td>
                                        <td>{getStatusBadge(invoice.status)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <FaEdit 
                                                    onClick={() => handleEdit(invoice)}
                                                    className="action-icon edit"
                                                    title="Sửa"
                                                />
                                                <FaTrash 
                                                    onClick={() => handleDelete(invoice._id)}
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
                ) : (
                    <p>Chưa có hóa đơn nào.</p>
                )}
            </div>

            {/* Edit Modal */}
            {editingId && (
                <div className="overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Chỉnh sửa hóa đơn</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={handleCancelEdit}
                                title="Đóng"
                            />
                        </div>
                        <form className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Trạng thái:</label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                                        className="form-select"
                                    >
                                        <option value="pending">Chờ thanh toán</option>
                                        <option value="paid">Đã thanh toán</option>
                                        <option value="overdue">Quá hạn</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Hạn thanh toán:</label>
                                    <input 
                                        type="date"
                                        value={editData.dueDate || ''}
                                        onChange={e => setEditData({...editData, dueDate: e.target.value})}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="button-group">
                                <button 
                                    type="button"
                                    onClick={() => handleSaveEdit(editingId)}
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Lưu'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="btn btn-secondary"
                                >
                                    Hủy
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
                        <p>Bạn có chắc chắn muốn xóa hóa đơn này không?</p>
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

export default Invoice;