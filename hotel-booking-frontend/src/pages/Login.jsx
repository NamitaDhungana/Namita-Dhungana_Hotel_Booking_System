import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { message as staticMessage, App } from "antd";
import "./Login.css";
import authService from "../services/authService";

function Login() {
  const { message } = App.useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const successMessage = searchParams.get("message");

  const handleLogin = async () => {
    if (!email || !password) {
      message.warning("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await authService.login({ email, password });

      setLoading(false);
      message.success("Login successful!");
      
      setTimeout(() => {
        if (redirectTo) {
          navigate(decodeURIComponent(redirectTo));
        } else {
          const user = response.user;
          if (user.role === 'admin' || user.role === 'super_admin') {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      }, 1500);
    } catch (err) {
      console.error("Login failed:", err);
      const errorMsg = err.message || "Invalid email or password!";
      setError(errorMsg);
      message.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account to continue</p>
        
        {successMessage && (
          <div className="login-success-msg">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="login-error-msg">
            {error}
          </div>
        )}

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


        {/* Register */}
        <p className="register-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;