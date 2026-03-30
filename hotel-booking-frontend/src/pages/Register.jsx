import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { App } from "antd";
import "./Register.css";
import authService from "../services/authService";

const Field = ({ name, type = "text", placeholder, value, onChange, error }) => (
  <div className="reg-field">
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={error ? "reg-input-error" : ""}
    />
    {error && <span className="reg-error-msg">{error}</span>}
  </div>
);

function Register() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "customer",
    pan_number: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleRegister = async () => {
    // Client-side required field check
    const clientErrors = {};
    if (!formData.name.trim()) clientErrors.name = "The name field is required.";
    if (!formData.email.trim()) clientErrors.email = "The email field is required.";
    if (!formData.phone.trim()) clientErrors.phone = "The phone number field is required.";
    if (!formData.password) {
      clientErrors.password = "The password field is required.";
    } else {
      const passwordErrors = [];
      if (formData.password.length < 8) passwordErrors.push("The password field must be at least 8 characters.");
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) passwordErrors.push("The password field must match confirm password.");
      if (passwordErrors.length > 0) clientErrors.password = passwordErrors.join(" ");
    }
    if (!formData.confirmPassword) clientErrors.confirmPassword = "Please confirm your password.";
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        phone: formData.phone,
        role: formData.role,
        pan_number: formData.role === "admin" ? formData.pan_number : null,
      });

      message.success("Verification code sent to your email!", 3);
      navigate("/verify-email", { state: { userId: response.user_id } });
    } catch (error) {
      console.error("Registration failed:", error);

      if (error.errors) {
        // Map Laravel field names to our formData keys
        const fieldMap = { name: "name", email: "email", password: "password", phone: "phone", pan_number: "pan_number" };
        const mapped = {};
        Object.entries(error.errors).forEach(([key, msgs]) => {
          const field = fieldMap[key] || key;
          mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
      } else {
        message.error(error.message || "Registration failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-box">
        <h2>Join StayHub</h2>
        <p className="reg-subtitle">Create an account to start your journey</p>

        <div className="role-selection">
          <label className="role-label">
            <input type="radio" name="role" value="customer" checked={formData.role === "customer"} onChange={handleChange} />
            Customer
          </label>
          <label className="role-label">
            <input type="radio" name="role" value="admin" checked={formData.role === "admin"} onChange={handleChange} />
            Hotel Manager
          </label>
        </div>

        <div className="form-group">
          <Field name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} error={errors.name} />
          <Field name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} error={errors.email} />
          <Field name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} error={errors.phone} />

          {formData.role === "admin" && (
            <div className="pan-input-container">
              <Field name="pan_number" placeholder="Business PAN Number" value={formData.pan_number} onChange={handleChange} error={errors.pan_number} />
              <small style={{ color: '#92400e', fontSize: '0.75rem', display: 'block', marginTop: '-6px', marginBottom: '10px' }}>
                Required for verification
              </small>
            </div>
          )}

          <Field name="password" type="password" placeholder="Create Password" value={formData.password} onChange={handleChange} error={errors.password} />
          <Field name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
        </div>

        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Creating Account..." : "Register Now"}
        </button>

        <p>Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}

export default Register;
