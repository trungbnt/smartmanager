import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

function Home() {
    // State để lưu trạng thái đăng nhập
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Kiểm tra trạng thái đăng nhập khi component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); // Nếu có token, isLoggedIn = true
    }, []);

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Chào mừng đến với Smart Manager</h1>
                <p>Hệ thống quản lý doanh nghiệp thông minh</p>

                {isLoggedIn ? (
                    // Nội dung hiển thị sau khi đăng nhập
                    <div className="dashboard-section">
                        <h2>Dashboard</h2>
                        <p>Chào mừng bạn quay lại! Dưới đây là các chức năng chính của hệ thống:</p>
                        <div className="dashboard-links">
                            <Link to="/job-requests" className="btn dashboard-btn">
                                Quản lý yêu cầu công việc
                            </Link>
                            <Link to="/schedules" className="btn dashboard-btn">
                                Lịch biểu
                            </Link>
                            <Link to="/customers" className="btn dashboard-btn">
                                Quản lý khách hàng
                            </Link>
                            <Link to="/profile" className="btn dashboard-btn">
                                Hồ sơ cá nhân
                            </Link>
                        </div>
                        <div className="project-overview">
                            <h3>Tổng quan dự án</h3>
                            <p>
                                Smart Manager là hệ thống quản lý doanh nghiệp thông minh, giúp bạn:
                            </p>
                            <ul>
                                <li>Quản lý yêu cầu công việc hiệu quả.</li>
                                <li>Theo dõi lịch biểu và tiến độ dự án.</li>
                                <li>Duy trì thông tin khách hàng và tương tác.</li>
                                <li>Tùy chỉnh hồ sơ cá nhân và cài đặt hệ thống.</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    // Nội dung hiển thị khi chưa đăng nhập
                    <div className="home-buttons">
                        <Link to="/login" className="btn home-btn">Đăng nhập</Link>
                        <Link to="/register" className="btn home-btn">Đăng ký</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;