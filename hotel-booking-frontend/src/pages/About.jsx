import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* ========== HERO SECTION ========== */}
      <section className="about-hero">
        <div className="hero-text">
          <h1>About StayHub</h1>
          <p>
            Your ultimate destination for seamless travel experiences. We connect you with the finest hotels and villas across the globe, ensuring comfort and luxury at every step.
          </p>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="stats-section">
        <div className="stat-box">
          <h2>50K+</h2>
          <p>Happy Guests</p>
        </div>
        <div className="stat-box">
          <h2>30</h2>
          <p>Years Experience</p>
        </div>
        <div className="stat-box">
          <h2>30K+</h2>
          <p>Hotels Worldwide</p>
        </div>
        <div className="stat-box">
          <h2>98%</h2>
          <p>Satisfaction Rate</p>
        </div>
      </section>

      {/* ========== OUR STORY SECTION ========== */}
      <section className="story-section">
        <img
          src="https://cdn.loewshotels.com/loewshotels.com-2466770763/cms/cache/v2/5b31675b84c36.jpg/1920x1080/fit/80/018df64cc98ec7e9c4bc676ac7f9ea7f.jpg"
          alt="Luxury Hotel"
          className="story-img"
        />

        <div className="story-text">
          <h2>Our Story</h2>
          <p>
            Founded in 1994, StayHub began with a simple mission: to make hotel booking easier and more reliable. Today, we stand as a leader in the industry, offering a curated selection of properties that cater to every traveler's unique needs.
          </p>
        </div>
      </section>

      {/* ========== MISSION & VISION SECTION ========== */}
      <section className="mv-section">
        <div className="mv-card">
          <h3>Our Mission</h3>
          <p>
            To provide world-class hospitality services through innovative technology and a customer-centric approach, making every journey memorable.
          </p>
        </div>

        <div className="mv-card">
          <h3>Our Vision</h3>
          <p>
            To become the most trusted global platform for travel accommodations, inspiring people to explore the world with confidence and comfort.
          </p>
        </div>
      </section>

      {/* ========== LEADERSHIP TEAM ========== */}
      <section className="team-section">
        <h2>Leadership Team</h2>
        <p>Meet the visionaries behind StayHub’s success</p>

        <div className="team-grid">
          <div className="team-card">
            <img
              src="https://media.istockphoto.com/id/1413766112/photo/successful-mature-businessman-looking-at-camera-with-confidence.jpg?s=612x612&w=0&k=20&c=NJSugBzNuZqb7DJ8ZgLfYKb3qPr2EJMvKZ21Sj5Sfq4="
              alt=""
            />
            <h3>Sara Blakely</h3>
            <p>CEO and Founder</p>
          </div>

          <div className="team-card">
            <img
              src="https://media.istockphoto.com/id/1413766112/photo/successful-mature-businessman-looking-at-camera-with-confidence.jpg?s=612x612&w=0&k=20&c=NJSugBzNuZqb7DJ8ZgLfYKb3qPr2EJMvKZ21Sj5Sfq4="
              alt=""
            />
            <h3>Sara Blakely</h3>
            <p>CEO and Founder</p>
          </div>

          <div className="team-card">
            <img
              src="https://media.istockphoto.com/id/1413766112/photo/successful-mature-businessman-looking-at-camera-with-confidence.jpg?s=612x612&w=0&k=20&c=NJSugBzNuZqb7DJ8ZgLfYKb3qPr2EJMvKZ21Sj5Sfq4="
              alt=""
            />
            <h3>Sara Blakely</h3>
            <p>CEO and Founder</p>
          </div>

          <div className="team-card">
            <img
              src="https://media.istockphoto.com/id/1413766112/photo/successful-mature-businessman-looking-at-camera-with-confidence.jpg?s=612x612&w=0&k=20&c=NJSugBzNuZqb7DJ8ZgLfYKb3qPr2EJMvKZ21Sj5Sfq4="
              alt=""
            />
            <h3>Sara Blakely</h3>
            <p>CEO and Founder</p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default About;
