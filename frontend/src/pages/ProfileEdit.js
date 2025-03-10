import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

function ProfileEdit() {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: token }
                });
                setFormData(prev => ({
                    ...prev,
                    email: response.data.email || '',
                    phone: response.data.phone || ''
                }));
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                'http://localhost:5000/api/users/profile',
                formData,
                { headers: { Authorization: token } }
            );
            navigate('/profile');
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Chỉnh sửa thông tin</h1>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label>Số điện thoại:</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label>Mật khẩu hiện tại:</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label>Mật khẩu mới:</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label>Xác nhận mật khẩu mới:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="button-group">
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => navigate('/profile')}
                    >
                        Hủy bỏ
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileEdit;