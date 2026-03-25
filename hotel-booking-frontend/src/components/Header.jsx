import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css";
import authService from "../services/authService";
import settingsService from "../services/settingsService";

function Header() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
  const isCustomer = user && user.role === "customer";
  const [siteTitle, setSiteTitle] = useState('StayHub');

  useEffect(() => {
    settingsService.get().then(s => {
      if (s.site_title) {
        setSiteTitle(s.site_title);
        document.title = s.site_title;
      }
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      window.location.reload();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">{siteTitle}</h1>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/hotels">Hotels</Link>
          {isCustomer && <Link to="/my-bookings">My Bookings</Link>}
          {isAdmin && <Link to={user.role === 'super_admin' ? '/super-admin' : '/admin'} className="admin-link">Dashboard</Link>}
          {!user && <Link to="/contact">Contact</Link>}
        </nav>

        {user ? (
          <div className="user-nav">
            <span className="user-name">Hello, {user.name}</span>
            <button className="login-btn" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link className="login-btn" to="/login">Login</Link>
        )}
      </div>
    </header>
  );
}

export default Header;
