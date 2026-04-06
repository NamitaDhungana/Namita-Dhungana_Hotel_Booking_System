import { useState } from "react";
import "./FAQ.css";

const faqs = [
  {
    category: "Booking",
    items: [
      {
        q: "How do I make a booking?",
        a: "Browse hotels or rooms, select your dates, and click 'Book Now'. Follow the checkout steps to confirm your reservation.",
      },
      {
        q: "Can I book multiple rooms at once?",
        a: "Yes. Use the 'Multi Booking' feature to add multiple rooms to your cart and check out together.",
      },
      {
        q: "How will I receive my booking confirmation?",
        a: "A confirmation email is sent to your registered email address immediately after a successful booking.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We currently support Khalti for online payments. Cash on arrival may be available depending on the hotel.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All transactions are processed through secure, encrypted payment gateways. We never store your card details.",
      },
      {
        q: "Can I get a refund?",
        a: "Refund eligibility depends on the hotel's cancellation policy. Check the policy on the booking page before confirming.",
      },
    ],
  },
  {
    category: "Account",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Register' on the top navigation, fill in your details, and verify your email to activate your account.",
      },
      {
        q: "I forgot my password. What should I do?",
        a: "Click 'Forgot Password' on the login page and follow the instructions sent to your email.",
      },
      {
        q: "Can I update my profile information?",
        a: "Yes. Go to 'My Profile' after logging in to update your name, phone number, and other details.",
      },
    ],
  },
  {
    category: "Hotels and Rooms",
    items: [
      {
        q: "How do I find hotels in a specific location?",
        a: "Use the search bar on the homepage or the Hotels page to filter by location, dates, and guests.",
      },
      {
        q: "Are the hotel images accurate?",
        a: "All images are provided by the hotel managers and represent the actual property.",
      },
      {
        q: "How are hotel ratings calculated?",
        a: "Ratings are based on verified guest reviews submitted after a completed stay.",
      },
    ],
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState({});

  const toggle = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenIndex((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <div className="faq-hero-text">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to the most common questions about StayHub.</p>
        </div>
      </section>

      <section className="faq-content">
        {faqs.map((cat, catIdx) => (
          <div key={catIdx} className="faq-category">
            <h2 className="faq-category-title">{cat.category}</h2>
            {cat.items.map((item, itemIdx) => {
              const key = `${catIdx}-${itemIdx}`;
              return (
                <div
                  key={itemIdx}
                  className={`faq-item ${openIndex[key] ? "open" : ""}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggle(catIdx, itemIdx)}
                    aria-expanded={!!openIndex[key]}
                  >
                    <span>{item.q}</span>
                    <span className="faq-icon">{openIndex[key] ? "−" : "+"}</span>
                  </button>
                  {openIndex[key] && (
                    <div className="faq-answer">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </section>
    </div>
  );
}

export default FAQ;
