import { useState } from "react";
import { featureData } from "../data/featureData";

const roles = [
  {
    id: "candidate",
    icon: "🎓",
    label: "Candidates",
  },
  {
    id: "recruiter",
    icon: "💼",
    label: "Recruiters",
  },
  {
    id: "alumni",
    icon: "🤝",
    label: "Alumni",
  },
  {
    id: "officer",
    icon: "🛡️",
    label: "Placement Officer",
  },
];

function Features() {
  const [activeRole, setActiveRole] =
    useState("candidate");

  const selected = featureData[activeRole];

  return (
    <section
      className="features"
      id="features"
    >
      <div className="container">

        <div className="section-header">

          <span className="tag">
            FEATURES
          </span>

          <h2>
            Powerful Features for
            <br />
            Every Stakeholder
          </h2>

          <p className="section-subtitle">
            Designed to meet the unique needs of
            candidates, recruiters, alumni, and
            placement officers.
          </p>

        </div>

        <div className="tabs">

          {roles.map((role) => (
            <button
              key={role.id}
              className={`tab ${
                activeRole === role.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveRole(role.id)
              }
            >
              <span className="tab-icon">
                {role.icon}
              </span>

              <span>
                {role.label}
              </span>
            </button>
          ))}

        </div>

        <div className="feature-box">

          <div className="feature-box-header">

            <div
              className="feature-box-icon"
              style={{
                background: selected.gradient,
              }}
            >
              {selected.icon}
            </div>

            <h3>
              {selected.title}
            </h3>

          </div>

          <div className="feature-list">

            {selected.features.map(
              (feature) => (
                <div
                  className="feature-item"
                  key={feature}
                >
                  <div
                    className="feature-check"
                    style={{
                      background:
                        selected.gradient,
                    }}
                  >
                    ✓
                  </div>

                  <p>
                    {feature}
                  </p>
                </div>
              )
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

export default Features;