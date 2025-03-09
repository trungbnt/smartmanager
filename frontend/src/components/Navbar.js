import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

function Navbar({ userRole, onLogout }) {
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
            <div className="nav-brand">
                <Link to="/">Logo</Link>
            </div>
            <ul className="nav-menu">
                {currentMenuItems.map((item, index) => (
                    <li key={index} className="nav-item">
                        <Link to={item.path}>{item.label}</Link>
                    </li>
                ))}
            </ul>
            <div className="nav-right">
                <span className="user-role">{userRole}</span>
                <button onClick={onLogout} className="logout-btn">
                    Đăng xuất
                </button>
            </div>
        </nav>
    );
}

export default Navbar; 