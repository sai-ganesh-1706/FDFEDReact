const processSteps = [
  {
    number: "01",
    icon: "✈️",
    title: "Opportunity Submission",
    description:
      "Recruiters submit job and internship opportunities with defined eligibility criteria. Placement officers review and approve them for publication.",
  },
  {
    number: "02",
    icon: "🖱️",
    title: "Apply & Validate",
    description:
      "Students discover matching opportunities and apply with one click. The system automatically validates eligibility requirements in real-time.",
  },
  {
    number: "03",
    icon: "🤝",
    title: "Alumni Referrals",
    description:
      "Students request referrals from alumni. Alumni review candidate profiles, provide endorsements, and boost their chances of getting hired.",
  },
  {
    number: "04",
    icon: "🏆",
    title: "Track to Success",
    description:
      "All stakeholders track progress in real-time. Recruiters update stages, students monitor status, and officers oversee the entire pipeline.",
  },
];

function Process() {
  return (
    <section className="process" id="process">
      <div className="container">

        <div className="section-header">
          <span className="tag">
            PROCESS
          </span>

          <h2>
            How CareerNest Works
          </h2>

          <p className="section-subtitle">
            A streamlined four-step journey from
            opportunity submission to successful
            placement.
          </p>
        </div>

        <div className="process-timeline">

          <div className="timeline-line" />

          {processSteps.map((step) => (
            <div
              className="process-card"
              key={step.number}
            >
              <div className="process-number">
                {step.number}
              </div>

              <div className="process-content">

                <div className="process-icon">
                  {step.icon}
                </div>

                <h3>
                  {step.title}
                </h3>

                <p>
                  {step.description}
                </p>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Process;