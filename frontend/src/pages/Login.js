import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import '../styles/pages.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const timeoutRefs = useRef(new Map());

    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        
        // Store timeout reference
        const timeoutId = setTimeout(() => {
            removeNotification(id);
        }, 5000);
        timeoutRefs.current.set(id, timeoutId);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(note => note.id !== id));
        // Clear timeout when notification is removed
        if (timeoutRefs.current.has(id)) {
            clearTimeout(timeoutRefs.current.get(id));
            timeoutRefs.current.delete(id);
        }
    };

    // Modified cleanup effect
    useEffect(() => {
        // Store ref reference to avoid closure issues
        const timeouts = timeoutRefs.current;
        
        return () => {
            // Use stored reference in cleanup
            timeouts.forEach(timeoutId => {
                clearTimeout(timeoutId);
            });
            timeouts.clear();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });

            if (response.data.token) {
                // Store user data in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userRole', response.data.role);
                localStorage.setItem('username', response.data.username || username);
                
                // Update parent component state through onLogin
                onLogin({
                    token: response.data.token,
                    role: response.data.role,
                    username: response.data.username || username
                });
                
                addNotification('Đăng nhập thành công');
                navigate('/');
            } else {
                addNotification('Đăng nhập thất bại', 'error');
            }
        } catch (error) {
            addNotification(error.response?.data?.message || 'Đăng nhập thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
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

            <h2>Đăng nhập</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
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
                    />
                </div>
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
            </form>
        </div>
    );
};

export default Login;