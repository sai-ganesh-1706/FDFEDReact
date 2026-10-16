/** Persist the current in-app screen so a normal browser refresh restores it. */
export function readSavedPage(key, fallback, allowedPages) {
  try {
    const saved = sessionStorage.getItem(key);
    return saved && allowedPages.includes(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

export function savePage(key, page) {
  try {
    sessionStorage.setItem(key, page);
  } catch {
    // Navigation still works when browser storage is unavailable.
  }
}

export const NAVIGATION_STATE_KEYS = [
  'cn_active_college_admin_tab',
  'cn_active_super_admin_tab',
  'cn_active_recruiter_tab',
  'cn_active_placement_page',
  'cn_active_alumni_page',
];
