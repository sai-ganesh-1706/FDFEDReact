// Data Flow (roles/alumni/components/AlumniNotifications.jsx):
// Backend API -> Redux Thunks/Slices (alumniSlice, notificationsSlice) -> useSelector(selectAlumniNotificationsOpen, selectInboxNotifications) -> UI render
// User Actions -> dispatch(fetchNotifications, markAllNotificationsRead, loadNotifications, markAllRead) -> Slice reducers/thunks -> Redux state update
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAlumniNotificationsOpen,
  toggleAlumniNotifications,
} from '../store/alumniSlice.js';
import {
  fetchNotifications,
  markAllNotificationsRead,
  selectInboxNotifications,
} from '../../../store/slices/notificationsSlice.js';

export default function AlumniNotifications() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectInboxNotifications);
  const isOpen = useSelector(selectAlumniNotificationsOpen);

  const loadNotifications = () => dispatch(fetchNotifications());

  useEffect(() => {
    loadNotifications();
    const refresh = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNotifications = async () => {
    const nextOpen = !isOpen;
    dispatch(toggleAlumniNotifications());
    if (nextOpen) await loadNotifications();
  };

  const markAllRead = () => dispatch(markAllNotificationsRead());

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="alumni-header-notifications">
      <button type="button" className="alumni-header-bell" onClick={openNotifications} aria-label="Notifications" aria-expanded={isOpen}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="alumni-header-notification-dot" />}
      </button>
      {isOpen && (
        <div className="alumni-header-notification-panel">
          <div className="alumni-header-notification-head">
            <strong>Notifications</strong>
            {unreadCount > 0 && <button type="button" onClick={markAllRead}>Mark all read</button>}
          </div>
          {notifications.length === 0 ? <p>No notifications yet.</p> : notifications.map((notification) => (
            <div key={notification.id} className={`alumni-header-notification-item${notification.isRead ? '' : ' unread'}`}>
              <strong>{notification.title}</strong>
              <span>{notification.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
