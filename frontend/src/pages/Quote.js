import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Quote() {
    const [quotes, setQuotes] = useState([]);
    const [jobRequestId, setJobRequestId] = useState('');
    const [amount, setAmount] = useState('');
    const [details, setDetails] = useState('');

    useEffect(() => {
        const fetchQuotes = async () => {
            const response = await axios.get('/api/quotes');
            setQuotes(response.data);
        };
        fetchQuotes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/quotes', { jobRequestId, amount, details });
        setJobRequestId('');
        setAmount('');
        setDetails('');
        // Cập nhật lại danh sách báo giá
        const response = await axios.get('/api/quotes');
        setQuotes(response.data);
    };

    return (
        <div>
            <h1>Báo giá</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="ID yêu cầu công việc" value={jobRequestId} onChange={(e) => setJobRequestId(e.target.value)} required />
                <input type="number" placeholder="Số tiền" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                <textarea placeholder="Chi tiết" value={details} onChange={(e) => setDetails(e.target.value)} required />
                <button type="submit">Gửi báo giá</button>
            </form>
            <h2>Danh sách báo giá</h2>
            <ul>
                {quotes.map(quote => (
                    <li key={quote._id}>{quote.jobRequestId.title} - {quote.amount} - {quote.status}</li>
                ))}
            </ul>
        </div>
    );
}

export default Quote; 