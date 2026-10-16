import { useCallback, useRef, useState } from 'react';

// Simple transient toast (auto-hides after 3s), matching the vanilla-JS pages' behavior.
export function useToast() {
    const [toast, setToast] = useState({ show: false, message: '' });
    const timerRef = useRef(null);

    const showToast = useCallback((message) => {
        setToast({ show: true, message });
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
    }, []);

    return { toast, showToast };
}

