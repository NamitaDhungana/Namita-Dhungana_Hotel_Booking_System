import { useState, useEffect, useCallback } from 'react';
import { FaBell, FaCheck, FaCheckDouble, FaCalendarCheck, FaUserCheck, FaUserTimes, FaStar, FaHotel } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import './AdminNotifications.css';

const TYPE_CONFIG = {
    new_booking:               { icon: <FaCalendarCheck />, color: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
    booking_status:            { icon: <FaCalendarCheck />, color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
    registration_approved:     { icon: <FaUserCheck />,     color: '#16a34a', bg: 'rgba(22,163,74,0.10)'  },
    registration_rejected:     { icon: <FaUserTimes />,     color: '#dc2626', bg: 'rgba(220,38,38,0.10)'  },
    new_manager_registration:  { icon: <FaHotel />,         color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    review_submitted:          { icon: <FaStar />,          color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
};

const getConfig = (type) => TYPE_CONFIG[type] || { icon: <FaBell />, color: '#6366f1', bg: 'rgba(99,102,241,0.10)' };

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [filter, setFilter]               = useState('all'); // all | unread | read

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/notifications');
            setNotifications(res.data || []);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const markRead = async (id) => {
        try {
            await apiClient.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
            );
        } catch {}
    };

    const markAllRead = async () => {
        try {
            await apiClient.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch {}
    };

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'read')   return n.is_read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="an-page">
            <div className="an-header">
                <div className="an-title-wrap">
                    <h2>Notifications</h2>
                    {unreadCount > 0 && <span className="an-unread-badge">{unreadCount} unread</span>}
                </div>
                <div className="an-actions">
                    <div className="an-filter-tabs">
                        {['all', 'unread', 'read'].map(f => (
                            <button key={f} className={`an-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    {unreadCount > 0 && (
                        <button className="an-mark-all" onClick={markAllRead}>
                            <FaCheckDouble /> Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div className="an-list">
                {loading ? (
                    <div className="an-empty">Loading notifications...</div>
                ) : filtered.length === 0 ? (
                    <div className="an-empty">
                        <FaBell style={{ fontSize: 36, color: '#cbd5e1', marginBottom: 12 }} />
                        <p>No {filter !== 'all' ? filter : ''} notifications</p>
                    </div>
                ) : (
                    filtered.map(n => {
                        const cfg = getConfig(n.type);
                        return (
                            <div key={n.notification_id} className={`an-item${n.is_read ? ' an-read' : ' an-unread'}`}>
                                <div className="an-icon-wrap" style={{ background: cfg.bg, color: cfg.color }}>
                                    {cfg.icon}
                                </div>
                                <div className="an-body">
                                    <div className="an-item-title">{n.title}</div>
                                    <div className="an-item-msg">{n.message}</div>
                                    <div className="an-item-time">{timeAgo(n.created_at)}</div>
                                </div>
                                {!n.is_read && (
                                    <button className="an-mark-btn" title="Mark as read" onClick={() => markRead(n.notification_id)}>
                                        <FaCheck />
                                    </button>
                                )}
                                {n.is_read && <span className="an-read-dot" title="Read" />}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
