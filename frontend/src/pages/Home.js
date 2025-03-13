import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

function Home() {
    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Chào mừng đến với Smart Manager</h1>
                <p>Hệ thống quản lý doanh nghiệp thông minh</p>
                <div className="home-buttons">
                    <Link to="/login" className="btn home-btn">Đăng nhập</Link>
                    <Link to="/register" className="btn home-btn">Đăng ký</Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
