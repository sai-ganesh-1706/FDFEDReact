import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './StoreContext.jsx';

const UIContext = createContext(null);

export function UIProvider({ children }) {
    const { store, markAllNotificationsRead, markNotificationRead } = useStore();
    const navigate = useNavigate();

    const [notifOpen, setNotifOpen] = useState(false);
    const [askQueryOpen, setAskQueryOpen] = useState(false);
    const [queryMessage, setQueryMessage] = useState('');
    const [successModal, setSuccessModal] = useState({ open: false, title: 'Success!', message: 'Operation completed.' });

    const toggleNotif = useCallback(() => setNotifOpen((v) => !v), []);
    const closeNotif = useCallback(() => setNotifOpen(false), []);

    const markAllRead = useCallback(() => {
        markAllNotificationsRead();
    }, [markAllNotificationsRead]);

    const readAndNavigate = useCallback(
        (idx, route) => {
            const notification = store.notificationsData[idx];
            if (notification) markNotificationRead(notification.id);
            setNotifOpen(false);
            if (route && route !== '#') navigate(`/candidate/${route.replace('.html', '')}`);
        },
        [store.notificationsData, markNotificationRead, navigate]
    );

    const openAskQuery = useCallback((e) => {
        if (e) e.preventDefault();
        setQueryMessage('');
        setAskQueryOpen(true);
    }, []);

    const closeAskQuery = useCallback(() => setAskQueryOpen(false), []);

    const submitQuery = useCallback(() => {
        setAskQueryOpen(false);
        setQueryMessage('');
        setSuccessModal({
            open: true,
            title: 'Query Sent',
            message: 'Your query was sent successfully. We will get back to you shortly.',
        });
    }, []);

    const showSuccess = useCallback((title, message) => {
        setSuccessModal({ open: true, title, message });
    }, []);

    const closeSuccess = useCallback(() => setSuccessModal((s) => ({ ...s, open: false })), []);

    const unreadCount = store.notificationsData.filter((n) => !n.isRead).length;

    const value = useMemo(
        () => ({
            notifOpen,
            toggleNotif,
            closeNotif,
            markAllRead,
            readAndNavigate,
            unreadCount,
            askQueryOpen,
            openAskQuery,
            closeAskQuery,
            queryMessage,
            setQueryMessage,
            submitQuery,
            successModal,
            showSuccess,
            closeSuccess,
        }),
        [
            notifOpen,
            toggleNotif,
            closeNotif,
            markAllRead,
            readAndNavigate,
            unreadCount,
            askQueryOpen,
            openAskQuery,
            closeAskQuery,
            queryMessage,
            submitQuery,
            successModal,
            showSuccess,
            closeSuccess,
        ]
    );

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error('useUI must be used within a UIProvider');
    return ctx;
}
