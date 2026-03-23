import React, { useState, useEffect } from 'react';
import { FaRupeeSign, FaHotel, FaUsers, FaCalendarCheck, FaCheckCircle } from 'react-icons/fa';
import adminService from '../../services/adminService';
import authService from '../../services/authService';

const AdminDashboard = () => {
    const user = authService.getCurrentUser();
    const isSuperAdmin = user?.role === 'super_admin';

    const [stats, setStats] = useState({
        total_revenue: 0,
        total_hotels: 0,
        total_bookings: 0,
        active_bookings: 0,
        total_users: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getDashboardStats()
            .then(data => setStats(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        {
            label: 'Total Revenue',
            value: `Rs. ${Number(stats.total_revenue).toLocaleString()}`,
            icon: <FaRupeeSign />,
            cls: 'icon-blue',
        },
        {
            label: isSuperAdmin ? 'All Hotels' : 'My Hotels',
            value: stats.total_hotels,
            icon: <FaHotel />,
            cls: 'icon-green',
        },
        {
            label: 'Total Bookings',
            value: stats.total_bookings,
            icon: <FaCalendarCheck />,
            cls: 'icon-yellow',
        },
        {
            label: 'Active Bookings',
            value: stats.active_bookings,
            icon: <FaCheckCircle />,
            cls: 'icon-red',
        },
        ...(isSuperAdmin ? [{
            label: 'Total Users',
            value: stats.total_users,
            icon: <FaUsers />,
            cls: 'icon-blue',
        }] : []),
    ];

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div>
            {/* Welcome Banner */}
            <div className={`dashboard-welcome${isSuperAdmin ? ' super-admin-welcome' : ''}`}>
                <h2>{isSuperAdmin ? 'Welcome Super Admin' : 'Welcome Admin'}</h2>
                <p>
                    {isSuperAdmin
                        ? 'You have full system access. Manage all hotels, users, bookings, and reviews.'
                        : 'Manage your hotels, rooms, bookings, and reviews from here.'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {cards.map(card => (
                    <div className="stat-card" key={card.label}>
                        <div className="stat-info">
                            <h3>{card.label}</h3>
                            <div className="stat-value">{card.value}</div>
                        </div>
                        <div className={`stat-icon ${card.cls}`}>{card.icon}</div>
                    </div>
                ))}
            </div>

            {/* Placeholder panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '22px', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#333' }}>Recent Bookings</h3>
                    <p style={{ color: '#aaa', fontSize: '13px' }}>Recent activity will appear here.</p>
                </div>
                <div style={{ background: '#fff', padding: '22px', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#333' }}>Revenue Overview</h3>
                    <p style={{ color: '#aaa', fontSize: '13px' }}>Visual data representation coming soon.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
