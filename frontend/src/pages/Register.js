import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Notification from '../components/Notification';
import '../styles/pages.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const history = useHistory();

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
            // Chuyển hướng đến trang đăng nhập sau 2 giây
            setTimeout(() => {
                history.push('/login');
            }, 2000);
        } catch (error) {
            console.error('Error during registration:', error);
            addNotification('Đăng ký không thành công. Vui lòng thử lại.', 'error');
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

            <h1 className="page-title">Đăng ký</h1>
            
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>Tên đăng nhập:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Vai trò:</label>
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        className="form-select"
                    >
                        <option value="customer">Khách hàng</option>
                        <option value="account">Kế toán</option>
                        <option value="sales">Bán hàng</option>
                        <option value="engineering">Kỹ thuật</option>
                        <option value="admin">Quản trị viên</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    className="btn" 
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
            </form>
        </div>
    );
}

export default Register;