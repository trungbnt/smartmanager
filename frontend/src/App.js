import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeManagement from './pages/EmployeeManagement';
import EquipmentManagement from './pages/EquipmentManagement';
import './styles/auth.css'
import './styles/pages.css';
import './styles/global.css';
import Contact from './pages/Contact';
import Customer from './pages/Customer';
import JobRequest from './pages/JobRequest';
import Quote from './pages/Quote';
import Schedule from './pages/Schedule';
import Invoice from './pages/Invoice';
import Report from './pages/Report';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';

const App = () => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('token');
            setUserRole(localStorage.getItem('userRole'));
            setUsername(localStorage.getItem('username'));
            setIsAuthenticated(!!token);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        ['userRole', 'username', 'token'].forEach(item => localStorage.removeItem(item));

        // Clear all localStorage items
        localStorage.clear();
        setUserRole(null);
        setUsername(null);
        setIsAuthenticated(false);
        setShowLogoutConfirm(false);
        window.location.href = '/login';
    };

    const handleLogin = (userData) => {
        setUserRole(userData.role);
        setUsername(userData.username || 'User'); // Add fallback value
        setIsAuthenticated(true);
        
        // Also update localStorage
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('username', userData.username || 'User');
    };

    return (
        <BrowserRouter basename="/">
            <div className="app-container">
                {isAuthenticated && (
                    <Navbar 
                        userRole={userRole}
                        username={username}
                        onLogout={() => setShowLogoutConfirm(true)}
                    />
                )}

                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login onLogin={handleLogin} />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Protected Routes */}
                        <Route path="/contact" element={
                            isAuthenticated && userRole === 'customer' ? 
                            <Contact /> : 
                            <Navigate to="/login" replace />
                        } />
                        
                        <Route path="/customers" element={
                            isAuthenticated && ['admin', 'sales', 'engineering', 'account'].includes(userRole) ? 
                            <Customer /> : 
                            <Navigate to="/login" replace />
                        } />
                        
                        <Route path="/job-requests" element={
                            isAuthenticated && ['admin', 'account', 'sales', 'customer'].includes(userRole) ? 
                            <JobRequest /> : 
                            <Navigate to="/login" replace />
                        } />
                        
                        <Route path="/quotes" element={
                            isAuthenticated && ['admin', 'sales', 'engineering'].includes(userRole) ? 
                            <Quote /> : 
                            <Navigate to="/login" replace />
                        } />
                        
                        <Route path="/schedules" element={
                            isAuthenticated && ['admin', 'sales', 'engineering'].includes(userRole) ? 
                            <Schedule /> : 
                            <Navigate to="/login" replace />
                        } />
                        
                        <Route path="/invoices" element={
                            isAuthenticated && ['admin', 'account'].includes(userRole) ? 
                            <Invoice /> : 
                            <Navigate to="/login" replace />
                        } />
                        
                        <Route path="/reports" element={
                            isAuthenticated && ['admin', 'account'].includes(userRole) ? 
                            <Report /> : 
                            <Navigate to="/login" replace />
                        } />
                        
                        <Route path="/employees" element={
                            isAuthenticated && ['admin', 'account'].includes(userRole) ? 
                            <EmployeeManagement /> : 
                            <Navigate to="/login" replace />
                        } />
                        
                        <Route path="/equipment" element={
                            isAuthenticated && ['admin', 'engineering'].includes(userRole) ? 
                            <EquipmentManagement /> : 
                            <Navigate to="/login" replace />
                        } />

                        {/* Add Profile Routes */}
                        <Route path="/profile" element={
                            isAuthenticated ? 
                            <Profile /> : 
                            <Navigate to="/login" replace />
                        } />
                        
                        <Route path="/profile/edit" element={
                            isAuthenticated ? 
                            <ProfileEdit /> : 
                            <Navigate to="/login" replace />
                        } />
                    </Routes>
                </main>

                <footer className="app-footer">
                    <p>&copy; {new Date().getFullYear()} Smart Manager. All rights reserved.</p>
                </footer>

                {showLogoutConfirm && (
                    <div className="overlay">
                        <div className="logout-confirm">
                            <p>Bạn có chắc chắn muốn đăng xuất không?</p>
                            <div className="button-group">
                                <button onClick={handleLogout} className="btn btn-danger">
                                    Đồng ý
                                </button>
                                <button 
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="btn btn-secondary"
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BrowserRouter>
    );
};

export default App;