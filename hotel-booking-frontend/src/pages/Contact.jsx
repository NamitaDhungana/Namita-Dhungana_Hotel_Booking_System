import React, { useState } from 'react';
import "./Home.css"; // Reuse some section styles

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="section" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="section-title">Get In Touch</h1>
      <p className="section-subtitle">Have questions? We'd love to hear from you.</p>

      <div className="contact-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px' }}>
        <div className="contact-info">
          <h3>Contact Info</h3>
          <p>📍 Thamel, Kathmandu, Nepal</p>
          <p>📞 +977 01-4444444</p>
          <p>📧 support@stayhub.com</p>

          <div style={{ marginTop: '30px' }}>
            <h3>Business Hours</h3>
            <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
            <p>Sat - Sun: 10:00 AM - 4:00 PM</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text" name="name" placeholder="Your Name" required
            value={formData.name} onChange={handleChange}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input
            type="email" name="email" placeholder="Your Email" required
            value={formData.email} onChange={handleChange}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input
            type="text" name="subject" placeholder="Subject" required
            value={formData.subject} onChange={handleChange}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <textarea
            name="message" placeholder="Your Message" rows="5" required
            value={formData.message} onChange={handleChange}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
          ></textarea>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '15px', borderRadius: '8px', border: 'none', background: '#2d6cdf', color: 'white', fontWeight: 'bold' }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;