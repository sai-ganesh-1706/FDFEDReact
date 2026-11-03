import "./AppDialog.css";
import { useEffect, useRef, useState } from "react";
import api, { errorMessage } from "../../services/api.js";

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
      className="cn-app-dialog"
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
                    <strong>{job.status}</strong>
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
