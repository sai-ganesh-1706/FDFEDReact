import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api, { errorMessage, readSession } from '../../../services/api.js';

// Candidate workspace store. It keeps the shape the pages already read
// (store.currentUser, store.recruiterJobs, ...) but is filled from the API and
// every change that matters is written back to it.

const EMPTY_RESUME = {
    uploadedResume: null,
    resumeHistory: [],
    skills: [],
    languages: [],
    codingProfiles: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    extracurricular: [],
    additionalDocs: [],
};

const initials = (name = '') => name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// Company suffixes are not useful for referral eligibility. This permits an
// alumnus at "TechCorp Solutions" to be discovered for a "TechCorp" drive,
// while still requiring the same underlying company name.
const COMPANY_SUFFIXES = new Set([
    'and', 'co', 'company', 'corp', 'corporation', 'inc', 'incorporated',
    'limited', 'llc', 'llp', 'private', 'pvt', 'service', 'services',
    'solution', 'solutions', 'technologies', 'technology', 'ltd',
]);

function referralCompanyKey(company) {
    return String(company || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((word) => word && !COMPANY_SUFFIXES.has(word))
        .join(' ');
}

function toCurrentUser(user, resumeData = {}) {
    return {
        id: user.id,
        name: user.name || '',
        headline: user.headline || '',
        role: 'Student',
        avatar: user.avatar || initials(user.name),
        avatarImage: resumeData.avatarImage || '',
        bannerImage: resumeData.bannerImage || '',
        department: user.department || '',
        cgpa: user.cgpa != null ? String(user.cgpa) : '',
        backlogs: user.backlogs ?? 0,
        rollNumber: user.rollNumber || '',
        collegeId: user.collegeId ?? null,
        batch: user.batchLabel || '',
        location: user.location || '',
        university: user.university || '',
        email: user.email || '',
        phone: user.phone || '',
        about: user.about || '',
        socialLinks: { github: '', linkedin: '', portfolio: '', ...(user.socialLinks || {}) },
    };
}

const toAnnouncement = (a) => ({
    id: a.id,
    title: a.title,
    message: a.message,
    date: new Date(a.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    priority: a.type === 'urgent' ? 'high' : a.type === 'placement' ? 'medium' : 'low',
});

function buildStore({ user, jobs, applications, notifications, savedIds, schedule, referrals, announcements }) {
    const savedProfile = user.resumeData?.profileResumeData || {};
    // Older accounts store skills directly on the user. Once a candidate edits
    // their profile, resumeData becomes the source of truth (even for an
    // intentionally empty skills list).
    const hasSavedSkills = Object.prototype.hasOwnProperty.call(savedProfile, 'skills');
    const appByOpp = new Map(applications.map((a) => [a.opportunityId, a]));
    const recruiterJobs = jobs.map((job) => {
        const app = appByOpp.get(job.id);
        const active = app && app.status !== 'Withdrawn';
        return { ...job, appliedStatus: active ? app.status : null };
    });
    const count = (statuses) => applications.filter((a) => statuses.includes(a.status)).length;
    const today = new Date().toISOString().split('T')[0];
    const upcoming = schedule
        .filter((s) => s.date >= today)
        .map((s) => ({
            id: `schedule-${s.id}`,
            appId: s.applicationId ?? applications.find(
              (a) => a.opportunityId === s.opportunityId
            )?.id,
            title: s.title,
            company: s.company,
            role: s.jobTitle,
            date: s.date,
            time: s.time,
            type: 'Interview',
            link: s.link,
        }));
    return {
        currentUser: toCurrentUser(user, user.resumeData),
        profileResumeData: {
            ...EMPTY_RESUME,
            ...savedProfile,
            skills: hasSavedSkills ? savedProfile.skills : (user.skills || []),
        },
        dashboardStats: {
            applications: applications.length,
            availableJobs: jobs.filter((j) => /full/i.test(j.type)).length,
            internships: jobs.filter((j) => /intern/i.test(j.type)).length,
            interviews: count(['Interview']),
        },
        recruiterJobs,
        myApplications: applications,
        applicationStats: {
            shortlisted: count(['Shortlisted']),
            interviews: count(['Interview']),
            offers: count(['Offer', 'Offered']),
            rejected: count(['Rejected']),
        },
        notificationsData: notifications,
        announcementsData: announcements.map(toAnnouncement),
        upcomingEvents: upcoming,
        savedDriveIds: savedIds,
        schedule,
        referralRequests: referrals,
    };
}

function emptyStore() {
    const session = readSession() || {};
    return buildStore({
        user: session, jobs: [], applications: [], notifications: [], savedIds: [], schedule: [], referrals: [], announcements: [],
    });
}

const StoreContext = createContext(null);

// A feature that is not available for this account answers with an error; treat that as "nothing yet".
const optional = (request, fallback) => request.then((r) => r.data).catch(() => fallback);

export function StoreProvider({ children }) {
    const session = readSession();
    const [store, setStore] = useState(emptyStore);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const hydrated = useRef(false);
    const lastSaved = useRef('');

    const load = useCallback(async ({ silent = false } = {}) => {
        if (!session?.id) {
            setLoading(false);
            return;
        }
        try {
            const [user, jobs, applications, notifications, savedIds, schedule, referrals, announcements] = await Promise.all([
                api.get(`/users/${session.id}`).then((r) => r.data),
                api.get('/opportunities').then((r) => r.data),
                api.get('/applications/my').then((r) => r.data),
                optional(api.get('/notifications'), []),
                optional(api.get('/features/candidate/saved-drive-ids'), []),
                optional(api.get('/assessments/my'), []),
                optional(api.get('/referrals/my'), []),
                optional(api.get('/announcements'), []),
            ]);
            const next = buildStore({
                user,
                jobs,
                applications,
                notifications,
                savedIds: savedIds.map(Number).filter((id) => !Number.isNaN(id)),
                schedule,
                referrals,
                announcements,
            });
            if (silent) {
                // Background refresh: never overwrite profile edits the candidate may be typing.
                setStore((prev) => ({ ...next, currentUser: prev.currentUser, profileResumeData: prev.profileResumeData }));
            } else {
                lastSaved.current = JSON.stringify(profilePayload(next));
                setStore(next);
            }
            setLoadError('');
            hydrated.current = true;
        } catch (error) {
            if (!silent) setLoadError(errorMessage(error, 'Could not load your data.'));
        }
    }, [session?.id]);

    useEffect(() => {
        let cancelled = false;
        load().finally(() => { if (!cancelled) setLoading(false); });
        // Keep the workspace fresh so recruiter / alumni replies show up without a manual reload.
        const timer = setInterval(() => { if (!document.hidden) load({ silent: true }); }, 20000);
        return () => { cancelled = true; clearInterval(timer); };
    }, [load]);

    // Local, instant updates (UI state). Server writes go through the actions below.
    const updateStore = useCallback((updaterFn) => {
        setStore((prev) => {
            const draft = typeof structuredClone === 'function' ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
            updaterFn(draft);
            return draft;
        });
    }, []);

    // Profile edits (details + resume sections) are saved shortly after the last change.
    useEffect(() => {
        if (!hydrated.current) return undefined;
        const payload = profilePayload(store);
        const serialised = JSON.stringify(payload);
        if (serialised === lastSaved.current) return undefined;
        const timer = setTimeout(() => {
            api.put(`/users/${session.id}`, payload)
                .then(() => { lastSaved.current = serialised; })
                .catch(() => { /* keep the local copy; the next edit retries */ });
        }, 700);
        return () => clearTimeout(timer);
    }, [store.currentUser, store.profileResumeData, session?.id]);

    const actions = useMemo(() => ({
        reload: () => load(),

        // Throws on failure so the page can tell the candidate what went wrong.
        async applyToJob(job, resumeFile) {
            await api.post('/applications', { opportunityId: job.id, resumeFile: resumeFile || undefined });
            await load();
        },

        async withdrawApplication(applicationId) {
            await api.patch(`/applications/${applicationId}/withdraw`);
            await load();
        },

        async toggleSaved(jobId, isSaved) {
            if (isSaved) await api.delete(`/features/candidate/drives/${jobId}/save`);
            else await api.post(`/features/candidate/drives/${jobId}/save`);
            updateStore((s) => {
                s.savedDriveIds = isSaved
                    ? s.savedDriveIds.filter((id) => id !== jobId)
                    : [...s.savedDriveIds, jobId];
            });
        },

        async markAllNotificationsRead() {
            updateStore((s) => s.notificationsData.forEach((n) => { n.isRead = true; }));
            await api.patch('/notifications/read-all').catch(() => {});
        },

        async markNotificationRead(notificationId) {
            updateStore((s) => {
                const n = s.notificationsData.find((item) => item.id === notificationId);
                if (n) n.isRead = true;
            });
            await api.patch(`/notifications/${notificationId}/read`).catch(() => {});
        },

        // Alumni of the company the candidate applied to (real accounts from the college directory).
        async fetchAlumniForCompany(company) {
            const { data } = await api.get('/users/alumni-directory');
            const wanted = referralCompanyKey(company);
            return data.filter((a) => referralCompanyKey(a.company) === wanted);
        },

        async requestReferral({ applicationId, opportunityId, alumniId, message }) {
            await api.post('/referrals', { opportunityId, applicationId, alumniId, userMessage: message });
            await load();
        },
    }), [load, updateStore]);

    const value = useMemo(
        () => ({ store, updateStore, loading, loadError, ...actions }),
        [store, updateStore, loading, loadError, actions]
    );

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function profilePayload(store) {
    const u = store.currentUser;
    return {
        name: u.name,
        email: u.email,
        headline: u.headline,
        location: u.location,
        university: u.university,
        phone: u.phone,
        about: u.about,
        batchLabel: u.batch,
        socialLinks: u.socialLinks,
        resumeData: {
            avatarImage: u.avatarImage,
            bannerImage: u.bannerImage,
            profileResumeData: store.profileResumeData,
        },
    };
}

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error('useStore must be used within a StoreProvider');
    return ctx;
}
