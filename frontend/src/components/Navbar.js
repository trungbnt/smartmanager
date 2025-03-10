import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaCaretDown } from 'react-icons/fa';
import '../styles/navbar.css';

function Navbar({ userRole, username, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <Link to={item.path}>{item.label}</Link>
                    </li>
                ))}
            </ul>
            
            <div className="nav-right" ref={dropdownRef}>
                <div 
                    className="welcome-message"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <span>Xin chào, {username}</span>
                    <FaCaretDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
                    
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <Link to="/profile" className="dropdown-item">
                                <FaUser /> Xem thông tin
                            </Link>
                            <Link to="/profile/edit" className="dropdown-item">
                                <FaUser /> Chỉnh sửa thông tin
                            </Link>
                            <button onClick={onLogout} className="dropdown-item">
                                <FaSignOutAlt /> Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;