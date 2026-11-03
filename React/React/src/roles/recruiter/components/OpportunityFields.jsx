import React, { useState } from "react";
import { X } from "lucide-react";
import {
  allBranches,
  validateSkill,
  validateLocation,
} from "../data/opportunityValidation.js";
export function LocationAdder({ locations, setLocations }) {
  const [cur, setCur] = useState("");
  const [err, setErr] = useState("");

  const add = () => {
    const t = cur.trim();
    const e = validateLocation(t);
    if (e) {
      setErr(e);
      return;
    }
    if (locations.includes(t)) {
      setErr("Already added.");
      return;
    }
    setLocations([...locations, t]);
    setCur("");
    setErr("");
  };

  return (
    <div className="form-group">
      <label>Work Location *</label>
      <div className="skills-input-row">
        <input
          type="text"
          className={`form-input${err ? " input-error" : ""}`}
          placeholder="e.g. Bangalore, Remote, Hyderabad"
          value={cur}
          onChange={(e) => {
            setCur(e.target.value);
            if (err) setErr("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          className="btn-secondary-action"
          onClick={add}
          style={{ padding: "9px 16px" }}
        >
          Add
        </button>
      </div>
      {err && <span className="field-error">{err}</span>}
      {locations.length > 0 && (
        <div className="skills-tags-list" style={{ marginTop: "8px" }}>
          {locations.map((loc) => (
            <span key={loc} className="skill-tag-item">
              {loc}
              <button
                type="button"
                className="skill-remove-btn"
                onClick={() => setLocations(locations.filter((l) => l !== loc))}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function SkillAdder({ skills, setSkills }) {
  const [cur, setCur] = useState("");
  const [err, setErr] = useState("");

  const add = (e) => {
    e?.preventDefault();
    const t = cur.trim();
    if (!t) return;
    const e2 = validateSkill(t);
    if (e2) {
      setErr(e2);
      return;
    }
    if (!skills.includes(t)) setSkills([...skills, t]);
    setCur("");
    setErr("");
  };

  return (
    <div className="form-group full-width">
      <label>Required Skills &amp; Technologies</label>
      <div className="skills-input-row">
        <input
          type="text"
          className={`form-input${err ? " input-error" : ""}`}
          placeholder="Type skill and press Enter or Add (e.g. React, Docker)"
          value={cur}
          onChange={(e) => {
            const v = e.target.value;
            const er = validateSkill(v);
            if (!er) setCur(v);
            setErr(er);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") add(e);
          }}
        />
        <button
          type="button"
          className="btn-secondary-action"
          onClick={add}
          style={{ padding: "9px 16px" }}
        >
          Add
        </button>
      </div>
      {err && <span className="field-error">{err}</span>}
      <div className="skills-tags-list">
        {skills.map((s) => (
          <span key={s} className="skill-tag-item">
            {s}
            <button
              type="button"
              className="skill-remove-btn"
              onClick={() => setSkills(skills.filter((x) => x !== s))}
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function BranchSelector({ selectedBranches, setSelectedBranches }) {
  const toggle = (b) =>
    setSelectedBranches(
      selectedBranches.includes(b)
        ? selectedBranches.filter((x) => x !== b)
        : [...selectedBranches, b],
    );
  return (
    <div className="form-group full-width">
      <label>Eligible Engineering Branches *</label>
      <div className="branches-container">
        {[...new Set([...allBranches, ...selectedBranches])].map((b) => (
          <button
            key={b}
            type="button"
            className={`branch-chip ${selectedBranches.includes(b) ? "selected" : ""}`}
            onClick={() => toggle(b)}
          >
            {b} {selectedBranches.includes(b) && "✓"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Duplicate checker ─────────────────────────────────────────────────────────
