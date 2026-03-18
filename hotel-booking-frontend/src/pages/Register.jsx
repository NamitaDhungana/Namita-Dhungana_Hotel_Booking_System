import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import "./Register.css";
import authService from "../services/authService";

function Register() {
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        phone: formData.phone,
        role: formData.role,
        pan_number: formData.role === "admin" ? formData.pan_number : null,
      });

      message.success("Registration successful! Check your email.");
      setTimeout(() => {
        navigate("/login?message=Registration successful! Please check your email and verify your account before logging in.");
      }, 1500);
    } catch (error) {
      console.error("Registration failed:", error);
      
      // Better error handling for Laravel validation errors
      if (error.errors) {
        const errorList = Object.values(error.errors).flat();
        errorList.forEach(err => message.error(err));
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
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
          
          {formData.role === "admin" && (
            <div className="pan-input-container">
               <input type="text" name="pan_number" placeholder="Business PAN Number" value={formData.pan_number} onChange={handleChange} />
               <small style={{ color: '#92400e', fontSize: '0.75rem', display: 'block', marginTop: '-10px', marginBottom: '10px' }}>Required for verification</small>
            </div>
          )}

          <input type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
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
