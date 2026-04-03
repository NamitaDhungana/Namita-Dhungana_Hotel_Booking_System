import "./PolicyPages.css";

function TermsOfService() {
  return (
    <div className="policy-page">
      <section className="policy-hero">
        <div className="policy-hero-text">
          <h1>Terms of Service</h1>
          <p>Last updated: January 1, 2025</p>
        </div>
      </section>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using StayHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Use of the Platform</h2>
          <p>You agree to use StayHub only for lawful purposes. You must not:</p>
          <ul>
            <li>Provide false or misleading information during registration or booking</li>
            <li>Attempt to gain unauthorized access to any part of the platform</li>
            <li>Use the platform to harass, abuse, or harm other users</li>
            <li>Engage in any activity that disrupts or interferes with our services</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. StayHub is not liable for any loss resulting from unauthorized account access.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. Bookings and Payments</h2>
          <p>
            All bookings made through StayHub are subject to availability and confirmation. Prices displayed are inclusive of applicable taxes unless stated otherwise. Payment must be completed at the time of booking unless a pay-at-hotel option is available.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Cancellations and Refunds</h2>
          <p>
            Cancellation and refund policies vary by hotel and room type. Please review the specific policy displayed on the booking page before confirming your reservation. StayHub is not responsible for losses arising from cancellations made outside the allowed window.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Reviews and Content</h2>
          <p>
            By submitting a review or any content on StayHub, you grant us a non-exclusive, royalty-free license to use, display, and distribute that content. You are solely responsible for the accuracy and legality of content you submit.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Limitation of Liability</h2>
          <p>
            StayHub acts as an intermediary between guests and hotels. We are not liable for the quality, safety, or legality of the accommodations listed. Our total liability for any claim shall not exceed the amount paid for the booking in question.
          </p>
        </section>

        <section className="policy-section">
          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms of Service at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.
          </p>
        </section>

        <section className="policy-section">
          <h2>9. Contact Us</h2>
          <p>
            For questions about these Terms, please reach out via our <a href="/contact">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;
