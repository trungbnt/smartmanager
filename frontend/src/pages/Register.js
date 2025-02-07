import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [message, setMessage] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', { username, password, role });
            setMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
            // Chuyển hướng đến trang đăng nhập sau 2 giây
            setTimeout(() => {
                history.push('/login');
            }, 2000);
        } catch (error) {
            console.error('Error during registration:', error);
            setMessage('Đăng ký không thành công. Vui lòng thử lại.');
        }
    };

    return (
        <div>
            <h1>Đăng ký</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="customer">Khách hàng</option>
                    <option value="account">Kế toán</option>
                    <option value="sales">Bán hàng</option>
                    <option value="engineering">Kỹ thuật</option>
                    <option value="admin">Quản trị viên</option>
                </select>
                <button type="submit">Đăng ký</button>
            </form>
            {message && <p>{message}</p>} {/* Hiển thị thông báo */}
        </div>
    );
}

export default Register; 