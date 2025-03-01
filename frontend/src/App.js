import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import { routes } from './routes';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/pages.css';

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
        setUserRole(null);
        setUsername(null);
        setIsAuthenticated(false);
        setShowLogoutConfirm(false);
        window.location.href = '/login';
    };

    const handleLogin = (userData) => {
        // Make sure we're getting the correct data
        if (!userData.username) {
            console.error('Username is missing from login response');
            return;
        }

        // Store in localStorage
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('username', userData.username);

        // Update state
        setIsAuthenticated(true);
        setUserRole(userData.role);
        setUsername(userData.username);
    };

    const renderNavLinks = () => {
        const roleRoutes = {
            customer: ['/job-requests', '/contact'],
            sales: ['/customers', '/job-requests', '/quotes', '/schedules'],
            engineering: ['/customers', '/job-requests', '/quotes', '/schedules'],
            account: ['/customers', '/job-requests', '/invoices', '/reports'],
            admin: ['/customers', '/job-requests', '/quotes', '/schedules', '/invoices', '/reports']
        };

        const currentRoutes = roleRoutes[userRole] || [];
        
        return currentRoutes.map(path => {
            const route = routes.find(r => r.path === path);
            return route && (
                <li key={path}>
                    <Link to={path}>{route.name}</Link>
                </li>
            );
        });
    };

    const PrivateRoute = ({ component: Component, roles, ...rest }) => (
        <Route {...rest} render={props => {
            if (!isAuthenticated) {
                return <Redirect to={{
                    pathname: '/login',
                    state: { from: props.location }
                }} />;
            }

            if (roles && !roles.includes(userRole)) {
                return <div className="access-denied">
                    <h2>Không có quyền truy cập</h2>
                    <p>Bạn không có quyền truy cập trang này.</p>
                    <Link to="/" className="btn">Về trang chủ</Link>
                </div>;
            }

            return <Component {...props} />;
        }} />
    );

    return (
        <Router>
            <div className="app-container">
                <header className="app-header">
                    <h1>Smart Manager</h1>
                    <nav>
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            {isAuthenticated && renderNavLinks()}
                            <div className="auth-links">
                                {isAuthenticated ? (
                                    <>
                                        <li className="welcome-message">Xin chào, {username}!</li>
                                        <li>
                                            <button 
                                                className="logout-button"
                                                onClick={() => setShowLogoutConfirm(true)}
                                            >
                                                Đăng xuất
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li><Link to="/register">Đăng ký</Link></li>
                                        <li><Link to="/login">Đăng nhập</Link></li>
                                    </>
                                )}
                            </div>
                        </ul>
                    </nav>
                </header>

                <main className="app-main">
                    <Switch>
                        <Route exact path="/login" 
                            render={(props) => !isAuthenticated 
                                ? <Login {...props} onLogin={handleLogin} /> 
                                : <Redirect to="/" />
                            } 
                        />
                        <Route exact path="/register" 
                            render={(props) => !isAuthenticated 
                                ? <Register {...props} /> 
                                : <Redirect to="/" />
                            } 
                        />
                        {routes.map(({ path, component: Component, roles, exact }) => (
                            <PrivateRoute 
                                key={path}
                                path={path}
                                exact={exact}
                                component={Component}
                                roles={roles}
                            />
                        ))}
                        <Redirect from="*" to="/" />
                    </Switch>
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
        </Router>
    );
};

export default App;