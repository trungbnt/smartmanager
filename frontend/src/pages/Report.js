import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import Notification from '../components/Notification';
import '../styles/pages.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function Report() {
    const [reports, setReports] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'monthly', // monthly, quarterly, yearly
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        title: '',
        content: '',
        type: '',
        startDate: '',
        endDate: ''
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showContent, setShowContent] = useState(null);

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

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/reports', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data);
        } catch (err) {
            addNotification('Không thể tải danh sách báo cáo', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            if (!formData.title || !formData.type || !formData.startDate || !formData.endDate) {
                addNotification('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/reports', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormData({
                title: '',
                content: '',
                type: 'monthly',
                startDate: '',
                endDate: ''
            });

            setShowAddModal(false);
            await fetchReports();
            addNotification('Tạo báo cáo thành công');
        } catch (err) {
            addNotification('Không thể tạo báo cáo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (report) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'account') {
            addNotification('Người dùng không có quyền chỉnh sửa', 'error');
            return;
        }

        setEditingId(report._id);
        setEditData({
            title: report.title,
            content: report.content,
            type: report.type,
            startDate: report.startDate ? new Date(report.startDate).toISOString().slice(0, 10) : '',
            endDate: report.endDate ? new Date(report.endDate).toISOString().slice(0, 10) : ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            title: '',
            content: '',
            type: '',
            startDate: '',
            endDate: ''
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/auth/reports/${id}`,
                editData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setEditingId(null);
            await fetchReports();
            addNotification('Cập nhật báo cáo thành công');
        } catch (err) {
            addNotification('Không thể cập nhật báo cáo', 'error');
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
            await axios.delete(`http://localhost:5000/api/auth/reports/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            await fetchReports();
            addNotification('Xóa báo cáo thành công');
        } catch (err) {
            addNotification('Không thể xóa báo cáo', 'error');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    const getReportTypeBadge = (type) => {
        const typeClasses = {
            monthly: 'status-blue',    // Báo cáo tháng - màu xanh dương
            quarterly: 'status-green', // Báo cáo quý - màu xanh lá
            yearly: 'status-purple'    // Báo cáo năm - màu tím
        };

        const typeLabels = {
            monthly: 'Báo cáo tháng',
            quarterly: 'Báo cáo quý',
            yearly: 'Báo cáo năm'
        };

        return (
            <span className={`status-badge ${typeClasses[type] || 'status-gray'}`}>
                {typeLabels[type] || type}
            </span>
        );
    };

    const toggleContent = (reportId) => {
        if (showContent === reportId) {
            setShowContent(null);
        } else {
            setShowContent(reportId);
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

            <h1 className="page-title">Báo cáo</h1>

            <div className="table-header">
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary add-button">
                    + Tạo báo cáo mới
                </button>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Tạo báo cáo mới</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={() => setShowAddModal(false)}
                                title="Đóng"
                            />
                        </div>
                        <form onSubmit={handleSubmit} className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tiêu đề:</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Loại báo cáo:</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                        required
                                        className="form-select"
                                    >
                                        <option value="monthly">Báo cáo tháng</option>
                                        <option value="quarterly">Báo cáo quý</option>
                                        <option value="yearly">Báo cáo năm</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Từ ngày:</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Đến ngày:</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Nội dung:</label>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={formData.content || ''}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setFormData({...formData, content: data});
                                        }}
                                        config={{
                                            toolbar: [
                                                'heading',
                                                '|',
                                                'bold',
                                                'italic',
                                                'link',
                                                'bulletedList',
                                                'numberedList',
                                                'blockQuote',
                                                'insertTable',
                                                'mediaEmbed',
                                                '|',
                                                'undo',
                                                'redo'
                                            ],
                                            table: {
                                                contentToolbar: [
                                                    'tableColumn',
                                                    'tableRow',
                                                    'mergeTableCells'
                                                ]
                                            },
                                            image: {
                                                toolbar: [
                                                    'imageStyle:full',
                                                    'imageStyle:side',
                                                    '|',
                                                    'imageTextAlternative'
                                                ]
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="button-group">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Tạo báo cáo'}
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
                <h2>Danh sách báo cáo</h2>
                {loading ? (
                    <p>Đang tải...</p>
                ) : reports.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Loại báo cáo</th>
                                <th>Từ ngày</th>
                                <th>Đến ngày</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <React.Fragment key={report._id}>
                                    <tr>
                                        <td>{report.title}</td>
                                        <td>{getReportTypeBadge(report.type)}</td>
                                        <td>{new Date(report.startDate).toLocaleDateString('vi-VN')}</td>
                                        <td>{new Date(report.endDate).toLocaleDateString('vi-VN')}</td>
                                        <td>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => toggleContent(report._id)}
                                                >
                                                    {showContent === report._id ? 'Ẩn nội dung' : 'Xem nội dung'}
                                                </button>
                                                <FaEdit
                                                    onClick={() => handleEdit(report)}
                                                    className="action-icon edit"
                                                    title="Sửa"
                                                />
                                                <FaTrash
                                                    onClick={() => handleDelete(report._id)}
                                                    className="action-icon delete"
                                                    title="Xóa"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    {showContent === report._id && (
                                        <tr>
                                            <td colSpan="6">
                                                <div className="report-content">
                                                    <div dangerouslySetInnerHTML={{ __html: report.content }} />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa có báo cáo nào.</p>
                )}
            </div>

            {/* Edit Modal */}
            {editingId && (
                <div className="overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Chỉnh sửa báo cáo</h3>
                            <FaTimes
                                className="close-icon"
                                onClick={handleCancelEdit}
                                title="Đóng"
                            />
                        </div>
                        <form className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tiêu đề:</label>
                                    <input
                                        type="text"
                                        value={editData.title}
                                        onChange={e => setEditData({...editData, title: e.target.value})}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Loại báo cáo:</label>
                                    <select
                                        value={editData.type}
                                        onChange={e => setEditData({...editData, type: e.target.value})}
                                        required
                                        className="form-select"
                                    >
                                        <option value="monthly">Báo cáo tháng</option>
                                        <option value="quarterly">Báo cáo quý</option>
                                        <option value="yearly">Báo cáo năm</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Từ ngày:</label>
                                    <input
                                        type="date"
                                        value={editData.startDate}
                                        onChange={e => setEditData({...editData, startDate: e.target.value})}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Đến ngày:</label>
                                    <input
                                        type="date"
                                        value={editData.endDate}
                                        onChange={e => setEditData({...editData, endDate: e.target.value})}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Nội dung:</label>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={editData.content || ''}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setEditData({...editData, content: data});
                                        }}
                                        config={{
                                            toolbar: [
                                                'heading',
                                                '|',
                                                'bold',
                                                'italic',
                                                'link',
                                                'bulletedList',
                                                'numberedList',
                                                'blockQuote',
                                                'insertTable',
                                                'mediaEmbed',
                                                '|',
                                                'undo',
                                                'redo'
                                            ],
                                            table: {
                                                contentToolbar: [
                                                    'tableColumn',
                                                    'tableRow',
                                                    'mergeTableCells'
                                                ]
                                            },
                                            image: {
                                                toolbar: [
                                                    'imageStyle:full',
                                                    'imageStyle:side',
                                                    '|',
                                                    'imageTextAlternative'
                                                ]
                                            }
                                        }}
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
                        <p>Bạn có chắc chắn muốn xóa báo cáo này không?</p>
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

export default Report;