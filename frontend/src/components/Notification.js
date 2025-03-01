import React from 'react';

const Notification = ({ message, type, onClose }) => {
    return (
        <div className={`notification ${type}`}>
            <span>{message}</span>
            <button onClick={onClose} className="notification-close">&times;</button>
        </div>
    );
};

export default Notification;