import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaChartLine, FaHotel, FaBed, FaCalendarCheck, FaSignOutAlt, FaBell, FaStar } from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-logo">StayHub Admin</div>
                <nav className="sidebar-nav">
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <i><FaChartLine /></i>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/hotels" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <i><FaHotel /></i>
                        <span>Manage Hotels</span>
                    </NavLink>
                    <NavLink to="/admin/rooms" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <i><FaBed /></i>
                        <span>Manage Rooms</span>
                    </NavLink>
                    <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <i><FaCalendarCheck /></i>
                        <span>Bookings</span>
                    </NavLink>
                    <NavLink to="/admin/notifications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <i><FaBell /></i>
                        <span>Notifications</span>
                    </NavLink>
                    <NavLink to="/admin/reviews" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <i><FaStar /></i>
                        <span>Reviews</span>
                    </NavLink>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Admin Portal</h1>
                    <div className="user-info">
                        <span className="user-name">Welcome, Admin</span>
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
