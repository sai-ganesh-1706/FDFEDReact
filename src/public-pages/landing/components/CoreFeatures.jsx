const features = [
  {
    icon: "🔍",
    title: "Opportunity Discovery",
    description:
      "Browse approved job and internship listings with detailed eligibility criteria, role descriptions, and company info.",
    gradient:
      "linear-gradient(135deg, #4f6ef7, #38bdf8)",
  },
  {
    icon: "🗺️",
    title: "Application Tracking",
    description:
      "Real-time visibility into your application status across every recruitment stage — from applied to placed.",
    gradient:
      "linear-gradient(135deg, #8b5cf6, #a855f7)",
  },
  {
    icon: "🤝",
    title: "Alumni Referrals",
    description:
      "Request referrals from alumni, track approval status, and showcase endorsements to recruiters.",
    gradient:
      "linear-gradient(135deg, #10b981, #34d399)",
  },
  {
    icon: "📅",
    title: "Smart Scheduling",
    description:
      "Recruiters can schedule assessments and interviews; candidates get instant notifications and calendar syncs.",
    gradient:
      "linear-gradient(135deg, #2563eb, #38bdf8)",
  },
  {
    icon: "✅",
    title: "Automated Eligibility",
    description:
      "System-enforced eligibility rules ensure only qualified candidates can apply — no manual checking needed.",
    gradient:
      "linear-gradient(135deg, #3b82f6, #60a5fa)",
  },
  {
    icon: "📊",
    title: "Placement Analytics",
    description:
      "Comprehensive dashboards showing placement statistics, outcomes, and trends for institutional decision-making.",
    gradient:
      "linear-gradient(135deg, #06b6d4, #22d3ee)",
  },
];

function CoreFeatures() {
  return (
    <section
      className="core-features"
      id="core-features"
    >
      <div className="container">

        <div className="section-header">
          <span className="tag-pill">
            ⭐ CORE FEATURES
          </span>

          <h2>
            Everything You Need for
            <br />

            <span className="gradient-text">
              Seamless Placements
            </span>
          </h2>

          <p className="section-subtitle">
            A comprehensive platform designed to
            model real-world placement workflows
            with transparency and efficiency.
          </p>
        </div>

        <div className="core-grid">

          {features.map((feature) => (
            <div
              className="core-card"
              key={feature.title}
            >
              <div
                className="core-icon"
                style={{
                  background: feature.gradient,
                }}
              >
                {feature.icon}
              </div>

              <h3>
                {feature.title}
              </h3>

              <p>
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default CoreFeatures;