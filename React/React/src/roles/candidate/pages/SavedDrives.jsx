import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { errorMessage } from '../../../services/api.js';
import { useToast } from '../hooks/useToast.js';
import '../styles/features.css';

function daysLeft(deadline) {
    return Math.ceil((new Date(deadline) - new Date()) / 86400000);
}

export default function SavedDrives() {
    const { store, toggleSaved } = useStore();
    const { toast, showToast } = useToast();
    const navigate = useNavigate();

    const savedJobs = store.recruiterJobs.filter((j) => store.savedDriveIds.includes(j.id));

    async function removeSaved(jobId) {
        try {
            await toggleSaved(jobId, true);
            showToast('Removed from saved drives');
        } catch (error) {
            showToast(errorMessage(error, 'Could not update saved drives.'));
        }
    }

    function applyDrive(jobId) {
        navigate(`/candidate/opportunities?jobId=${jobId}`);
    }

    return (
        <>
            <div className="dashboard-scroll-area">
                <p className="page-subtitle">Drives you bookmarked — apply before the deadline!</p>

                {savedJobs.length === 0 ? (
                    <div className="empty-state">
                        <i className="bx bx-bookmark-heart" />
                        <h3>No saved drives yet</h3>
                        <p>Bookmark drives from Browse Opportunities and they will be collected here.</p>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/candidate/opportunities');
                            }}
                        >
                            Browse Drives &rarr;
                        </a>
                    </div>
                ) : (
                    <div className="drives-list">
                        {savedJobs.map((job) => {
                            const isIntern = job.type.includes('Internship');
                            const left = daysLeft(job.deadline);
                            const deadlineCls = left < 5 ? 'deadline-urgent' : 'deadline-ok';
                            return (
                                <div className="drive-card" key={job.id}>
                                    <div className="drive-icon">{isIntern ? '🎓' : '💼'}</div>
                                    <div className="drive-info">
                                        <div className="drive-title">{job.title}</div>
                                        <div className="drive-company">{job.company}</div>
                                        <div className="drive-tags">
                                            <span className="tag tag-green">💰 {job.salary}</span>
                                            <span className="tag tag-blue">📍 {job.location}</span>
                                            <span className="tag tag-gray">🎓 CGPA ≥ {job.cgpa}</span>
                                            <span className={`deadline-chip ${deadlineCls}`}>⏰ {left}d left</span>
                                        </div>
                                    </div>
                                    <div className="drive-actions">
                                        <button className="btn-drive-apply" onClick={() => applyDrive(job.id)}>
                                            Apply Now
                                        </button>
                                        <button className="btn-drive-remove" onClick={() => removeSaved(job.id)}>
                                            ✕ Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.message}</div>
        </>
    );
}

