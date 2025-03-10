import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import '../styles/auth.css'
import '../styles/pages.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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

    useEffect(() => {
        // Check for saved credentials
        const savedCredentials = localStorage.getItem('savedCredentials');
        if (savedCredentials) {
            const { username, password } = JSON.parse(savedCredentials);
            setUsername(username);
            setPassword(password);
            setRememberMe(true);
        }
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
                // Handle Remember Me
                if (rememberMe) {
                    // Store credentials securely as JSON string
                    localStorage.setItem('savedCredentials', JSON.stringify({ 
                        username, 
                        password 
                    }));
                } else {
                    // Clear saved credentials if "Remember Me" is unchecked
                    localStorage.removeItem('savedCredentials');
                }

                // Store auth token
                localStorage.setItem('token', `Bearer ${response.data.token}`);
                localStorage.setItem('userRole', response.data.role);
                localStorage.setItem('username', response.data.username || username);
                
                onLogin({
                    role: response.data.role,
                    username: response.data.username || username // Use input username as fallback
                });
                
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            addNotification('Đăng nhập không thành công', 'error');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-container">
            <div className="auth-box">
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
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Nhớ mật khẩu</span>
                        </label>
                    </div>
                    <div className="button-group auth-buttons">
                        <button 
                            type="submit" 
                            className="btn-auth btn-login"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-auth btn-register"
                            onClick={() => navigate('/register')}
                        >
                            Đăng ký
                        </button>
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
};

export default Login;