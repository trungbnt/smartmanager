import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import Notification from '../components/Notification';
import '../styles/pages.css';

function Quote() {
    const [quotes, setQuotes] = useState([]);
    const [formData, setFormData] = useState({
        jobRequestId: '',
        amount: '',
        details: '',
        file: null
    });
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [jobRequests, setJobRequests] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        jobRequestId: '',
        amount: '',
        details: '',
        status: 'pending'
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editFile, setEditFile] = useState(null);
    const [showDetail, setShowDetail] = useState(null);
    const [customers, setCustomers] = useState([]);

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

    const fetchQuotes = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/quotes', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setQuotes(response.data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
            if (error.response?.status === 401) {
                window.location.href = '/login';
            }
            addNotification('Không thể tải danh sách báo giá', 'error');
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

    const fetchCustomers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/customers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách khách hàng', 'error');
        }
    }, [addNotification]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (!token) {
            window.location.href = '/login';
            return;
        }

        if (!['admin', 'account', 'sales'].includes(userRole)) {
            addNotification('Bạn không có quyền truy cập trang này', 'error');
            window.location.href = '/';
            return;
        }

        fetchQuotes();
        fetchJobRequests();
        fetchCustomers();
    }, [fetchQuotes, fetchJobRequests, fetchCustomers, addNotification]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Define allowed file types
            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                addNotification('Chỉ chấp nhận file PDF, DOCX hoặc XLSX', 'error');
                e.target.value = ''; // Clear the file input
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                addNotification('File không được vượt quá 5MB', 'error');
                e.target.value = ''; // Clear the file input
                return;
            }
            setFormData(prev => ({...prev, file}));
        }
    };

    const handleRemoveFile = () => {
        // Reset the FormData file state
        setFormData(prev => ({...prev, file: null}));
        
        // Reset the file input value
        const fileInput = document.querySelector('.file-input');
        if (fileInput) {
            // Create a new input element
            const newFileInput = document.createElement('input');
            newFileInput.type = 'file';
            newFileInput.className = 'file-input';
            newFileInput.accept = fileInput.accept;
            newFileInput.addEventListener('change', handleFileChange);
            
            // Replace old input with new one
            fileInput.parentNode.replaceChild(newFileInput, fileInput);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Validate inputs
            if (!formData.jobRequestId || !formData.amount || !formData.details) {
                addNotification('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }

            // Format amount to number
            const cleanAmount = parseFloat(formData.amount.replace(/[^\d.]/g, ''));
            if (isNaN(cleanAmount)) {
                addNotification('Số tiền không hợp lệ', 'error');
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append('jobRequestId', formData.jobRequestId);
            formDataToSend.append('amount', cleanAmount);
            formDataToSend.append('details', formData.details);

            if (formData.file) {
                const allowedTypes = [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ];
                
                if (!allowedTypes.includes(formData.file.type)) {
                    addNotification('Chỉ chấp nhận file PDF, DOCX hoặc XLSX', 'error');
                    return;
                }

                if (formData.file.size > 5 * 1024 * 1024) {
                    addNotification('File không được vượt quá 5MB', 'error');
                    return;
                }

                formDataToSend.append('file', formData.file);
            }

            const response = await axios({
                method: 'post',
                url: 'http://localhost:5000/api/auth/quotes',
                data: formDataToSend,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data) {
                setFormData({
                    jobRequestId: '',
                    amount: '',
                    details: '',
                    file: null
                });
                setShowAddModal(false); // Close the modal after success
                addNotification('Tạo báo giá thành công!');
                await fetchQuotes();
            }
        } catch (err) {
            console.error('Error creating quote:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || 'Không thể tạo báo giá';
            addNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (quote) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'sales') {
            addNotification('Người dùng không có quyền chỉnh sửa', 'error');
            return;
        }
        setEditingId(quote._id);
        setEditData({
            jobRequestId: quote.jobRequestId,
            amount: quote.amount.toString(),
            details: quote.details,
            status: quote.status || 'pending'
        });
        setEditFile(quote.file);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ jobRequestId: '', amount: '', details: '', status: 'pending' });
        setEditFile(null);
    };

    const handleSaveEdit = async (id) => {
        try {
            setLoading(true);
            
            // Tạo FormData để gửi lên server
            const formData = new FormData();
            formData.append('jobRequestId', editData.jobRequestId);
            formData.append('amount', editData.amount);
            formData.append('details', editData.details);
            formData.append('status', editData.status); // Đảm bảo status là giá trị mới
            if (editData.validUntil) {
                formData.append('validUntil', editData.validUntil);
            }
            
            if (editFile) {
                formData.append('file', editFile);
            }
            
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/auth/quotes/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (response.data) {
                setEditingId(null);
                await fetchQuotes();
                addNotification('Cập nhật báo giá thành công');
            }
        } catch (err) {
            console.error('Error updating quote:', err);
            addNotification('Không thể cập nhật báo giá', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'sales') {
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
            await axios.delete(`http://localhost:5000/api/auth/quotes/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            await fetchQuotes();
            addNotification('Xóa báo giá thành công');
        } catch (err) {
            addNotification('Không thể xóa báo giá', 'error');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            draft: 'status-yellow',      // Bản nháp - màu vàng
            sent: 'status-blue',         // Đã gửi - màu xanh dương
            accepted: 'status-green',    // Đã chấp nhận - màu xanh lá
            rejected: 'status-red',      // Đã từ chối - màu đỏ
            expired: 'status-gray'       // Hết hạn - màu xám
        };
        
        const statusLabels = {
            draft: 'Bản nháp',
            sent: 'Đã gửi',
            accepted: 'Đã chấp nhận',
            rejected: 'Đã từ chối',
            expired: 'Hết hạn'
        };
        
        return (
            <span className={`status-badge ${statusClasses[status] || 'status-gray'}`}>
                {statusLabels[status] || status}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const toggleDetail = (quoteId) => {
        if (showDetail === quoteId) {
            setShowDetail(null);
        } else {
            setShowDetail(quoteId);
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

            <h1 className="page-title">Báo giá</h1>

            <div className="table-header">
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary add-button">
                    + Tạo báo giá
                </button>
            </div>

            <div className="table-container">
                {loading ? (
                    <p>Đang tải...</p>
                ) : quotes.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Mã báo giá</th>
                                <th>Khách hàng</th>
                                <th>Yêu cầu công việc</th>
                                <th>Số tiền</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map(quote => {
                                const jobRequest = jobRequests.find(req => req.requestId === quote.jobRequestId);
                                const customer = customers.find(c => jobRequest && c._id === jobRequest.customerId);
                                
                                return (
                                    <React.Fragment key={quote._id}>
                                        <tr>
                                            <td>{quote.quoteNumber || `BG-${quote._id.substring(0, 8)}`}</td>
                                            <td>{customer ? customer.name : 'Khách hàng không xác định'}</td>
                                            <td>{jobRequest ? jobRequest.title : 'N/A'}</td>
                                            <td>{formatCurrency(quote.amount)}</td>
                                            <td>{new Date(quote.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td>{getStatusBadge(quote.status)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-info btn-sm"
                                                        onClick={() => toggleDetail(quote._id)}
                                                    >
                                                        {showDetail === quote._id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                                    </button>
                                                    <FaEdit
                                                        onClick={() => handleEdit(quote)}
                                                        className="action-icon edit"
                                                        title="Sửa"
                                                    />
                                                    <FaTrash
                                                        onClick={() => handleDelete(quote._id)}
                                                        className="action-icon delete"
                                                        title="Xóa"
                                                    />
                                                    {quote.file && (
                                                        <a
                                                            href={`http://localhost:5000/uploads/${quote.file}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-secondary btn-sm"
                                                        >
                                                            Tải file
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {showDetail === quote._id && (
                                            <tr>
                                                <td colSpan="7">
                                                    <div className="quote-content">
                                                        <div dangerouslySetInnerHTML={{ __html: quote.details }} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa có báo giá nào.</p>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Tạo báo giá mới</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={() => setShowAddModal(false)}
                                title="Đóng"
                            />
                        </div>
                        <form onSubmit={handleSubmit} className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>ID Yêu cầu công việc:</label>
                                    <select 
                                        value={formData.jobRequestId}
                                        onChange={e => setFormData({...formData, jobRequestId: e.target.value})}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Chọn yêu cầu công việc</option>
                                        {jobRequests.map(request => (
                                            <option key={request._id} value={request.requestId}>
                                                {request.requestId} - {request.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Số tiền:</label>
                                    <div className="amount-input-container">
                                        <input 
                                            type="text"
                                            value={formData.amount}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d.]/g, '');
                                                const parts = value.split('.');
                                                const formatted = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
                                                setFormData({...formData, amount: formatted});
                                            }}
                                            required 
                                        />
                                        <span className="currency-suffix">VNĐ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Chi tiết:</label>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={formData.details}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setFormData(prev => ({...prev, details: data}));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tập tin đính kèm:</label>
                                    <input 
                                        type="file"
                                        onChange={handleFileChange}
                                        className="file-input"
                                        accept=".pdf,.docx,.xlsx"
                                    />
                                    {formData.file && (
                                        <div className="file-preview">
                                            <span>{formData.file.name}</span>
                                            <FaTimes
                                                className="remove-file-icon"
                                                onClick={handleRemoveFile}
                                                title="Xóa file"
                                            />
                                        </div>
                                    )}
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
                            <h3>Chỉnh sửa báo giá</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={handleCancelEdit}
                                title="Đóng"
                            />
                        </div>
                        <form className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>ID Yêu cầu công việc:</label>
                                    <select 
                                        value={editData.jobRequestId}
                                        onChange={e => setEditData({...editData, jobRequestId: e.target.value})}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Chọn yêu cầu công việc</option>
                                        {jobRequests.map(request => (
                                            <option key={request._id} value={request.requestId}>
                                                {request.requestId} - {request.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Số tiền:</label>
                                    <div className="amount-input-container">
                                        <input 
                                            type="text"
                                            value={editData.amount}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d.]/g, '');
                                                const parts = value.split('.');
                                                const formatted = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
                                                setEditData({...editData, amount: formatted});
                                            }}
                                            required 
                                        />
                                        <span className="currency-suffix">VNĐ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Chi tiết:</label>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={editData.details}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setEditData(prev => ({...prev, details: data}));
                                        }}
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
                                        <option value="draft">Bản nháp</option>
                                        <option value="sent">Đã gửi</option>
                                        <option value="accepted">Đã chấp nhận</option>
                                        <option value="rejected">Đã từ chối</option>
                                        <option value="expired">Hết hạn</option>
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
                        <p>Bạn có chắc chắn muốn xóa báo giá này không?</p>
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

export default Quote;