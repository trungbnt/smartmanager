import React from 'react';
import '../styles/pages.css';

function Home() {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Smart Manager</h1>
                <p>Quản lý doanh nghiệp của bạn một cách hiệu quả</p>
            </header>
            <section className="features">
                <h2>Chức năng chính</h2>
                <div className="feature-list">
                    <div className="feature-item">
                        <h3>Quản lý Khách hàng</h3>
                        <p>Quản lý thông tin khách hàng một cách dễ dàng.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Theo dõi Yêu cầu Công việc</h3>
                        <p>Giám sát và theo dõi các yêu cầu công việc.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Tạo Báo giá</h3>
                        <p>Thực hiện báo giá nhanh chóng và chính xác.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Lịch trình Công việc</h3>
                        <p>Quản lý lịch trình công việc hiệu quả.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Hóa đơn</h3>
                        <p>Quản lý hóa đơn và thanh toán dễ dàng.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Báo cáo</h3>
                        <p>Xem báo cáo và phân tích dữ liệu kinh doanh.</p>
                    </div>
                </div>
            </section>
            <footer className="home-footer">
                <p>&copy; 2023 Smart Manager. Tất cả quyền được bảo lưu.</p>
            </footer>
        </div>
    );
}

export default Home; 