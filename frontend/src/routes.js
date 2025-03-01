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

export const routes = [
    {
        path: '/',
        exact: true,
        component: Home,
        name: 'Trang chủ'
    },
    {
        path: '/contact',
        component: Contact,
        name: 'Liên hệ',
        roles: ['customer']
    },
    {
        path: '/customers',
        component: Customer,
        name: 'Khách hàng',
        roles: ['admin', 'sales', 'engineering', 'account']
    },
    {
        path: '/register',
        component: Register,
        name: 'Đăng ký',
        public: true
    },
    {
        path: '/login',
        component: Login,
        name: 'Đăng nhập',
        public: true
    },
    {
        path: '/job-requests',
        component: JobRequest,
        name: 'Yêu cầu công việc',
        roles: ['admin', 'account', 'sales', 'customer']
    },
    {
        path: '/quotes',
        component: Quote,
        name: 'Báo giá',
        roles: ['admin', 'sales', 'engineering']
    },
    {
        path: '/schedules',
        component: Schedule,
        name: 'Lịch trình',
        roles: ['admin', 'sales', 'engineering']
    },
    {
        path: '/invoices',
        component: Invoice,
        name: 'Hóa đơn',
        roles: ['admin', 'account']
    },
    {
        path: '/reports',
        component: Report,  
        name: 'Báo cáo',
        roles: ['admin', 'account']
    }
];

export const checkPermission = (path) => {
    const route = routes.find(r => r.path === path);
    const userRole = localStorage.getItem('userRole');
    
    if (!route) return false;
    if (route.public) return true;
    if (!route.roles) return true;
    
    return route.roles.includes(userRole);
};