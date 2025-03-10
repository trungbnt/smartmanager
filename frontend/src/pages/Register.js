import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Notification from '../components/Notification';
import '../styles/auth.css';
import '../styles/pages.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(note => note.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post('http://localhost:5000/api/auth/register', { 
                username, 
                password, 
                role 
            });
            addNotification('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Error during registration:', error);
            addNotification('Đăng ký không thành công. Vui lòng thử lại.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Đăng ký tài khoản</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Vai trò:</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="form-control"
                        >
                            <option value="customer">Khách hàng</option>
                            <option value="account">Kế toán</option>
                            <option value="sales">Bán hàng</option>
                            <option value="engineering">Kỹ thuật</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    </div>

                    <div className="button-group auth-buttons">
                        <button
                            type="submit"
                            className="btn-auth btn-login"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </div>

                    <div className="auth-links">
                        <p>
                            Đã có tài khoản?{' '}
                            <Link to="/login">Đăng nhập tại đây</Link>
                        </p>
                    </div>
                </form>
            </div>
            
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
        </div>
    );
}

export default Register;