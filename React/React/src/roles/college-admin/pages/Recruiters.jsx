import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../../../services/api.js";
import RecruiterOpportunitiesModal from "../../../shared/components/RecruiterOpportunitiesModal.jsx";
import { confirmDialog, infoDialog } from "../../../shared/components/AppDialog.jsx";

export default function Recruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const loadRecruiters = useCallback(async () => {
    try {
      const { data } = await api.get('/recruiters');
      setRecruiters(data);
      setError('');
    } catch (failure) {
      setError(errorMessage(failure, 'Could not load recruiters.'));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadRecruiters();
  }, [loadRecruiters]);
  const removeRecruiter = async (recruiter) => {
    if (!await confirmDialog(`Remove recruiter ${recruiter.name} (${recruiter.email})? Their login access will be removed. This cannot be undone.`)) return;
    setRemovingId(recruiter.id);
    try {
      await api.delete(`/recruiters/${recruiter.id}`);
      await loadRecruiters();
      infoDialog(`${recruiter.name} was removed.`);
    } catch (failure) {
      infoDialog(errorMessage(failure, 'Could not remove this recruiter.'));
    } finally {
      setRemovingId(null);
    }
  };
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
                <th>Actions</th>
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
                      View Opportunities ({recruiter.opps})
                    </button>
                  </td>
                  <td><button type="button" className="btn btn-danger btn-sm" disabled={removingId === recruiter.id} onClick={() => removeRecruiter(recruiter)}>{removingId === recruiter.id ? 'Removing…' : 'Remove'}</button></td>
                </tr>
              ))}
              {!recruiters.length && (
                <tr>
                  <td colSpan={5}>No recruiters found.</td>
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
