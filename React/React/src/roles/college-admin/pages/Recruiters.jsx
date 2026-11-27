// Data Flow (roles/college-admin/pages/Recruiters.jsx):
// Backend API -> Redux Thunks/Slices (collegeAdminSlice, recruitersSlice) -> useSelector(selectCollegeRecruitersUi, selectRecruiterRegistrations) -> UI render
// User Actions -> dispatch(deleteRecruiter, fetchRecruiterRegistrations, loadRecruiters) -> Slice reducers/thunks -> Redux state update
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { errorMessage } from '../../../services/api.js';
import { selectCollegeRecruitersUi, setCollegeRecruitersUi } from '../store/collegeAdminSlice.js';
import {
  deleteRecruiter,
  fetchRecruiterRegistrations,
  selectRecruiterRegistrations,
} from '../../../store/slices/recruitersSlice.js';
import RecruiterOpportunitiesModal from "../../../shared/components/RecruiterOpportunitiesModal.jsx";
import { confirmDialog, infoDialog } from "../../../shared/components/AppDialog.jsx";

export default function Recruiters() {
  const dispatch = useDispatch();
  const recruiters = useSelector(selectRecruiterRegistrations);
  const { selectedId, error, loading, removingId } = useSelector(selectCollegeRecruitersUi);
  const setSelectedId = (v) => dispatch(setCollegeRecruitersUi({ selectedId: v }));
  const setError = useCallback((v) => dispatch(setCollegeRecruitersUi({ error: v })), [dispatch]);
  const setLoading = useCallback((v) => dispatch(setCollegeRecruitersUi({ loading: v })), [dispatch]);
  const setRemovingId = (v) => dispatch(setCollegeRecruitersUi({ removingId: v }));
  const selected = recruiters.find((recruiter) => recruiter.id === selectedId);
  const loadRecruiters = useCallback(async () => {
    try {
      await dispatch(fetchRecruiterRegistrations()).unwrap();
      setError('');
    } catch (failure) {
      setError(errorMessage(failure, 'Could not load recruiters.'));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);
  useEffect(() => {
    loadRecruiters();
  }, [loadRecruiters]);
  const removeRecruiter = async (recruiter) => {
    if (!await confirmDialog(`Remove recruiter ${recruiter.name} (${recruiter.email})? Their login access will be removed. This cannot be undone.`)) return;
    setRemovingId(recruiter.id);
    try {
      await dispatch(deleteRecruiter(recruiter.id)).unwrap();
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
                      onClick={() => setSelectedId(recruiter.id)}
                    >
                      {recruiter.name}
                    </button>
                  </td>
                  <td>{recruiter.company}</td>
                  <td>{recruiter.status}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => setSelectedId(recruiter.id)}
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
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}
