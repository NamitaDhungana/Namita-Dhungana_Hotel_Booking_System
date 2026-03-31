import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    FaRupeeSign, FaHotel, FaUsers, FaCalendarCheck,
    FaCheckCircle, FaChartBar, FaSyncAlt,
} from 'react-icons/fa';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import adminService from '../../services/adminService';
import authService from '../../services/authService';

/* ── Colour palettes ─────────────────────────────────────── */
const ADMIN_ACCENT   = '#6366f1';
const SUPER_ACCENT   = '#d97706';
const PIE_COLORS     = ['#6366f1', '#10b981', '#f59e0b', '#64748b', '#f43f5e'];

/* ── Helpers ─────────────────────────────────────────────── */
const fmt = n => `Rs. ${Number(n).toLocaleString()}`;

const StatusBadge = ({ status }) => (
    <span className={`booking-status-badge status-${status}`}>
        {status.replace('_', ' ')}
    </span>
);

const CustomTooltip = ({ active, payload, label, isCurrency }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#f1f5f9',
        }}>
            <p style={{ margin: '0 0 6px', color: '#94a3b8', fontWeight: 600 }}>{label}</p>
            {payload.map(p => (
                <p key={p.dataKey} style={{ margin: '2px 0', color: p.color }}>
                    {p.name}: {isCurrency ? fmt(p.value) : p.value}
                </p>
            ))}
        </div>
    );
};

