import "./AppDialog.css";
import { useEffect, useRef, useState } from "react";
import api, { errorMessage } from "../../services/api.js";

const statusStyle = {
  pending: { label: "Pending review", color: "#92400e", background: "#fef3c7" },
  approved: { label: "Approved", color: "#1d4ed8", background: "#dbeafe" },
  published: { label: "Published", color: "#166534", background: "#dcfce7" },
  rejected: { label: "Rejected", color: "#991b1b", background: "#fee2e2" },
  closed: { label: "Closed", color: "#475569", background: "#f1f5f9" },
};

export default function RecruiterOpportunitiesModal({ recruiter, onClose }) {
  const dialog = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    dialog.current.showModal();
    const node = dialog.current;
    return () => node.close();
  }, []);
  useEffect(() => {
    let active = true;
    api
      .get(`/recruiters/${recruiter.id}/opportunities`)
      .then(({ data }) => {
        if (active) setJobs(data);
      })
      .catch((failure) => {
        if (active)
          setError(
            errorMessage(failure, "Could not load recruiter opportunities."),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [recruiter.id]);
  return (
    <dialog
      ref={dialog}
      className="cn-app-dialog cn-recruiter-jobs-dialog"
      style={{ width: "min(800px, calc(100vw - 32px))", maxHeight: "85vh" }}
      aria-labelledby="recruiter-jobs-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 16 }}
      >
        <h2 id="recruiter-jobs-title">{recruiter.name} · Opportunities</h2>
        <button
          type="button"
          aria-label="Close opportunities"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p>
        {recruiter.company} · {recruiter.email}
      </p>
      {loading ? (
        <p role="status">Loading opportunities…</p>
      ) : error ? (
        <p role="status">{error}</p>
      ) : jobs.length === 0 ? (
        <p>No opportunities posted by this recruiter.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <p style={{ marginBottom: 8 }}>{jobs.length} submitted opportunit{jobs.length === 1 ? "y" : "ies"}</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Job ID", "Opportunity", "Type", "Status", "Deadline"].map(
                  (label) => (
                    <th
                      key={label}
                      style={{
                        textAlign: "left",
                        padding: 10,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ padding: 10 }}>{job.jobId}</td>
                  <td style={{ padding: 10 }}>{job.title}</td>
                  <td style={{ padding: 10 }}>{job.type}</td>
                  <td style={{ padding: 10 }}>
                    <strong style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, color: statusStyle[String(job.status).toLowerCase()]?.color || "#334155", background: statusStyle[String(job.status).toLowerCase()]?.background || "#e2e8f0" }}>
                      {statusStyle[String(job.status).toLowerCase()]?.label || job.status}
                    </strong>
                  </td>
                  <td style={{ padding: 10 }}>{job.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="cn-dialog-actions" style={{ marginTop: 20 }}>
        <button type="button" className="cn-dialog-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}
