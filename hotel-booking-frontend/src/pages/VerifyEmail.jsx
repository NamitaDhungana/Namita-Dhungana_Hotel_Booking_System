import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App } from "antd";
import authService from "../services/authService";
import "./VerifyEmail.css";

function VerifyEmail() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    if (!userId) {
      navigate("/register", { replace: true });
    }
  }, [userId, navigate]);

  if (!userId) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...code];
    updated[index] = value.slice(-1);
    setCode(updated);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      message.error("Please enter the complete 6-digit code.");
      return;
    }
    try {
      setLoading(true);
      await authService.verifyEmailCode(userId, fullCode);
      message.success("Email verified successfully! You can now login.");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(error.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await authService.resendVerificationCode(userId);
      message.success("A new code has been sent to your email.");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (error) {
      message.error(error.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-wrapper">
      <div className="verify-box">
        <div className="verify-icon">✉️</div>
        <h2>Verify Your Email</h2>
        <p>We sent a 6-digit code to your email address. Enter it below to activate your account.</p>

        <div className="code-inputs" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="code-input"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button className="verify-btn" onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <p className="resend-text">
          Didn't receive the code?{" "}
          <button className="resend-link" onClick={handleResend} disabled={resending}>
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
