import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Schedule() {
    const [schedules, setSchedules] = useState([]);
    const [jobRequestId, setJobRequestId] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        const fetchSchedules = async () => {
            const response = await axios.get('/api/schedules');
            setSchedules(response.data);
        };
        fetchSchedules();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/schedules', { jobRequestId, vehicleId, startTime, endTime });
        setJobRequestId('');
        setVehicleId('');
        setStartTime('');
        setEndTime('');
        // Cập nhật lại danh sách lịch trình
        const response = await axios.get('/api/schedules');
        setSchedules(response.data);
    };

    return (
        <div>
            <h1>Lịch trình</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="ID yêu cầu công việc" value={jobRequestId} onChange={(e) => setJobRequestId(e.target.value)} required />
                <input type="text" placeholder="ID xe" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required />
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                <button type="submit">Tạo lịch trình</button>
            </form>
            <h2>Danh sách lịch trình</h2>
            <ul>
                {schedules.map(schedule => (
                    <li key={schedule._id}>{schedule.jobRequestId.title} - {schedule.vehicleId} - {schedule.startTime} - {schedule.endTime} - {schedule.status}</li>
                ))}
            </ul>
        </div>
    );
}

export default Schedule; 