import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons
import '../styles/navbar.css';

function Navbar({ userRole, username, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Định nghĩa menu theo role
    const menuItems = {
        admin: [
            { path: '/customers', label: 'Khách hàng' },
            { path: '/job-requests', label: 'Yêu cầu công việc' },
            { path: '/quotes', label: 'Báo giá' },
            { path: '/schedules', label: 'Lịch trình' },
            { path: '/invoices', label: 'Hóa đơn' },
            { path: '/reports', label: 'Báo cáo' },
            { path: '/employees', label: 'Nhân viên' },
            { path: '/equipment', label: 'Thiết bị' }
        ],
        sales: [
            { path: '/customers', label: 'Khách hàng' },
            { path: '/job-requests', label: 'Yêu cầu công việc' },
            { path: '/quotes', label: 'Báo giá' },
            { path: '/schedules', label: 'Lịch trình' }
        ],
        account: [
            { path: '/invoices', label: 'Hóa đơn' },
            { path: '/reports', label: 'Báo cáo' }
        ],
        engineering: [
            { path: '/schedules', label: 'Lịch trình' },
            { path: '/equipment', label: 'Thiết bị' }
        ],
        customer: [
            { path: '/job-requests', label: 'Yêu cầu công việc' }
        ]
    };

    // Lấy menu tương ứng với role
    const currentMenuItems = menuItems[userRole] || [];

    return (
        <nav className="navbar">
            <button className="mobile-menu-btn" onClick={toggleMenu}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
            
            <div className="nav-brand">
                <Link to="/">Smart Manager</Link>
            </div>
            
            <ul className={`nav-menu ${isMenuOpen ? 'mobile-open' : ''}`}>
                {currentMenuItems.map((item, index) => (
                    <li 
                        key={index} 
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)} // Close menu when item clicked
                    >
                        <Link to={item.path}>{item.label}</Link>
                    </li>
                ))}
            </ul>
            
            <div className="nav-right">
                <div className="welcome-message">
                    <span>Xin chào, {username}!</span>
                    <span className="user-role">{userRole}</span>
                </div>
                <button onClick={onLogout} className="logout-btn">
                    Đăng xuất
                </button>
            </div>
        </nav>
    );
}

export default Navbar;