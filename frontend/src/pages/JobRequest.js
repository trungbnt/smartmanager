import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

function JobRequest() {
    const [jobRequests, setJobRequests] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchJobRequests = async () => {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/job-requests', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setJobRequests(response.data);
        };
        fetchJobRequests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/auth/job-requests', { title, description }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setTitle('');
        setDescription('');
        // Cập nhật lại danh sách yêu cầu công việc
        const response = await axios.get('http://localhost:5000/api/auth/job-requests', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setJobRequests(response.data);
    };

    const handleEdit = (id) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'account') {
            setMessage('Người dùng không có quyền chỉnh sửa');
            setShowPopup(true);
            return;
        }
        // Logic để sửa yêu cầu công việc
        console.log('Edit request with ID:', id);
    };

    const handleDelete = async (id) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'account') {
            setMessage('Người dùng không có quyền xóa');
            setShowPopup(true);
            return;
        }
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/auth/job-requests/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // Cập nhật lại danh sách yêu cầu công việc
        const response = await axios.get('http://localhost:5000/api/auth/job-requests', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setJobRequests(response.data);
    };

    return (
        <div>
            <h1>Yêu cầu công việc</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <textarea placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <button type="submit">Gửi yêu cầu</button>
            </form>
            <h2>Danh sách yêu cầu công việc</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tiêu đề</th>
                        <th>Mô tả</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {jobRequests.map(request => (
                        <tr key={request._id}>
                            <td>{request.title}</td>
                            <td>{request.description}</td>
                            <td>{request.status}</td>
                            <td>
                                <FaEdit onClick={() => handleEdit(request._id)} style={{ cursor: 'pointer', marginRight: '10px' }} />
                                <FaTrash onClick={() => handleDelete(request._id)} style={{ cursor: 'pointer', color: 'red' }} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pop-up thông báo */}
            {showPopup && (
                <div className="popup">
                    <p>{message}</p>
                    <button onClick={() => setShowPopup(false)}>Đóng</button>
                </div>
            )}
        </div>
    );
}

export default JobRequest; 