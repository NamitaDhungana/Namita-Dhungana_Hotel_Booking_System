import React, { useState, useEffect } from 'react';
import { FaBell, FaCheckCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import apiClient from '../services/apiClient';
import './NotificationCenter.css';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            // Fallback dummy
            setNotifications([
                { id: 1, title: 'Booking Confirmed', message: 'Your booking for Deluxe Suite is confirmed.', type: 'success', read: false, created_at: '2026-02-25' },
                { id: 2, title: 'Payment Successful', message: 'We have received your payment for stay #102.', type: 'info', read: true, created_at: '2026-02-24' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await apiClient.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle className="icon-success" />;
            case 'warning': return <FaExclamationTriangle className="icon-warning" />;
            default: return <FaInfoCircle className="icon-info" />;
        }
    };

    return (
        <div className="notification-center">
            <div className="notification-header">
                <h2><FaBell /> Notifications</h2>
                <button className="clear-btn">Mark all as read</button>
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications">No new messages</div>
                ) : (
                    notifications.map(note => (
                        <div key={note.id} className={`notification-item ${note.read ? 'read' : 'unread'}`} onClick={() => markAsRead(note.id)}>
                            <div className="note-icon">{getIcon(note.type)}</div>
                            <div className="note-body">
                                <h4>{note.title}</h4>
                                <p>{note.message}</p>
                                <span className="note-time">{note.created_at}</span>
                            </div>
                            {!note.read && <div className="unread-dot"></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
