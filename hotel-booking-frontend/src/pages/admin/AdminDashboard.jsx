import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaHotel, FaUsers, FaCalendarCheck } from 'react-icons/fa';
import adminService from '../../services/adminService';
import '../About.css'; // Reusing some base styles if applicable or just standard CSS

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_hotels: 0,
        total_bookings: 0,
        total_users: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                // Fallback dummy data for demo if API fails
                setStats({
                    total_revenue: 125000,
                    total_hotels: 12,
                    total_bookings: 450,
                    total_users: 120
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="dashboard-overview">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <div className="stat-value">${stats.total_revenue.toLocaleString()}</div>
                    </div>
                    <div className="stat-icon icon-blue">
                        <FaDollarSign />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Hotels</h3>
                        <div className="stat-value">{stats.total_hotels}</div>
                    </div>
                    <div className="stat-icon icon-green">
                        <FaHotel />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Bookings</h3>
                        <div className="stat-value">{stats.total_bookings}</div>
                    </div>
                    <div className="stat-icon icon-yellow">
                        <FaCalendarCheck />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Active Users</h3>
                        <div className="stat-value">{stats.total_users}</div>
                    </div>
                    <div className="stat-icon icon-red">
                        <FaUsers />
                    </div>
                </div>
            </div>

            <div className="dashboard-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', minHeight: '300px' }}>
                    <h3>Recent Bookings</h3>
                    <p style={{ color: '#888' }}>Recent activity will appear here.</p>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', minHeight: '300px' }}>
                    <h3>Revenue Growth</h3>
                    <p style={{ color: '#888' }}>Visual data representation coming soon.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
