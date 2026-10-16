import { useEffect, useState } from "react";
import api, { errorMessage } from "../../../services/api.js";

const EMPTY = { name: "", company: "", role: "", email: "", phone: "", collegeId: "", message: "" };

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Please enter your name.";
  else if (!/^[A-Za-z][A-Za-z .'-]{1,59}$/.test(f.name.trim())) e.name = "Use letters, spaces and . ' - only (2–60 characters).";
  if (f.company.trim().length < 2) e.company = "Please enter your company name.";
  if (f.role.trim().length < 2) e.role = "Please enter your designation.";
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(f.email.trim())) e.email = "Enter a valid work email.";
  if (f.phone.trim() && !/^[+]?[0-9 ()-]{8,16}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number.";
  if (!f.collegeId) e.collegeId = "Choose the college you want to hire from.";
  if (f.message.length > 1000) e.message = "Keep the message under 1000 characters.";
  return e;
}

function ContactSection() {
  const [form, setForm] = useState(EMPTY);
  const [colleges, setColleges] = useState([]);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ state: "idle", text: "" });

  useEffect(() => {
    api.get("/contact/colleges").then(({ data }) => setColleges(data)).catch(() => {});
  }, []);

  const errors = validate(form);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const showError = (k) => touched[k] && errors[k];

  const submit = async (ev) => {
    ev.preventDefault();
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (Object.keys(errors).length) return;
    setStatus({ state: "sending", text: "" });
    try {
      const payload = {
        name: form.name.trim(), company: form.company.trim(), role: form.role.trim(),
        email: form.email.trim(), collegeId: Number(form.collegeId),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        ...(form.message.trim() ? { message: form.message.trim() } : {}),
      };
      const { data } = await api.post("/contact/recruiter", payload);
      setStatus({ state: "done", text: data.message });
      setForm(EMPTY);
      setTouched({});
    } catch (error) {
      setStatus({ state: "error", text: errorMessage(error, "Could not send your request. Please try again.") });
    }
  };

  const field = (k, label, props = {}) => (
    <div className={`contact-field ${showError(k) ? "has-error" : ""}`}>
      <label htmlFor={`contact-${k}`}>{label}</label>
      <input id={`contact-${k}`} value={form[k]} onChange={set(k)} onBlur={blur(k)} {...props} />
      {showError(k) && <span className="contact-error">{errors[k]}</span>}
    </div>
  );

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="section-header">
          <span className="tag">FOR RECRUITERS</span>
          <h2>Want to hire from a campus? <span className="gradient-text">Talk to the placement cell</span></h2>
          <p>
            Tell us who you are and which college you would like to recruit from. The placement officer verifies
            your request and sends you login details for the recruiter portal.
          </p>
        </div>

        <div className="contact-card">
          {status.state === "done" ? (
            <div className="contact-success">
              <div className="contact-success-icon">✓</div>
              <h3>Request received</h3>
              <p>{status.text}</p>
              <button className="btn-secondary" onClick={() => setStatus({ state: "idle", text: "" })}>Send another request</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="contact-grid">
                {field("name", "Your name *", { placeholder: "Priya Kapoor", autoComplete: "name" })}
                {field("email", "Work email *", { type: "email", placeholder: "you@company.com", autoComplete: "email" })}
                {field("company", "Company *", { placeholder: "Google" })}
                {field("role", "Designation *", { placeholder: "University Relations Lead" })}
                {field("phone", "Phone", { placeholder: "+91 98765 43210", autoComplete: "tel" })}
                <div className={`contact-field ${showError("collegeId") ? "has-error" : ""}`}>
                  <label htmlFor="contact-collegeId">College to recruit from *</label>
                  <select id="contact-collegeId" value={form.collegeId} onChange={set("collegeId")} onBlur={blur("collegeId")}>
                    <option value="">Select a college</option>
                    {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {showError("collegeId") && <span className="contact-error">{errors.collegeId}</span>}
                </div>
              </div>
              <div className={`contact-field ${showError("message") ? "has-error" : ""}`} style={{ marginTop: 16 }}>
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" rows={4} value={form.message} onChange={set("message")} onBlur={blur("message")}
                  placeholder="Roles you are hiring for, expected hiring window, number of openings…" />
                {showError("message") && <span className="contact-error">{errors.message}</span>}
              </div>
              {status.state === "error" && <div className="contact-banner">{status.text}</div>}
              <button type="submit" className="btn-primary btn-lg" disabled={status.state === "sending"} style={{ marginTop: 20 }}>
                <span>{status.state === "sending" ? "Sending…" : "Contact the placement cell"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
