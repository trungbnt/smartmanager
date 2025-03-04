import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Notification from '../components/Notification';
import '../styles/pages.css';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

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
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/quotes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuotes(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách báo giá', 'error');
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

    useEffect(() => {
        fetchQuotes();
        fetchJobRequests();
    }, [fetchQuotes, fetchJobRequests]);

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
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ jobRequestId: '', amount: '', details: '', status: 'pending' });
    };

    const handleSaveEdit = async (id) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const cleanAmount = parseFloat(editData.amount.replace(/[^\d.]/g, ''));
            if (isNaN(cleanAmount)) {
                addNotification('Số tiền không hợp lệ', 'error');
                return;
            }

            await axios.put(`http://localhost:5000/api/auth/quotes/${id}`, 
                {...editData, amount: cleanAmount},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            await fetchQuotes();
            setEditingId(null);
            setEditData({ jobRequestId: '', amount: '', details: '', status: 'pending' });
            addNotification('Cập nhật thành công');
        } catch (err) {
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
            
            <form onSubmit={handleSubmit} className="form-container">
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
                                // Remove non-numeric characters except decimal point
                                const value = e.target.value.replace(/[^\d.]/g, '');
                                // Ensure only one decimal point
                                const parts = value.split('.');
                                const formatted = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
                                setFormData({...formData, amount: formatted});
                            }}
                            required 
                        />
                        <span className="currency-suffix">VNĐ</span>
                    </div>
                </div>

                <div className="form-group">
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

                <div className="form-group">
                    <label>Tập tin đính kèm (PDF, DOCX, XLSX):</label>
                    <input 
                        type="file"
                        accept=".pdf,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                    {formData.file && (
                        <div className="file-preview">
                            <div className="file-info">
                                <p>File đã chọn: {formData.file.name}</p>
                                <small>({(formData.file.size / (1024 * 1024)).toFixed(2)} MB)</small>
                            </div>
                            <FaTimes
                                className="remove-file-icon"
                                onClick={handleRemoveFile}
                                title="Xóa file"
                            />
                        </div>
                    )}
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Tạo báo giá'}
                </button>
            </form>

            <div className="table-container">
                <h2>Danh sách báo giá</h2>
                {loading ? (
                    <p>Đang tải...</p>
                ) : quotes.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ID Yêu cầu</th>
                                <th>Số tiền</th>
                                <th>Chi tiết</th>
                                <th>Tập tin</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map(quote => (
                                <tr key={quote._id}>
                                    <td>{editingId === quote._id ? (
                                        <select
                                            value={editData.jobRequestId}
                                            onChange={(e) => setEditData({...editData, jobRequestId: e.target.value})}
                                            required
                                        >
                                            {jobRequests.map(request => (
                                                <option key={request._id} value={request.requestId}>
                                                    {request.requestId} - {request.title}
                                                </option>
                                            ))}
                                        </select>
                                    ) : quote.jobRequestId}</td>
                                    <td>
                                        {editingId === quote._id ? (
                                            <input
                                                type="text"
                                                value={editData.amount}
                                                onChange={(e) => setEditData({...editData, amount: e.target.value})}
                                                required
                                            />
                                        ) : `${quote.amount.toLocaleString()} VNĐ`}
                                    </td>
                                    <td>
                                        {editingId === quote._id ? (
                                            <CKEditor
                                                editor={ClassicEditor}
                                                data={editData.details}
                                                onChange={(event, editor) => {
                                                    const data = editor.getData();
                                                    setEditData(prev => ({...prev, details: data}));
                                                }}
                                            />
                                        ) : <div dangerouslySetInnerHTML={{ __html: quote.details }}></div>}
                                    </td>
                                    <td>
                                        {quote.fileUrl && (
                                            <a 
                                                href={`http://localhost:5000${quote.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Xem file
                                            </a>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === quote._id ? (
                                            <select
                                                value={editData.status}
                                                onChange={(e) => setEditData({...editData, status: e.target.value})}
                                            >
                                                <option value="pending">Chờ xử lý</option>
                                                <option value="approved">Đã duyệt</option>
                                                <option value="rejected">Từ chối</option>
                                            </select>
                                        ) : quote.status}
                                    </td>
                                    <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {editingId === quote._id ? (
                                            <>
                                                <FaSave 
                                                    onClick={() => handleSaveEdit(quote._id)}
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
                                                    onClick={() => handleEdit(quote)}
                                                    className="action-icon edit"
                                                    title="Sửa"
                                                />
                                                <FaTrash 
                                                    onClick={() => handleDelete(quote._id)}
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
                    <p>Chưa có báo giá nào.</p>
                )}
            </div>

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