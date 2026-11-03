export const allBranches = ["CSE", "ECE", "IT", "EEE", "MECH", "CIVIL"];

export const getTodayStr = () => new Date().toISOString().split("T")[0];

export const getMaxDeadlineStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
};

// ── Validators ────────────────────────────────────────────────────────────────

export const validateTitle = (v) => {
  const t = v.trim();
  if (!t) return "Job title is required.";
  if (/[^a-zA-Z0-9 \-]/.test(t))
    return "Job title may only contain letters, numbers, spaces and hyphens.";
  if (/^[\d\s]+$/.test(t)) return "Job title cannot be all numbers.";
  if (/^[-\s]+$/.test(t)) return "Job title cannot be all hyphens.";
  return "";
};

export const validateCtcLpa = (v) => {
  if (!v && v !== 0) return "";
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0.5 || n % 0.5 !== 0)
    return "CTC must be at least 0.5 LPA, in multiples of 0.5.";
  if (n > 500) return "CTC cannot exceed 500 LPA.";
  return "";
};

export const validateInternComp = (v) => {
  if (!v && v !== 0) return "";
  const n = Number(v);
  if (!Number.isFinite(n) || n < 500 || n % 500 !== 0)
    return "Compensation must be at least Rs.500 per month, in multiples of Rs.500.";
  if (n > 200000) return "Compensation cannot exceed Rs.2,00,000 per month.";
  return "";
};

export const validateCgpa = (v) => {
  if (!v && v !== 0) return "";
  const n = Number(v);
  if (
    !Number.isFinite(n) ||
    n < 2 ||
    Math.abs(n * 10 - Math.round(n * 10)) > 0.000001
  )
    return "CGPA must be at least 2.0, with at most one decimal place.";
  if (n > 10) return "CGPA cannot exceed 10.0.";
  return "";
};

export const validateDeadline = (v) => {
  if (!v) return "Application deadline is required.";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sel = new Date(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(sel.getTime()))
    return "Enter a valid deadline.";
  if (sel < today) return "Deadline cannot be a past date.";
  const max = new Date();
  max.setMonth(max.getMonth() + 3);
  if (sel > max) return "Deadline cannot be more than 3 months from today.";
  return "";
};

export const validateSkill = (v) => {
  if (/[^a-zA-Z0-9 ]/.test(v))
    return "Skills may only contain letters and numbers.";
  return "";
};

export const validateLocation = (v) => {
  const t = v.trim();
  if (!t) return "Please enter a location.";
  if (/\d/.test(t)) return "Location cannot contain numbers.";
  if (/[^a-zA-Z ,.\-]/.test(t))
    return "Location may only contain letters, spaces, commas and hyphens.";
  return "";
};

// ── Shared sub-components ─────────────────────────────────────────────────────
