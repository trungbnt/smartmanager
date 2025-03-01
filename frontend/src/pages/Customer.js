import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Customer() {
    const [customers, setCustomers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            const response = await axios.get('http://localhost:5000/api/customers');
            setCustomers(response.data);
        };
        fetchCustomers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/api/customers', { name, email, phone, address });
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        // Cập nhật lại danh sách khách hàng
        const response = await axios.get('http://localhost:5000/api/customers');
        setCustomers(response.data);
    };

    return (
        <div>
            <h1>Quản lý Khách hàng</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Tên" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="text" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <input type="text" placeholder="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} required />
                <button type="submit">Thêm Khách hàng</button>
            </form>
            <h2>Danh sách Khách hàng</h2>
            <ul>
                {customers.map(customer => (
                    <li key={customer._id}>{customer.name} - {customer.email}</li>
                ))}
            </ul>
        </div>
    );
}

export default Customer; 