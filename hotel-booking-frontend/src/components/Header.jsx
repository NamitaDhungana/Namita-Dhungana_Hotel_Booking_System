import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="header-container">

        <h1 className="logo">StayHub</h1>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/hotels">Hotels</Link>
          <Link to="/rooms">Rooms</Link>
          <Link to="/booking">Booking</Link>
          <Link to="/services">Services</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admin" style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Admin</Link>
        </nav>

        <Link className="login-btn" to="/login">
          Login
        </Link>
      </div>
    </header>
  );
}

export default Header;
