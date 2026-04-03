import "./PolicyPages.css";

function PrivacyPolicy() {
  return (
    <div className="policy-page">
      <section className="policy-hero">
        <div className="policy-hero-text">
          <h1>Privacy Policy</h1>
          <p>Last updated: January 1, 2025</p>
        </div>
      </section>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to StayHub. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our platform.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Name, email address, and phone number when you register</li>
            <li>Payment information processed securely through our payment partners</li>
            <li>Booking details such as check-in/check-out dates and room preferences</li>
            <li>Reviews and feedback you submit</li>
            <li>Communications you send us via the contact form</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and manage your bookings</li>
            <li>Send booking confirmations and important notifications</li>
            <li>Improve our platform and personalize your experience</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Sharing of Information</h2>
          <p>
            We do not sell your personal data. We may share your information with:
          </p>
          <ul>
            <li>Hotels and property managers to fulfill your bookings</li>
            <li>Payment processors to complete transactions securely</li>
            <li>Service providers who assist in operating our platform</li>
            <li>Law enforcement when required by applicable law</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Opt out of marketing communications at any time</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our <a href="/contact">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
