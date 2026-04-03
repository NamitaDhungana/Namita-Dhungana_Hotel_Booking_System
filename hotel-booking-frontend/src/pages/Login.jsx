import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { message as staticMessage, App } from "antd";
import "./Login.css";
import authService from "../services/authService";

function Login() {
  const { message } = App.useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const successMessage = searchParams.get("message");

  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      // Remove the message from URL after displaying to prevent it from showing again on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("message");
      setSearchParams(newParams, { replace: true });
    }
  }, [successMessage, message, searchParams, setSearchParams]);

  const handleLogin = async () => {
    const newErrors = { email: "", password: "" };
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }
    setErrors({ email: "", password: "" });
    try {
      setLoading(true);
      const response = await authService.login({ email, password }, rememberMe);

      setLoading(false);
      message.success("Login successful!");
      
      setTimeout(() => {
        if (redirectTo) {
          navigate(decodeURIComponent(redirectTo));
        } else {
          const user = response.user;
          if (user.role === 'super_admin') {
            navigate("/super-admin");
          } else if (user.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      }, 1500);
    } catch (err) {
      console.error("Login failed:", err);
      const errorMsg = err.message || "Invalid email or password!";
      setErrors({ email: errorMsg, password: "" });
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account to continue</p>
        
        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className={`login-input${errors.email ? " input-error" : ""}`}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className={`login-input${errors.password ? " input-error" : ""}`}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
        />
        {errors.password && <span className="field-error">{errors.password}</span>}

        {/* Options */}
        <div className="login-options">
          <label>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember Me
          </label>
          <Link to="/forgot-password" className="forgot">Forgot Password?</Link>
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
