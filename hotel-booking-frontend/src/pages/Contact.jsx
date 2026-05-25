import React, { useState, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaPhone, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import settingsService from '../services/settingsService';
import apiClient from '../services/apiClient';
import "./Home.css";

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [settings, setSettings] = useState({});

  useEffect(() => {
    settingsService.get().then(setSettings).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await apiClient.post('/contact', formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      setFormError(err?.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const phones = settings.phone_numbers
    ? settings.phone_numbers.split(',').map(p => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="section" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
      <h1 className="section-title">Get In Touch</h1>
      <p className="section-subtitle">Have questions? We'd love to hear from you.</p>

      {success && (
        <div style={{
          background: 'linear-gradient(135deg, #1cc88a, #17a673)', color: 'white',
          padding: '16px 24px', borderRadius: '12px', marginTop: '20px',
          display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: '600',
        }}>
          <span style={{ fontSize: '1.4rem' }}>✅</span>
          Thank you for your message! We will get back to you soon.
        </div>
      )}

      <div className="contact-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px' }}>
        <div className="contact-info">
          <h3>Contact Info</h3>

          {settings.address && (
            <p style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <FaMapMarkerAlt style={{ marginTop: 3, flexShrink: 0 }} />
              {settings.address}
            </p>
          )}

          {phones.length > 0 ? phones.map((p, i) => (
            <p key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaPhone /> {p}
            </p>
          )) : (
            <p><FaPhone /> +977 01-4444444</p>
          )}

          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaEnvelope /> support@stayhub.com
          </p>

          {(settings.facebook_url || settings.instagram_url || settings.twitter_url) && (
            <div style={{ marginTop: 20, display: 'flex', gap: 14 }}>
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" style={{ color: '#1877f2', fontSize: 22 }}><FaFacebook /></a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" style={{ color: '#e1306c', fontSize: 22 }}><FaInstagram /></a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noreferrer" style={{ color: '#1da1f2', fontSize: 22 }}><FaTwitter /></a>
              )}
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h3>Business Hours</h3>
            <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
            <p>Sat - Sun: 10:00 AM - 4:00 PM</p>
          </div>

          {settings.map_iframe && (
            <div style={{ marginTop: 20, borderRadius: 8, overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: settings.map_iframe }} />
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="name" placeholder="Your Name" required value={formData.name} onChange={handleChange}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input type="email" name="email" placeholder="Your Email" required value={formData.email} onChange={handleChange}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input type="text" name="subject" placeholder="Subject" required value={formData.subject} onChange={handleChange}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <textarea name="message" placeholder="Your Message" rows="5" required value={formData.message} onChange={handleChange}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }} />
          {formError && (
            <div style={{ background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}>
              ⚠️ {formError}
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={submitting}
            style={{ padding: '15px', borderRadius: '8px', border: 'none', background: submitting ? '#aaa' : '#2d6cdf', color: 'white', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
