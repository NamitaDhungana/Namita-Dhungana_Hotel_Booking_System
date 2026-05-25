import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css";
import authService from "../services/authService";
import settingsService from "../services/settingsService";
function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [siteTitle, setSiteTitle] = useState("StayHub");

  const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
  const isCustomer = user && user.role === "customer";

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
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }
    setUser(null);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          {siteTitle}
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/hotels">Hotels</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {isCustomer && <Link to="/my-bookings">My Bookings</Link>}
          {isAdmin && (
            <Link to={user.role === "super_admin" ? "/super-admin" : "/admin"} className="admin-link">
              Dashboard
            </Link> 
          )}
        </nav>

        {user ? (
          <div className="user-nav">
            <Link to="/userProfile" className="user-name">👤 {user.name}</Link>
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
