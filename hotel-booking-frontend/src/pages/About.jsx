import { Link } from "react-router-dom";
import "./About.css";

const stats = [
  { value: "50K+", label: "Happy Guests" },
  { value: "30", label: "Years Experience" },
  { value: "500+", label: "Partner Hotels" },
  { value: "98%", label: "Satisfaction Rate" },
];

const values = [
  {
    icon: "✦",
    title: "Trust & Transparency",
    desc: "Every listing is verified. Every price is honest. No hidden fees, no surprises.",
  },
  {
    icon: "✦",
    title: "Curated Quality",
    desc: "We handpick properties that meet our standards for comfort, cleanliness, and service.",
  },
  {
    icon: "✦",
    title: "Guest-First Approach",
    desc: "From booking to checkout, our team is available to ensure a seamless experience.",
  },
];

const team = [
  {
    name: "Alexandra Moore",
    role: "Chief Executive Officer",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  },
  {
    name: "James Harrington",
    role: "Chief Operations Officer",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
  },
  {
    name: "Priya Sharma",
    role: "Head of Guest Experience",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
  },
];

function About() {
  return (
    <div className="ab-page">

      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-hero-inner">
          <span className="ab-eyebrow">Our Story</span>
          <h1>Redefining the Way<br />You Experience Travel</h1>
          <p>
            Since 1994, StayHub has connected travellers with exceptional stays —
            from boutique guesthouses to five-star resorts — with simplicity and care.
          </p>
          <Link to="/hotels" className="ab-cta">Explore Hotels</Link>
        </div>
      </section>

      {/* STATS */}
      <section className="ab-stats">
        {stats.map((s, i) => (
          <div key={i} className="ab-stat">
            <span className="ab-stat-value">{s.value}</span>
            <span className="ab-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* STORY */}
      <section className="ab-story">
        <div className="ab-story-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"
            alt="Luxury hotel lobby"
          />
        </div>
        <div className="ab-story-text">
          <span className="ab-eyebrow">Who We Are</span>
          <h2>Built on a Passion for Hospitality</h2>
          <p>
            StayHub was founded with a single belief — that finding the perfect place to stay
            should be effortless. Over three decades, we've grown into a trusted platform
            serving travellers across Nepal and beyond.
          </p>
          <p>
            We work closely with hotel partners to ensure every property on our platform
            delivers on its promise, so you can book with complete confidence.
          </p>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="ab-mv">
        <div className="ab-mv-card">
          <div className="ab-mv-icon">◈</div>
          <h3>Our Mission</h3>
          <p>
            To make world-class hospitality accessible to every traveller through
            technology, transparency, and a relentless focus on the guest experience.
          </p>
        </div>
        <div className="ab-mv-divider" />
        <div className="ab-mv-card">
          <div className="ab-mv-icon">◈</div>
          <h3>Our Vision</h3>
          <p>
            To become the most trusted travel accommodation platform in South Asia —
            inspiring people to explore with confidence, comfort, and joy.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="ab-values">
        <div className="ab-section-header">
          <span className="ab-eyebrow">What We Stand For</span>
          <h2>Our Core Values</h2>
        </div>
        <div className="ab-values-grid">
          {values.map((v, i) => (
            <div key={i} className="ab-value-card">
              <span className="ab-value-icon">{v.icon}</span>
              <h4>{v.title}</h4>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="ab-team">
        <div className="ab-section-header">
          <span className="ab-eyebrow">The People Behind StayHub</span>
          <h2>Leadership Team</h2>
        </div>
        <div className="ab-team-grid">
          {team.map((m, i) => (
            <div key={i} className="ab-team-card">
              <div className="ab-team-img-wrap">
                <img src={m.img} alt={m.name} />
              </div>
              <div className="ab-team-info">
                <h4>{m.name}</h4>
                <span>{m.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="ab-banner">
        <h2>Ready to find your perfect stay?</h2>
        <p>Browse hundreds of verified hotels and book with confidence.</p>
        <Link to="/hotels" className="ab-cta ab-cta-dark">Browse Hotels</Link>
      </section>

    </div>
  );
}

export default About;
