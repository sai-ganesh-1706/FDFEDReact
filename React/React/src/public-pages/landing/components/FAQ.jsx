import { useState } from "react";

const faqs = [
  {
    question: "Who can use CareerNest?",
    answer: (
      <>
        CareerNest is designed for four key stakeholders
        in the campus placement ecosystem:
        <strong> Candidates</strong> (students seeking
        jobs/internships), <strong>Recruiters</strong>
        (companies hiring through campus),
        <strong> Alumni</strong> (graduates who can
        provide referrals), and
        <strong> Senior Placement Officers</strong>
        (who manage and oversee the process).
      </>
    ),
  },

  {
    question: "How does the eligibility system work?",
    answer:
      "When recruiters post opportunities, they define eligibility criteria such as minimum CGPA, branch, graduation year, and other requirements. The system automatically validates each candidate's profile against these criteria and only allows eligible students to apply, eliminating manual eligibility checking errors.",
  },

  {
    question: "How do alumni referrals work?",
    answer:
      "Students can request referrals from alumni who are currently working in companies they've applied to. Alumni receive the request, review the candidate's profile and resume, and can choose to approve or decline. Approved referrals appear as indicators on the candidate's application.",
  },

  {
    question: "Can recruiters see referral information?",
    answer:
      "Yes. When reviewing candidate applications, recruiters can see referral indicators showing whether a candidate has been endorsed by an alumnus.",
  },

  {
    question:
      "What role does the Senior Placement Officer play?",
    answer:
      "The Senior Placement Officer acts as the gatekeeper of the placement process. They review and approve job opportunities before they're published to students, enforce institutional placement rules and policies, monitor overall recruitment activity, manage recruiter relationships, and access comprehensive placement statistics and reports.",
  },

  {
    question: "Is CareerNest free for students?",
    answer:
      "Yes! CareerNest is completely free for students. The platform is typically adopted by institutions who manage the system through their placement cell. Students simply sign up, complete their profile, and start exploring approved opportunities — all at no cost.",
  },
];

function FAQ() {
  const [activeIndex, setActiveIndex] =
    useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(
      activeIndex === index ? null : index
    );
  };

  return (
    <section className="faq" id="faq">
      <div className="container">

        <div className="section-header">

          <span className="tag-pill">
            ❓ FAQ
          </span>

          <h2>
            Frequently Asked
            <br />

            <span className="gradient-text">
              Questions
            </span>
          </h2>

        </div>

        <div className="faq-list">

          {faqs.map((faq, index) => {
            const active =
              activeIndex === index;

            return (
              <div
                className={`faq-item ${
                  active ? "active" : ""
                }`}
                key={faq.question}
              >

                <button
                  className="faq-question"
                  onClick={() =>
                    toggleFAQ(index)
                  }
                  aria-expanded={active}
                >
                  <span>
                    {faq.question}
                  </span>

                  <svg
                    className="faq-chevron"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <div className="faq-answer">
                  <p>
                    {faq.answer}
                  </p>
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default FAQ;