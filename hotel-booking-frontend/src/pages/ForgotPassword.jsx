import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { App } from "antd";
import authService from "../services/authService";
import "./Login.css";

// Step 1: Enter email
// Step 2: Enter 6-digit code
// Step 3: Enter new password

function ForgotPassword() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) return setError("Email is required.");
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      message.success("Reset code sent to your email.");
      setStep(2);
    } catch (err) {
      setError(err?.errors?.email?.[0] || err?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 6) return setError("Enter the 6-digit code.");
    if (!password) return setError("New password is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword(email, code, password, confirmPassword);
      message.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h2>
        <p className="login-subtitle">
          {step === 1
            ? "Enter your email and we'll send you a reset code."
            : `Enter the 6-digit code sent to ${email} and your new password.`}
        </p>

        {error && <span className="field-error" style={{ display: "block", marginBottom: "12px" }}>{error}</span>}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Email Address"
              className="login-input"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
            <button className="login-button" onClick={handleSendCode} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="6-digit code"
              className="login-input"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
            />
            <input
              type="password"
              placeholder="New Password"
              className="login-input"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="login-input"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            />
            <button className="login-button" onClick={handleVerifyCode} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <p className="register-text" style={{ marginTop: "1rem" }}>
              <span
                style={{ color: "var(--login-primary)", cursor: "pointer", fontWeight: 600 }}
                onClick={() => { setStep(1); setCode(""); setError(""); }}
              >
                Resend code
              </span>
            </p>
          </>
        )}

        <p className="register-text">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
