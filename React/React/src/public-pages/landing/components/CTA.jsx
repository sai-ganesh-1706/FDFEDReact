import { useNavigate } from "react-router-dom";

function CTA() {
  const navigate = useNavigate();

  return (
    <section className="cta" id="cta">
      <div className="container">
        <div className="cta-container">
          <div className="cta-glow" />

          <span className="tag">READY TO BEGIN?</span>

          <h2>
            Simplifying Campus Placements
            <br />
            for Everyone
          </h2>

          <p>
            Whether you're a student seeking opportunities, a recruiter searching for
            talent, or an alumnus supporting the next generation — CareerNest brings the entire
            placement ecosystem together in one powerful platform.
          </p>

          <div className="cta-buttons">
            <button
              className="btn-primary btn-lg"
              id="cta-get-started"
              onClick={() => navigate("/login")}
            >
              <span>Get Started</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;