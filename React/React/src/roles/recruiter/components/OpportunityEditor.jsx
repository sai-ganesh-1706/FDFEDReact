import { useState } from "react";
import {
  LocationAdder,
  SkillAdder,
  BranchSelector,
} from "./OpportunityFields.jsx";
import {
  getTodayStr,
  getMaxDeadlineStr,
  validateTitle,
  validateCtcLpa,
  validateInternComp,
  validateCgpa,
  validateDeadline,
  validateLocation,
  validateSkill,
} from "../data/opportunityValidation.js";

export const compensationAmount = (value) =>
  String(value || "")
    .replace(/,/g, "")
    .match(/\d+(?:\.\d+)?/)?.[0] || "";

export default function OpportunityEditor({
  opportunity,
  opportunities,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState({ ...opportunity });
  const [locations, setLocations] = useState(
    (opportunity.location || "")
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const [amount, setAmount] = useState(compensationAmount(opportunity.ctc));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const locked = ["published", "closed"].includes(
    opportunity.status.toLowerCase(),
  );
  const approved = locked || opportunity.status.toLowerCase() === "approved";
  const internship = form.type === "Internship";
  const set = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const validation = {};
    if (String(form.cgpa) !== String(opportunity.cgpa))
      validation.cgpa = validateCgpa(form.cgpa);
    if (approved && Number(form.cgpa) > Number(opportunity.cgpa))
      validation.cgpa = "After approval, CGPA can only be decreased.";
    if (!locked) {
      validation.jobId = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(
        form.jobId.trim(),
      )
        ? ""
        : "Job ID is required; use letters, numbers, dots, underscores or hyphens.";
      if (
        opportunities.some(
          (other) =>
            other.id !== opportunity.id &&
            other.jobId.toLowerCase() === form.jobId.trim().toLowerCase(),
        )
      )
        validation.jobId = "This Job ID already exists.";
      validation.title = validateTitle(form.title);
      if (
        opportunities.some(
          (other) =>
            other.id !== opportunity.id &&
            other.type === form.type &&
            other.title.trim().toLowerCase() ===
              form.title.trim().toLowerCase(),
        )
      )
        validation.title =
          "An opportunity with this title and type already exists.";
      validation.amount = internship
        ? validateInternComp(amount)
        : validateCtcLpa(amount);
      validation.deadline = validateDeadline(form.deadline);
      validation.location = !locations.length
        ? "Add at least one work location."
        : locations.map(validateLocation).find(Boolean) || "";
      validation.branches = form.branches.length
        ? ""
        : "Select at least one eligible branch.";
      validation.skills =
        form.skills
          .filter((skill) => !opportunity.skills.includes(skill))
          .map(validateSkill)
          .find(Boolean) || "";
      validation.openings =
        Number.isInteger(Number(form.openings)) && Number(form.openings) >= 1
          ? ""
          : "Openings must be a positive whole number.";
    }
    setErrors(validation);
    if (Object.values(validation).some(Boolean)) return;
    const payload = locked
      ? { ...opportunity, cgpa: form.cgpa }
      : {
          ...form,
          jobId: form.jobId.trim(),
          title: form.title.trim(),
          location: locations.join(" | "),
          ctc: amount
            ? internship
              ? `Rs.${amount}/month`
              : `${amount} LPA`
            : "Not specified",
          duration: internship ? form.duration || "Not specified" : "",
        };
    setSaving(true);
    try {
      const ok = await onSave(payload);
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  };
  const error = (key) =>
    errors[key] && <span className="field-error">{errors[key]}</span>;
  return (
    <div className="modal-backdrop">
      <section
        className="modal-content-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-opportunity-title"
      >
        <div className="modal-header">
          <h3 id="edit-opportunity-title">
            Edit Opportunity · {opportunity.jobId}
          </h3>
          <button
            type="button"
            className="btn-close-modal"
            disabled={saving}
            onClick={onClose}
            aria-label="Close editor"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit} noValidate>
          <fieldset
            disabled={saving}
            style={{ border: 0, padding: 0, margin: 0 }}
          >
            {!locked && (
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-job-id">Job ID *</label>
                  <input
                    id="edit-job-id"
                    className="form-input"
                    maxLength={80}
                    value={form.jobId}
                    onChange={(event) => set("jobId", event.target.value)}
                  />
                  {error("jobId")}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-job-title">Job Title *</label>
                  <input
                    id="edit-job-title"
                    className="form-input"
                    value={form.title}
                    onChange={(event) => set("title", event.target.value)}
                  />
                  {error("title")}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-job-type">Opportunity Type</label>
                  <select
                    id="edit-job-type"
                    className="form-input"
                    value={form.type}
                    onChange={(event) => {
                      set("type", event.target.value);
                      set("duration", "");
                      setAmount("");
                    }}
                  >
                    <option>Full-Time</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-compensation">
                    {internship ? "Compensation (Rs. / month)" : "CTC (LPA)"}
                  </label>
                  <input
                    id="edit-compensation"
                    className="form-input"
                    type="number"
                    min={internship ? 500 : 0.5}
                    max={internship ? 200000 : 500}
                    step={internship ? 500 : 0.5}
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setErrors((previous) => ({ ...previous, amount: "" }));
                    }}
                  />
                  {error("amount")}
                </div>
                {internship && (
                  <div className="form-group">
                    <label htmlFor="edit-duration">Internship Duration</label>
                    <select
                      id="edit-duration"
                      className="form-input"
                      value={form.duration || ""}
                      onChange={(event) => set("duration", event.target.value)}
                    >
                      <option value="">Select duration</option>
                      <option>Not specified</option>
                      {["1 Month", "2 Months", "3 Months", "6 Months"].map(
                        (value) => (
                          <option key={value}>{value}</option>
                        ),
                      )}
                    </select>
                  </div>
                )}
                <LocationAdder
                  locations={locations}
                  setLocations={setLocations}
                />
                {error("location")}
                <div className="form-group">
                  <label htmlFor="edit-deadline">Application Deadline *</label>
                  <input
                    id="edit-deadline"
                    className="form-input"
                    type="date"
                    min={getTodayStr()}
                    max={getMaxDeadlineStr()}
                    value={form.deadline}
                    onChange={(event) => set("deadline", event.target.value)}
                  />
                  {error("deadline")}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-openings">Openings *</label>
                  <input
                    id="edit-openings"
                    className="form-input"
                    type="number"
                    min="1"
                    step="1"
                    value={form.openings}
                    onChange={(event) => set("openings", event.target.value)}
                  />
                  {error("openings")}
                </div>
                <BranchSelector
                  selectedBranches={form.branches}
                  setSelectedBranches={(value) => set("branches", value)}
                />
                {error("branches")}
                <SkillAdder
                  skills={form.skills}
                  setSkills={(value) => set("skills", value)}
                />
                {error("skills")}
                <div className="form-group full-width">
                  <label htmlFor="edit-description">
                    Job Description &amp; Responsibilities
                  </label>
                  <textarea
                    id="edit-description"
                    className="form-textarea"
                    rows={4}
                    value={form.description}
                    onChange={(event) => set("description", event.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="edit-cgpa">
                Minimum CGPA {approved ? "(can only decrease)" : "(2–10)"}
              </label>
              <input
                id="edit-cgpa"
                className="form-input"
                type="number"
                step="0.1"
                min={Number(opportunity.cgpa) === 0 ? 0 : 2}
                max={approved ? opportunity.cgpa : 10}
                value={form.cgpa}
                onChange={(event) => set("cgpa", event.target.value)}
              />
              {error("cgpa")}
            </div>
            <div className="form-actions-row">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={onClose}
              >
                Cancel
              </button>
              <button className="btn-primary-action">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </fieldset>
        </form>
      </section>
    </div>
  );
}
