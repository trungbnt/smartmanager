import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
            const { token, role } = response.data; // Nhận token và vai trò từ server
            console.log('Role:', role); // Log vai trò để kiểm tra
            console.log('Generated Token:', token); // Log token để kiểm tra

            // Lưu thông tin vào localStorage
            localStorage.setItem('userRole', role);
            localStorage.setItem('username', username);
            localStorage.setItem('token', token);
            setMessage('Đăng nhập thành công!');

            // Gọi callback để cập nhật trạng thái trong App.js
            onLogin(username, role);

            // Chuyển hướng về trang chủ
            history.push('/');
        } catch (error) {
            console.error('Error during login:', error);
            setMessage('Đăng nhập không thành công. Vui lòng thử lại.');
        }
    };

    return (
        <div>
            <h1>Đăng nhập</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Đăng nhập</button>
            </form>
            {message && <p>{message}</p>} {/* Hiển thị thông báo */}
        </div>
    );
}

export default Login; 