import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import authService from "../services/authService";

function Header() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
  const isCustomer = user && user.role === "customer";

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
      window.location.reload(); // Secondary reload to ensure state is clean
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API fails, clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      window.location.reload();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">StayHub</h1>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/hotels">Hotels</Link>
          <Link to="/rooms">Rooms</Link>
          
          {/* Role-based Links */}
          {isCustomer && <Link to="/userProfile">My Bookings</Link>}
          {isAdmin && <Link to="/admin" className="admin-link">Dashboard</Link>}
          
          {!user && <Link to="/contact">Contact</Link>}
        </nav>

        {user ? (
          <div className="user-nav">
            <span className="user-name">Hello, {user.name}</span>
            <button className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link className="login-btn" to="/login">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
