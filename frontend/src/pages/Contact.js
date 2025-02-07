import React from 'react';

function Contact() {
    return (
        <div>
            <h1>Gửi yêu cầu công việc</h1>
            <form>
                <label>Tên:</label>
                <input type="text" name="name" required />
                <label>Email:</label>
                <input type="email" name="email" required />
                <label>Nội dung:</label>
                <textarea name="message" required></textarea>
                <button type="submit">Gửi</button>
            </form>
        </div>
    );
}

export default Contact; 