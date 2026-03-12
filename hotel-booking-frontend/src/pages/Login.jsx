import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import authService from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await authService.login({ email, password });

      // Clear loading before showing alert to provide better feedback
      setLoading(false);
      alert("Login successful!");
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid email or password!");
      alert(err.message || "Invalid email or password!");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">Login</h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Options */}
        <div className="login-options">
          <label>
            <input type="checkbox" /> Remember Me
          </label>
          <a href="#" className="forgot">Forgot Password?</a>
        </div>

        {/* Button */}
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Divider */}
        <div className="divider">
          <span></span>
          <p>or continue with</p>
          <span></span>
        </div>

        {/* Social */}
        <div className="social-login">
          <button className="social-btn google" onClick={() => alert("Google Login is not configured yet.")}>
            <FaGoogle className="icon" /> Google
          </button>
          <button className="social-btn facebook" onClick={() => alert("Facebook Login is not configured yet.")}>
            <FaFacebook className="icon" /> Facebook
          </button>
        </div>

        {/* Register */}
        <p className="register-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;