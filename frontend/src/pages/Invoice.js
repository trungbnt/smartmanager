import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Invoice() {
    const [invoices, setInvoices] = useState([]);
    const [quoteId, setQuoteId] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const fetchInvoices = async () => {
            const response = await axios.get('/api/invoices');
            setInvoices(response.data);
        };
        fetchInvoices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/invoices', { quoteId, amount });
        setQuoteId('');
        setAmount('');
        // Cập nhật lại danh sách hóa đơn
        const response = await axios.get('/api/invoices');
        setInvoices(response.data);
    };

    return (
        <div>
            <h1>Hóa đơn</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="ID báo giá" value={quoteId} onChange={(e) => setQuoteId(e.target.value)} required />
                <input type="number" placeholder="Số tiền" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                <button type="submit">Tạo hóa đơn</button>
            </form>
            <h2>Danh sách hóa đơn</h2>
            <ul>
                {invoices.map(invoice => (
                    <li key={invoice._id}>{invoice.quoteId.details} - {invoice.amount} - {invoice.status}</li>
                ))}
            </ul>
        </div>
    );
}

export default Invoice; 