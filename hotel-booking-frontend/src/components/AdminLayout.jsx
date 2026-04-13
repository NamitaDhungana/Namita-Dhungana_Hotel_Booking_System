import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    FaChartLine, FaHotel, FaBed, FaDoorOpen, FaCalendarCheck,
    FaSignOutAlt, FaStar, FaUsers, FaConciergeBell,
    FaCog, FaBars, FaTimes, FaUserShield, FaEnvelope, FaBullhorn, FaBell
} from 'react-icons/fa';
import authService from '../services/authService';
import apiClient from '../services/apiClient';
import './AdminLayout.css';

const ADMIN_MENU = [
    { to: '/admin',              label: 'Dashboard',           icon: <FaChartLine />,    end: true },
    { to: '/admin/hotels',       label: 'Manage Hotels',       icon: <FaHotel /> },
    { to: '/admin/room-types',   label: 'Manage Room Types',   icon: <FaBed /> },
    { to: '/admin/rooms',        label: 'Manage Rooms',        icon: <FaDoorOpen /> },
    { to: '/admin/facilities',   label: 'Features and Facilities', icon: <FaConciergeBell /> },
    { to: '/admin/bookings',     label: 'Bookings',            icon: <FaCalendarCheck /> },
    { to: '/admin/reviews',      label: 'Reviews and Ratings',   icon: <FaStar /> },
    { to: '/admin/advertisements', label: 'Advertisements',    icon: <FaBullhorn /> },
    { to: '/admin/notifications', label: 'Notifications',      icon: <FaBell />, badge: true },
];

const SUPER_ADMIN_MENU = [
    { to: '/super-admin',                  label: 'Dashboard',         icon: <FaChartLine />,   end: true },
    { to: '/super-admin/users',            label: 'User Management',   icon: <FaUsers /> },
    { to: '/super-admin/settings',         label: 'System Settings',   icon: <FaCog /> },
    { to: '/super-admin/hotels',           label: 'Hotel Management',  icon: <FaHotel /> },
    { to: '/super-admin/bookings',         label: 'All Bookings',      icon: <FaCalendarCheck /> },
    { to: '/super-admin/reviews',          label: 'Reviews and Ratings', icon: <FaStar /> },
    { to: '/super-admin/contact-queries',  label: 'Contact Queries',   icon: <FaEnvelope /> },
    { to: '/super-admin/advertisements',   label: 'Advertisements',    icon: <FaBullhorn /> },
    { to: '/super-admin/notifications',    label: 'Notifications',     icon: <FaBell />, badge: true },
];

const AdminLayout = ({ role }) => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const isSuperAdmin = role === 'super_admin' || (user && user.role === 'super_admin');
    const [collapsed, setCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const menuItems = isSuperAdmin ? SUPER_ADMIN_MENU : ADMIN_MENU;
    const portalLabel = isSuperAdmin ? 'Super Admin' : 'Admin Portal';
    const welcomeLabel = isSuperAdmin ? `Welcome, ${user?.name || 'Super Admin'}` : `Welcome, ${user?.name || 'Admin'}`;

    // Poll unread notification count every 30s
    useEffect(() => {
        const fetchUnread = () => {
            apiClient.get('/notifications')
                .then(res => {
                    const count = (res.data || []).filter(n => !n.is_read).length;
                    setUnreadCount(count);
                })
                .catch(() => {});
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
        window.location.reload();
    };

    return (
        <div className={`admin-container${collapsed ? ' sidebar-collapsed' : ''}${isSuperAdmin ? ' super-admin-layout' : ''}`}>
            <aside className="admin-sidebar">
                <div className="sidebar-top">
                    <div className="admin-logo">
                        {isSuperAdmin ? <FaUserShield className="logo-icon" /> : <FaHotel className="logo-icon" />}
                        {!collapsed && <span>{portalLabel}</span>}
                    </div>
                    <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
                        {collapsed ? <FaBars /> : <FaTimes />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {!collapsed && <div className="nav-section-label">Navigation</div>}
                    {menuItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!collapsed && <span className="nav-label">{item.label}</span>}
                            {item.badge && unreadCount > 0 && (
                                <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="sidebar-logout" title={collapsed ? 'Logout' : undefined}>
                        <FaSignOutAlt />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <button className="mobile-menu-btn" onClick={() => setCollapsed(c => !c)}>
                            <FaBars />
                        </button>
                    </div>
                    <div className="user-info">
                        <span className={`role-badge ${isSuperAdmin ? 'badge-super' : 'badge-admin'}`}>
                            {isSuperAdmin ? 'Super Admin' : 'Admin'}
                        </span>
                        <span className="user-name">{welcomeLabel}</span>
                        <button onClick={handleLogout} className="logout-btn">
                            <FaSignOutAlt /> <span>Logout</span>
                        </button>
                    </div>
                </header>

                <section className="admin-content">
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;
