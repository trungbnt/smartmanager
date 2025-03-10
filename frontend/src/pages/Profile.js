import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

function Profile() {
    const [userData, setUserData] = useState({
        username: '',
        role: '',
        email: '',
        phone: '',
        createdAt: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: token }
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Thông tin cá nhân</h1>
            </div>
            
            <div className="profile-content">
                <div className="profile-section">
                    <h3>Thông tin tài khoản</h3>
                    <div className="info-group">
                        <label>Tên đăng nhập:</label>
                        <span>{userData.username}</span>
                    </div>
                    <div className="info-group">
                        <label>Vai trò:</label>
                        <span>{userData.role}</span>
                    </div>
                    <div className="info-group">
                        <label>Email:</label>
                        <span>{userData.email || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="info-group">
                        <label>Số điện thoại:</label>
                        <span>{userData.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="info-group">
                        <label>Ngày tạo tài khoản:</label>
                        <span>{new Date(userData.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;