import { useState } from "react";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-container">
          {/* Brand */}
          <div className="footer-brand">
            <a
              href="#hero"
              className="logo"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("hero");
              }}
            >
              <span className="logo-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                  <line x1="16" y1="8" x2="2" y2="22" />
                  <line x1="17.5" y1="15" x2="9" y2="15" />
                </svg>
              </span>
              <span className="logo-text">CareerNest</span>
            </a>

            <p>
              Transforming campus placements with intelligent automation and transparency.
              Empowering students, recruiters, alumni, and institutions.
            </p>

            <div className="footer-contact">
              <div>
                <span className="contact-icon">✉️</span> hello@careernest.com
              </div>
              <div>
                <span className="contact-icon">📞</span> +91 123 456 7890
              </div>
              <div>
                <span className="contact-icon">📍</span> Hyderabad, India
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Product</h4>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("features");
                }}
              >
                Features
              </a>
              <a
                href="#process"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("process");
                }}
              >
                How It Works
              </a>
              <a
                href="#roles"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("roles");
                }}
              >
                Stakeholder Roles
              </a>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("faq");
                }}
              >
                FAQ
              </a>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <a href="#hero">About Us</a>
              <a href="#hero">Careers</a>
              <a href="#hero">Blog</a>
              <a href="#hero">Press</a>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <a href="#faq">Help Center</a>
              <a href="#faq">Documentation</a>
              <a href="#footer">Privacy Policy</a>
              <a href="#footer">Terms of Service</a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest updates on placement trends and platform features.</p>
            <form className="subscribe-box" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                required
              />
              <button type="submit" aria-label="Subscribe">
                ➤
              </button>
            </form>
            {subscribed && (
              <p style={{ color: "#38bdf8", marginTop: "8px", fontSize: "13px" }}>
                ✓ Subscribed! You will receive portal updates from CareerNest.
              </p>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 CareerNest. All rights reserved.</p>
          <div className="socials">
            <a href="#" aria-label="LinkedIn">
              in
            </a>
            <a href="#" aria-label="Twitter">
              𝕏
            </a>
            <a href="#" aria-label="Facebook">
              f
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;