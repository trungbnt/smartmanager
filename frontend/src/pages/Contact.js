import React, { useState } from 'react';
import axios from 'axios';
import Notification from '../components/Notification';
import '../styles/pages.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);

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

    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/auth/contact`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({ name: '', email: '', message: '' });
            addNotification('Yêu cầu đã được gửi thành công!');
        } catch (err) {
            addNotification('Không thể gửi yêu cầu. Vui lòng thử lại sau.', 'error');
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

            <h1 className="page-title">Gửi yêu cầu công việc</h1>
            
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>Tên:</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Nội dung:</label>
                    <textarea 
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        required
                    ></textarea>
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Đang gửi...' : 'Gửi'}
                </button>
            </form>
        </div>
    );
}

export default Contact;