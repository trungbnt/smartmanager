import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaTools, FaSave, FaTimes } from 'react-icons/fa';
import '../styles/pages.css';

function EquipmentManagement() {
    const [equipment, setEquipment] = useState([]);
    const [formData, setFormData] = useState({
        type: '',
        model: '',
        capacity: '',
        licensePlate: '',
        purchaseDate: '',
        registrationExpiry: '',
        insuranceExpiry: '',
        status: 'available'
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [maintenanceData, setMaintenanceData] = useState({
        date: '',
        type: 'routine',
        description: '',
        cost: '',
        nextMaintenanceDate: ''
    });
    const [showAddModal, setShowAddModal] = useState(false);

    const addNotification = useCallback((message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(note => note.id !== id));
        }, 3000);
    }, []);

    const fetchEquipment = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/equipment', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEquipment(response.data);
        } catch (err) {
            addNotification('Không thể lấy danh sách thiết bị', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    const generateEquipmentId = (type, model, licensePlate) => {
        const typePrefix = {
            'crane': 'CAU',
            'truck': 'XE',
            'equipment': 'TB'
        }[type] || 'TB';

        const cleanModel = model.replace(/\s+/g, '').toUpperCase();
        const cleanLicense = licensePlate ? licensePlate.replace(/\s+/g, '') : 'NOLP';

        return `${typePrefix}-${cleanModel}-${cleanLicense}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const equipmentId = generateEquipmentId(formData.type, formData.model, formData.licensePlate);
            const newFormData = {
                ...formData,
                equipmentId
            };

            await axios.post('http://localhost:5000/api/auth/equipment', newFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormData({
                type: '',
                model: '',
                capacity: '',
                licensePlate: '',
                purchaseDate: '',
                registrationExpiry: '',
                insuranceExpiry: '',
                status: 'available'
            });
            setShowAddModal(false); // Close the modal
            addNotification('Thêm thiết bị thành công');
            fetchEquipment();
        } catch (err) {
            addNotification('Không thể thêm thiết bị', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMaintenance = async (equipmentId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/auth/equipment/${equipmentId}/maintenance`,
                maintenanceData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMaintenanceData({
                date: '',
                type: 'routine',
                description: '',
                cost: '',
                nextMaintenanceDate: ''
            });
            addNotification('Thêm lịch bảo trì thành công');
            fetchEquipment();
        } catch (err) {
            addNotification('Không thể thêm lịch bảo trì', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            equipmentId: item.equipmentId,
            type: item.type,
            model: item.model,
            capacity: item.capacity,
            licensePlate: item.licensePlate,
            purchaseDate: item.purchaseDate?.split('T')[0],
            registrationExpiry: item.registrationExpiry?.split('T')[0],
            insuranceExpiry: item.insuranceExpiry?.split('T')[0],
            status: item.status
        });
    };

    const handleSave = async (id) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/auth/equipment/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingId(null);
            addNotification('Cập nhật thành công');
            fetchEquipment();
        } catch (err) {
            addNotification('Không thể cập nhật thiết bị', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/auth/equipment/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                addNotification('Xóa thiết bị thành công');
                fetchEquipment();
            } catch (err) {
                addNotification('Không thể xóa thiết bị', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const getEquipmentStatuses = (equipment) => {
        const today = new Date();
        const registrationDate = new Date(equipment.registrationExpiry);
        const insuranceDate = new Date(equipment.insuranceExpiry);
        const daysToRegistration = Math.ceil((registrationDate - today) / (1000 * 60 * 60 * 24));
        const daysToInsurance = Math.ceil((insuranceDate - today) / (1000 * 60 * 60 * 24));

        let statuses = [];

        // Check registration status
        if (daysToRegistration < 0) {
            statuses.push({
                label: `Quá hạn đăng kiểm (${Math.abs(daysToRegistration)} ngày)`,
                className: 'status-danger'
            });
        } else if (daysToRegistration <= 14) {
            statuses.push({
                label: `Sắp hết hạn đăng kiểm (${daysToRegistration} ngày)`,
                className: 'status-warning'
            });
        }

        // Check insurance status
        if (daysToInsurance < 0) {
            statuses.push({
                label: `Quá hạn bảo hiểm (${Math.abs(daysToInsurance)} ngày)`,
                className: 'status-danger'
            });
        } else if (daysToInsurance <= 14) {
            statuses.push({
                label: `Sắp hết hạn bảo hiểm (${daysToInsurance} ngày)`,
                className: 'status-warning'
            });
        }

        // Add operational status if no expiry warnings
        if (statuses.length === 0) {
            if (equipment.status === 'in-use') {
                statuses.push({
                    label: 'Đang sử dụng',
                    className: 'status-in-use'
                });
            } else {
                statuses.push({
                    label: 'Sẵn sàng sử dụng',
                    className: 'status-available'
                });
            }
        }

        return statuses;
    };

    const handleAddNew = () => {
        setFormData({
            type: '',
            model: '',
            capacity: '',
            licensePlate: '',
            purchaseDate: '',
            registrationExpiry: '',
            insuranceExpiry: '',
            status: 'available'
        });
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

            <h1 className="page-title">Quản lý thiết bị</h1>

            <div className="table-header">
                <button onClick={handleAddNew} className="btn btn-primary add-button">
                    + Thêm thiết bị
                </button>
            </div>

            <div className="table-container">
                {loading ? (
                    <p>Đang tải...</p>
                ) : equipment.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Mã thiết bị</th>
                                <th>Loại</th>
                                <th>Model</th>
                                <th>Biển số</th>
                                <th>Tải trọng</th>
                                <th>Trạng thái</th>
                                <th>Hạn đăng kiểm</th>
                                <th>Hạn bảo hiểm</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipment.map(item => (
                                <tr key={item._id}>
                                    <td>{item.equipmentId}</td>
                                    <td>{item.type}</td>
                                    <td>{item.model}</td>
                                    <td>{item.licensePlate}</td>
                                    <td>{item.capacity}</td>
                                    <td>
                                        <div className="status-container">
                                            {getEquipmentStatuses(item).map((status, index) => (
                                                <span 
                                                    key={index} 
                                                    className={`status-badge ${status.className}`}
                                                >
                                                    {status.label}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>{new Date(item.registrationExpiry).toLocaleDateString()}</td>
                                    <td>{new Date(item.insuranceExpiry).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <FaEdit
                                                className="action-icon edit"
                                                onClick={() => handleEdit(item)}
                                                title="Sửa"
                                            />
                                            <FaTools
                                                className="action-icon maintenance"
                                                onClick={() => handleAddMaintenance(item._id)}
                                                title="Bảo trì"
                                            />
                                            <FaTrash
                                                className="action-icon delete"
                                                onClick={() => handleDelete(item._id)}
                                                title="Xóa"
                                            />
                                            <FaSave className="action-icon save" />
                                            <FaTimes className="action-icon cancel" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa có thiết bị nào.</p>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="overlay">
                    <div className="modal">
                        <h3>Thêm thiết bị mới</h3>
                        <form onSubmit={handleSubmit} className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Loại:</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        required
                                    >
                                        <option value="">Chọn loại thiết bị</option>
                                        <option value="crane">Cẩu</option>
                                        <option value="truck">Xe tải</option>
                                        <option value="equipment">Thiết bị khác</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Model:</label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Biển số:</label>
                                    <input
                                        type="text"
                                        value={formData.licensePlate}
                                        onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tải trọng:</label>
                                    <input
                                        type="text"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày mua:</label>
                                    <input
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hạn đăng kiểm:</label>
                                    <input
                                        type="date"
                                        value={formData.registrationExpiry}
                                        onChange={(e) => setFormData({...formData, registrationExpiry: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hạn bảo hiểm:</label>
                                    <input
                                        type="date"
                                        value={formData.insuranceExpiry}
                                        onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Trạng thái:</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        required
                                    >
                                        <option value="available">Sẵn sàng sử dụng</option>
                                        <option value="in-use">Đang sử dụng</option>
                                    </select>
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

            {editingId && (
                <div className="overlay">
                    <div className="modal">
                        <h3>Chỉnh sửa thiết bị</h3>
                        <form className="form-container">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Loại:</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        required
                                    >
                                        <option value="">Chọn loại thiết bị</option>
                                        <option value="crane">Cẩu</option>
                                        <option value="truck">Xe tải</option>
                                        <option value="equipment">Thiết bị khác</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Model:</label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Biển số:</label>
                                    <input
                                        type="text"
                                        value={formData.licensePlate}
                                        onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tải trọng:</label>
                                    <input
                                        type="text"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày mua:</label>
                                    <input
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hạn đăng kiểm:</label>
                                    <input
                                        type="date"
                                        value={formData.registrationExpiry}
                                        onChange={(e) => setFormData({...formData, registrationExpiry: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hạn bảo hiểm:</label>
                                    <input
                                        type="date"
                                        value={formData.insuranceExpiry}
                                        onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Trạng thái:</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        required
                                    >
                                        <option value="available">Sẵn sàng sử dụng</option>
                                        <option value="in-use">Đang sử dụng</option>
                                    </select>
                                </div>
                            </div>

                            <div className="button-group">
                                <button 
                                    type="button"
                                    onClick={() => handleSave(editingId)}
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : <><FaSave /> Lưu</>}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({
                                            type: '',
                                            model: '',
                                            capacity: '',
                                            licensePlate: '',
                                            purchaseDate: '',
                                            registrationExpiry: '',
                                            insuranceExpiry: '',
                                            status: 'available'
                                        });
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

export default EquipmentManagement;