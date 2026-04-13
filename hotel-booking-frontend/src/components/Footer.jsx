import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useEffect, useState } from "react";
import settingsService from "../services/settingsService";
import "./Footer.css";

function Footer() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    settingsService.get().then(setSettings).catch(() => {});
  }, []);

  const siteTitle = settings.site_title || 'StayHub';

  const footerContents = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Hotels", path: "/hotels" },
        { name: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "FAQ", path: "/faq" },
        { name: "Privacy Policies", path: "/privacy-policies" },
        { name: "Terms of Services", path: "/terms-of-services" },
      ],
    },
    {
      title: "Connect with Us",
      links: [
        { icon: <FaFacebook />, path: "https://www.facebook.com/" },
        { icon: <FaInstagram />, path: "https://www.instagram.com/nameeta_10/" },
        { icon: <FaLinkedin />, path: "https://www.linkedin.com/feed/" },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {footerContents.map((section, i) => (
          <div key={i} className="footer-section">
            <h3 className="footer-title">{section.title}</h3>
            <ul className="footer-links">
              {section.links.map((link, idx) => (
                <li key={idx}>
                  {link.name ? (
                    <Link to={link.path} className="footer-link">{link.name}</Link>
                  ) : (
                    <a href={link.path} className="footer-icon" target="_blank" rel="noreferrer">{link.icon}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="footer-bottom">
        © {new Date().getFullYear()} {siteTitle}. All Rights Reserved.
      </p>
    </footer>
  );
}

export default Footer;
