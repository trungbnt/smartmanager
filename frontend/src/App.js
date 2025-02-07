import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Customer from './pages/Customer';
import Register from './pages/Register';
import Login from './pages/Login';
import JobRequest from './pages/JobRequest';
import Quote from './pages/Quote';
import Schedule from './pages/Schedule';
import Invoice from './pages/Invoice';
import Report from './pages/Report';
// Import thêm các trang khác

function App() {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [username, setUsername] = useState(localStorage.getItem('username'));

    useEffect(() => {
        const handleStorageChange = () => {
            setUserRole(localStorage.getItem('userRole'));
            setUsername(localStorage.getItem('username'));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        setUserRole(null);
        setUsername(null);
        window.location.href = '/'; // Quay về trang chủ
    };

    return (
        <Router>
            <div>
                <header>
                    <h1>Smart Manager</h1>
                    <nav>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            {userRole === 'customer' && (
                                <>
                                    <li><Link to="/customers">Customers</Link></li>
                                    <li><Link to="/job-requests">Job Requests</Link></li>
                                    <li><Link to="/contact">Contact</Link></li>
                                </>
                            )}
                            {userRole === 'sales' || userRole === 'engineering' ? (
                                <>
                                    <li><Link to="/quotes">Quotes</Link></li>
                                    <li><Link to="/schedules">Schedules</Link></li>
                                </>
                            ) : null}
                            {userRole === 'account' ? (
                                <>
                                    <li><Link to="/invoices">Invoices</Link></li>
                                    <li><Link to="/reports">Reports</Link></li>
                                </>
                            ) : null}
                            {userRole === 'admin' && (
                                <>
                                    <li><Link to="/customers">Customers</Link></li>
                                    <li><Link to="/job-requests">Job Requests</Link></li>
                                    <li><Link to="/quotes">Quotes</Link></li>
                                    <li><Link to="/schedules">Schedules</Link></li>
                                    <li><Link to="/invoices">Invoices</Link></li>
                                    <li><Link to="/reports">Reports</Link></li>
                                </>
                            )}
                            {username ? (
                                <>
                                    <li style={{ float: 'right' }}>Xin chào, {username}!</li>
                                    <li style={{ float: 'right' }}>
                                        <button onClick={() => setShowLogoutConfirm(true)}>Đăng xuất</button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li style={{ float: 'right' }}><Link to="/register">Đăng ký</Link></li>
                                    <li style={{ float: 'right' }}><Link to="/login">Đăng nhập</Link></li>
                                </>
                            )}
                        </ul>
                    </nav>
                </header>
                <main>
                    <Switch>
                        <Route path="/" exact component={Home} />
                        <Route path="/contact" component={Contact} />
                        <Route path="/customers" component={Customer} />
                        <Route path="/register" component={Register} />
                        <Route path="/login" component={Login} />
                        {userRole === 'customer' && <Route path="/job-requests" component={JobRequest} />}
                        {(userRole === 'sales' || userRole === 'engineering') && <Route path="/quotes" component={Quote} />}
                        {(userRole === 'sales' || userRole === 'engineering') && <Route path="/schedules" component={Schedule} />}
                        {userRole === 'account' && <Route path="/invoices" component={Invoice} />}
                        {userRole === 'account' && <Route path="/reports" component={Report} />}
                        {/* Thêm các route khác */}
                    </Switch>
                </main>
                <footer>
                    <p>&copy; 2023 Smart Manager. All rights reserved.</p>
                </footer>

                {/* Pop-up xác nhận đăng xuất */}
                {showLogoutConfirm && (
                    <div className="logout-confirm">
                        <p>Bạn có chắc chắn muốn đăng xuất không?</p>
                        <button onClick={handleLogout}>Đồng ý</button>
                        <button onClick={() => setShowLogoutConfirm(false)}>Hủy bỏ</button>
                    </div>
                )}
            </div>
        </Router>
    );
}

export default App; 