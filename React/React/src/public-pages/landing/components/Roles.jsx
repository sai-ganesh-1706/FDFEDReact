import { Link } from "react-router-dom";

const roles = [
  {
    role: "candidate",
    icon: "🎓",
    title: "Candidate",
    description:
      "Browse opportunities, apply for jobs & internships, track your applications, and request alumni referrals.",
    gradientClass: "candidate-gradient",
  },
  {
    role: "alumni",
    icon: "🤝",
    title: "Alumni",
    description:
      "Share internship reports, provide professional endorsements, and help juniors through referral support.",
    gradientClass: "alumni-gradient",
  },
  {
    role: "officer",
    icon: "🛡️",
    title: "Placement Officer",
    description:
      "Approve opportunities, enforce placement policies, monitor stats, and manage recruiter relationships.",
    gradientClass: "officer-gradient",
  },
  {
    role: "recruiter",
    icon: "💼",
    title: "Recruiter",
    description:
      "Post opportunities, screen candidates, schedule interviews, and manage your entire hiring pipeline.",
    gradientClass: "recruiter-gradient",
  },
  {
    role: "college_admin",
    icon: "🏫",
    title: "College Admin",
    description:
      "Manage placement officers, monitor student placement progress, and oversee all college-level activity.",
    customGradient: "linear-gradient(135deg, #0ea5e9, #0284c7)",
  },
  {
    role: "super_admin",
    icon: "👑",
    title: "Super Admin",
    description:
      "Onboard colleges, manage subscriptions, monitor platform-wide revenue and placement statistics.",
    customGradient: "linear-gradient(135deg, #7c3aed, #5b21b6)",
  },
];

function Roles() {
  return (
    <section className="roles" id="roles">
      <div className="container">
        <div className="section-header">
          <span className="tag">GET STARTED</span>
          <h2>Select Your Role to Continue</h2>
          <p className="section-subtitle">
            Choose the role that best describes you and get a personalised experience tailored to your needs.
          </p>
        </div>

        <div className="role-container">
          {roles.map((role) => (
            <div
              className="role-card"
              data-role={role.role}
              key={role.role}
            >
              <div
                className={`role-icon-wrap ${role.gradientClass || ""}`}
                style={
                  role.customGradient
                    ? { background: role.customGradient }
                    : undefined
                }
              >
                {role.icon}
              </div>

              <h3>{role.title}</h3>
              <p>{role.description}</p>

              <Link
                to={`/login?role=${role.role}`}
                className="role-link"
              >
                <span>Enter as {role.title}</span>
                <svg
                  width="14"
                  height="14"
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
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Roles;