// Data Flow (roles/college-admin/pages/Messages.jsx):
// Backend API -> Redux Thunks/Slices (collegeAdminSlice, messagesSlice) -> useSelector(selectCollegeMessagesUi, selectInboxMessages) -> UI render
// User Actions -> dispatch(fetchInboxMessages) -> Slice reducers/thunks -> Redux state update
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Megaphone, Inbox } from 'lucide-react';
import { errorMessage } from '../../../services/api.js';
import { selectCollegeMessagesUi, setCollegeMessagesUi } from '../store/collegeAdminSlice.js';
import { fetchInboxMessages, selectInboxMessages } from '../../../store/slices/messagesSlice.js';

const fmt = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/** Messages sent to this college by the platform's super admin. */
export default function Messages({ onSeen }) {
  const dispatch = useDispatch();
  const messages = useSelector(selectInboxMessages);
  const { error, loaded } = useSelector(selectCollegeMessagesUi);
  const setError = (v) => dispatch(setCollegeMessagesUi({ error: v }));
  const setLoaded = (v) => dispatch(setCollegeMessagesUi({ loaded: v }));

  useEffect(() => {
    dispatch(fetchInboxMessages()).unwrap()
      .then(() => { onSeen?.(); })
      .catch((e) => { setError(errorMessage(e, 'Could not load messages.')); })
      .finally(() => setLoaded(true));
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="section-header">
        <h2>Messages from Super Admin</h2>
        <span className="badge badge-blue">{messages?.length ?? 0} message{messages?.length === 1 ? '' : 's'}</span>
      </div>
      {error && <div className="badge badge-red" style={{ marginBottom: 12 }}>{error}</div>}
      {loaded && messages.length === 0 && !error && (
        <div className="empty-state"><Inbox /><p>No messages yet. Anything the platform team sends your college shows up here.</p></div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(messages || []).map((m) => (
          <div key={m.id} className="ann-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {m.toType === 'all' ? <Megaphone size={18} color="#0ea5e9" /> : <Mail size={18} color="#0ea5e9" />}
                <strong className="ann-card-title">{m.subject}</strong>
              </div>
              <span className={`badge ${m.toType === 'all' ? 'badge-purple' : 'badge-blue'}`}>{m.toType === 'all' ? 'Broadcast' : 'Direct'}</span>
            </div>
            <p className="ann-card-body" style={{ marginTop: 8 }}>{m.message}</p>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{fmt(m.sentAt)} · Super Admin</div>
          </div>
        ))}
      </div>
    </>
  );
}
