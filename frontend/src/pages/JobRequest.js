import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JobRequest() {
    const [jobRequests, setJobRequests] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchJobRequests = async () => {
            const response = await axios.get('/api/job-requests');
            setJobRequests(response.data);
        };
        fetchJobRequests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/job-requests', { title, description });
        setTitle('');
        setDescription('');
        // Cập nhật lại danh sách yêu cầu công việc
        const response = await axios.get('/api/job-requests');
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
            <ul>
                {jobRequests.map(request => (
                    <li key={request._id}>{request.title} - {request.status}</li>
                ))}
            </ul>
        </div>
    );
}

export default JobRequest; 