/* ── Main Component ──────────────────────────────────────── */
const AdminDashboard = () => {
    const user = authService.getCurrentUser();
    const isSuperAdmin = user?.role === 'super_admin';
    const accent = isSuperAdmin ? SUPER_ACCENT : ADMIN_ACCENT;

    const [stats, setStats]         = useState(null);
    const [chartData, setChartData] = useState(null);
    const [months, setMonths]       = useState(6);
    const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
    const [loading, setLoading]     = useState(true);
    const [chartLoading, setChartLoading] = useState(false);

    // Load summary stats once
    useEffect(() => {
        adminService.getDashboardStats()
            .then(data => setStats(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Load chart data whenever months filter changes
    const loadChartData = useCallback(() => {
        setChartLoading(true);
        adminService.getRevenueReport(months)
            .then(data => setChartData(data))
            .catch(() => {})
            .finally(() => setChartLoading(false));
    }, [months]);

    useEffect(() => { loadChartData(); }, [loadChartData]);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner" />
                Loading dashboard…
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Revenue',
            value: fmt(stats?.total_revenue ?? 0),
            icon: <FaRupeeSign />,
            cls: 'icon-indigo',
        },
        {
            label: isSuperAdmin ? 'All Hotels' : 'My Hotels',
            value: stats?.total_hotels ?? 0,
            icon: <FaHotel />,
            cls: 'icon-emerald',
        },
        {
            label: 'Total Bookings',
            value: stats?.total_bookings ?? 0,
            icon: <FaCalendarCheck />,
            cls: 'icon-amber',
        },
        {
            label: 'Active Bookings',
            value: stats?.active_bookings ?? 0,
            icon: <FaCheckCircle />,
            cls: 'icon-rose',
        },
        ...(isSuperAdmin ? [{
            label: 'Total Users',
            value: stats?.total_users ?? 0,
            icon: <FaUsers />,
            cls: 'icon-sky',
        }] : []),
    ];

    const monthlyData  = chartData?.monthly_revenue ?? [];
    const statusDist   = chartData?.status_dist ?? [];
    const recentBooks  = chartData?.recent_bookings ?? [];

    return (
        <div>
            {/* Welcome Banner */}
            <div className={`dashboard-welcome${isSuperAdmin ? ' super-admin-welcome' : ''}`}>
                <h2>{isSuperAdmin ? `Welcome back, ${user?.name ?? 'Super Admin'}` : `Welcome back, ${user?.name ?? 'Admin'}`}</h2>
                <p>
                    {isSuperAdmin
                        ? 'Full system access — manage all hotels, users, bookings, and reviews.'
                        : 'Manage your hotels, rooms, bookings, and reviews from here.'}
                </p>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                {statCards.map(card => (
                    <div className="stat-card" key={card.label}>
                        <div className="stat-info">
                            <h3>{card.label}</h3>
                            <div className="stat-value">{card.value}</div>
                        </div>
                        <div className={`stat-icon ${card.cls}`}>{card.icon}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="dashboard-charts">
                {/* Revenue / Bookings trend */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">
                            <FaChartBar style={{ marginRight: 8, opacity: 0.7 }} />
                            Revenue &amp; Bookings Trend
                        </h3>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {/* Chart type toggle */}
                            <div className="chart-filter-group">
                                <button
                                    className={`chart-filter-btn${chartType === 'area' ? ' active' : ''}`}
                                    onClick={() => setChartType('area')}
                                >Area</button>
                                <button
                                    className={`chart-filter-btn${chartType === 'bar' ? ' active' : ''}`}
                                    onClick={() => setChartType('bar')}
                                >Bar</button>
                            </div>
                            {/* Month filter */}
                            <div className="chart-filter-group">
                                {[3, 6, 12].map(m => (
                                    <button
                                        key={m}
                                        className={`chart-filter-btn${months === m ? ' active' : ''}`}
                                        onClick={() => setMonths(m)}
                                    >{m}M</button>
                                ))}
                            </div>
                            <button
                                className="chart-filter-btn"
                                onClick={loadChartData}
                                title="Refresh"
                                style={{ padding: '4px 8px' }}
                            >
                                <FaSyncAlt style={{ fontSize: 11, opacity: chartLoading ? 0.4 : 1 }} />
                            </button>
                        </div>
                    </div>

                    {chartLoading ? (
                        <div className="dashboard-loading" style={{ height: 220 }}>
                            <div className="spinner" />
                        </div>
                    ) : monthlyData.length === 0 ? (
                        <div className="dashboard-loading" style={{ height: 220, flexDirection: 'column' }}>
                            <p style={{ margin: 0 }}>No data for this period</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            {chartType === 'area' ? (
                                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={accent} stopOpacity={0.25} />
                                            <stop offset="95%" stopColor={accent} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                    <YAxis yAxisId="bk" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip isCurrency={false} />} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue (Rs)" stroke={accent} fill="url(#revGrad)" strokeWidth={2} dot={false} />
                                    <Area yAxisId="bk"  type="monotone" dataKey="bookings" name="Bookings" stroke="#10b981" fill="url(#bkGrad)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            ) : (
                                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                    <YAxis yAxisId="bk" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip isCurrency={false} />} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar yAxisId="rev" dataKey="revenue" name="Revenue (Rs)" fill={accent} radius={[4,4,0,0]} />
                                    <Bar yAxisId="bk"  dataKey="bookings" name="Bookings" fill="#10b981" radius={[4,4,0,0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Booking Status Pie */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">Booking Status</h3>
                    </div>
                    {statusDist.length === 0 ? (
                        <div className="dashboard-loading" style={{ height: 220 }}>
                            <p style={{ margin: 0, fontSize: 13 }}>No booking data</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={statusDist}
                                    cx="50%" cy="45%"
                                    innerRadius={55} outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {statusDist.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="recent-bookings-card">
                <div className="recent-bookings-header">
                    <h3>Recent Bookings</h3>
                    <Link
                        to={isSuperAdmin ? '/super-admin/bookings' : '/admin/bookings'}
                        className="view-all-link"
                    >
                        View all →
                    </Link>
                </div>
                {recentBooks.length === 0 ? (
                    <div style={{ padding: '28px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        No recent bookings found.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Guest</th>
                                    <th>Hotel</th>
                                    <th>Room</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBooks.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ color: '#94a3b8', fontWeight: 600 }}>#{b.id}</td>
                                        <td style={{ fontWeight: 500 }}>{b.guest}</td>
                                        <td>{b.hotel}</td>
                                        <td>{b.room}</td>
                                        <td>{b.check_in}</td>
                                        <td>{b.check_out}</td>
                                        <td style={{ fontWeight: 600 }}>Rs. {Number(b.total_price).toLocaleString()}</td>
                                        <td><StatusBadge status={b.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
