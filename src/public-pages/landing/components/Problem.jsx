const problems = [
  {
    icon: "🚫",
    title: "Lack of Transparency",
    description:
      "Candidates have no visibility into their application status or where they stand in the process.",
  },
  {
    icon: "⚠️",
    title: "Manual Errors",
    description:
      "Eligibility checking and application tracking through spreadsheets leads to frequent mistakes.",
  },
  {
    icon: "⏰",
    title: "Communication Delays",
    description:
      "Important updates get lost in email threads and messaging apps, causing missed opportunities.",
  },
  {
    icon: "📋",
    title: "Coordination Overhead",
    description:
      "Placement officers spend excessive time on administrative tasks instead of strategic initiatives.",
  },
];

function Problem() {
  return (
    <section className="problem" id="problem">
      <div className="container">

        <div className="section-header">
          <span className="tag">
            THE PROBLEM
          </span>

          <h2>
            Why Traditional Placement
            <br />
            Systems Fall Short
          </h2>

          <p className="section-subtitle">
            Campus placements rely on emails,
            spreadsheets, and manual coordination —
            creating chaos for everyone involved.
          </p>
        </div>

        <div className="problem-grid">

          {problems.map((problem) => (
            <div
              className="problem-card"
              key={problem.title}
            >
              <div className="problem-icon">
                {problem.icon}
              </div>

              <h3>
                {problem.title}
              </h3>

              <p>
                {problem.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Problem;