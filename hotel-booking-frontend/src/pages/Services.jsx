import React from 'react';
import "./Home.css"; // Reuse some section styles

function Services() {
  const servicesList = [
    { title: "Free Wi-Fi", icon: "🌐", desc: "High-speed internet in all rooms and public areas." },
    { title: "24/7 Security", icon: "🛡️", desc: "Your safety is our top priority with around-the-clock surveillance." },
    { title: "Luxury Spa", icon: "🧖‍♀️", desc: "Relax and rejuvenate with our premium spa services." },
    { title: "Fine Dining", icon: "🍽️", desc: "Taste local and international cuisines from expert chefs." },
    { title: "Airport Pickup", icon: "🚗", desc: "Complimentary shuttle service from the airport to your stay." },
    { title: "Swimming Pool", icon: "🏊‍♂️", desc: "Enjoy our temperature-controlled infinity pools." },
  ];

  return (
    <div className="section">
      <h1 className="section-title">Our Premium Services</h1>
      <p className="section-subtitle">We provide the best utilities for your comfortable stay</p>

      <div className="category-grid">
        {servicesList.map((service, idx) => (
          <div key={idx} className="category-card" style={{ textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;