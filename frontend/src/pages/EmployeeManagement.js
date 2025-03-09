import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import '../styles/pages.css';

const validatePhoneNumber = (phoneNumber) => {
    // Vietnamese phone number format: 10 digits starting with 0
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phoneNumber);
};

const getDepartmentName = (departmentCode) => {
    const departments = {
        'sales': 'Kinh doanh',
        'technical': 'Kỹ thuật',
        'accounting': 'Kế toán',
        'management': 'Ban giám đốc'
    };
    return departments[departmentCode] || departmentCode;
};

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        position: '',
        phone: '',
        email: '',
        salary: '',
        joinDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [phoneError, setPhoneError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const addNotification = useCallback((message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(note => note.id !== id));
        }, 3000);
    }, []);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/employees', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data);
        } catch (err) {
            addNotification('Không thể lấy danh sách nhân viên', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const generateEmployeeId = (department, joinDate) => {
        // Get department prefix
        const deptPrefix = {
            'sales': 'KD',
            'technical': 'KT',
            'accounting': 'KT',
            'management': 'BGD'
        }[department] || 'NV';
    
        // Format date as DDMMYY
        const dateStr = new Date(joinDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }).replace(/\//g, '');
    
        // Generate random string (10 characters)
        const randomStr = Math.random().toString(36).substring(2, 12).toUpperCase();
    
        return `${deptPrefix}-${dateStr}-${randomStr}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePhoneNumber(formData.phone)) {
            addNotification('Số điện thoại không hợp lệ', 'error');
            setPhoneError('Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const employeeId = generateEmployeeId(formData.department, formData.joinDate);
            const newFormData = {
                ...formData,
                employeeId
            };

            await axios.post('http://localhost:5000/api/auth/employees', newFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormData({
                name: '',
                department: '',
                position: '',
                phone: '',
                email: '',
                salary: '',
                joinDate: ''
            });
            setShowAddModal(false); // Close the modal
            addNotification('Thêm nhân viên thành công');
            fetchEmployees();
        } catch (err) {
            addNotification('Không thể thêm nhân viên', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (employee) => {
        setEditingId(employee._id);
        setFormData({
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department,
            position: employee.position,
            phone: employee.phone,
            email: employee.email,
            salary: employee.salary,
            joinDate: employee.joinDate?.split('T')[0]
        });
    };

    const handleSave = async (id) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/auth/employees/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingId(null);
            addNotification('Cập nhật thành công');
            fetchEmployees();
        } catch (err) {
            addNotification('Không thể cập nhật nhân viên', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/auth/employees/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                addNotification('Xóa nhân viên thành công');
                fetchEmployees();
            } catch (err) {
                addNotification('Không thể xóa nhân viên', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // Only allow numbers
        const numbersOnly = value.replace(/[^\d]/g, '');
        
        setFormData(prev => ({...prev, phone: numbersOnly}));
        
        if (numbersOnly && !validatePhoneNumber(numbersOnly)) {
            setPhoneError('Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)');
        } else {
            setPhoneError('');
        }
    };

    const handleAddNew = () => {
        setFormData({
            name: '',
            department: '',
            position: '',
            phone: '',
            email: '',
            salary: '',
            joinDate: ''
        });
        setPhoneError('');
        setShowAddModal(true);
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

            <h1 className="page-title">Quản lý nhân viên</h1>

            <div className="table-header">
                <button onClick={handleAddNew} className="btn btn-primary add-button">
                    + Thêm nhân viên
                </button>
            </div>

            <div className="table-container">
                {loading ? (
                    <p>Đang tải...</p>
                ) : employees.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Mã NV</th>
                                <th>Họ và tên</th>
                                <th>Bộ phận</th>
                                <th>Chức vụ</th>
                                <th>Số điện thoại</th>
                                <th>Email</th>
                                <th>Lương</th>
                                <th>Ngày vào làm</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(employee => (
                                <tr key={employee._id}>
                                    <td>{employee.employeeId}</td>
                                    <td>{employee.name}</td>
                                    <td>{getDepartmentName(employee.department)}</td>
                                    <td>{employee.position}</td>
                                    <td>{employee.phone}</td>
                                    <td>{employee.email}</td>
                                    <td>{new Intl.NumberFormat('vi-VN').format(employee.salary)} VNĐ</td>
                                    <td>{new Date(employee.joinDate).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <FaEdit
                                                className="action-icon edit"
                                                onClick={() => handleEdit(employee)}
                                                title="Sửa"
                                            />
                                            <FaTrash
                                                className="action-icon delete"
                                                onClick={() => handleDelete(employee._id)}
                                                title="Xóa"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa có nhân viên nào.</p>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="overlay">
                    <div className="modal">
                        <h3>Thêm nhân viên mới</h3>
                        <form onSubmit={handleSubmit} className="form-container">
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Họ và tên:</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bộ phận:</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        required
                                    >
                                        <option value="">Chọn bộ phận</option>
                                        <option value="sales">Kinh doanh</option>
                                        <option value="technical">Kỹ thuật</option>
                                        <option value="accounting">Kế toán</option>
                                        <option value="management">Ban giám đốc</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Chức vụ:</label>
                                    <input
                                        type="text"
                                        value={formData.position}
                                        onChange={(e) => setFormData({...formData, position: e.target.value})}
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
                                        maxLength="11"
                                        required
                                        className={phoneError ? 'input-error' : ''}
                                    />
                                    {phoneError && <span className="error-message">{phoneError}</span>}
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
                                    <label>Lương:</label>
                                    <input
                                        type="number"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ngày vào làm:</label>
                                    <input
                                        type="date"
                                        value={formData.joinDate}
                                        onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
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
                        <h3>Chỉnh sửa thông tin nhân viên</h3>
                        <form className="form-container">
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Họ và tên:</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bộ phận:</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        required
                                    >
                                        <option value="">Chọn bộ phận</option>
                                        <option value="sales">Kinh doanh</option>
                                        <option value="technical">Kỹ thuật</option>
                                        <option value="accounting">Kế toán</option>
                                        <option value="management">Ban giám đốc</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Chức vụ:</label>
                                    <input
                                        type="text"
                                        value={formData.position}
                                        onChange={(e) => setFormData({...formData, position: e.target.value})}
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
                                        maxLength="11"
                                        required
                                        className={phoneError ? 'input-error' : ''}
                                    />
                                    {phoneError && <span className="error-message">{phoneError}</span>}
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
                                    <label>Lương:</label>
                                    <input
                                        type="number"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ngày vào làm:</label>
                                    <input
                                        type="date"
                                        value={formData.joinDate}
                                        onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
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
        </div>
    );
}

export default EmployeeManagement;