import { useEffect, useState } from "react";
import api, { errorMessage } from "../../../services/api.js";
import RecruiterOpportunitiesModal from "../../../shared/components/RecruiterOpportunitiesModal.jsx";

export default function Recruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api
      .get("/recruiters")
      .then(({ data }) => {
        if (active) setRecruiters(data);
      })
      .catch((failure) => {
        if (active)
          setError(errorMessage(failure, "Could not load recruiters."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <section>
      <div className="section-header">
        <h2>Recruiters</h2>
      </div>
      <p>Select a recruiter to view their opportunities and statuses.</p>
      {error && <p role="status">{error}</p>}
      {loading ? (
        <p>Loading recruiters…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Recruiter</th>
                <th>Company</th>
                <th>Status</th>
                <th>Opportunities</th>
              </tr>
            </thead>
            <tbody>
              {recruiters.map((recruiter) => (
                <tr key={recruiter.id}>
                  <td>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setSelected(recruiter)}
                    >
                      {recruiter.name}
                    </button>
                  </td>
                  <td>{recruiter.company}</td>
                  <td>{recruiter.status}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => setSelected(recruiter)}
                    >
                      View Opportunities
                    </button>
                  </td>
                </tr>
              ))}
              {!recruiters.length && (
                <tr>
                  <td colSpan={4}>No recruiters found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {selected && (
        <RecruiterOpportunitiesModal
          key={selected.id}
          recruiter={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
