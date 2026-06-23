export const OPERATOR_USERS_KEY = 'cat_mock_users';
export const OPERATOR_SESSION_KEY = 'cat_active_session';
export const REPORTS_STORAGE_KEY = 'cat_diagnostics_reports';
export const ADMIN_AUDIT_KEY = 'cat_admin_audit_log';
export const ACTIVE_WINDOW_MS = 15 * 60 * 1000;

export const getOperatorSession = () => {
  try {
    const session = localStorage.getItem(OPERATOR_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

export const getUserStatus = (user) => {
  const session = getOperatorSession();
  const lastActivity = Date.parse(user?.lastActivity || user?.lastLogin || user?.updatedAt || 0);
  const activeBySession = session?.username === user?.username;
  const activeByRecentActivity = Number.isFinite(lastActivity) && Date.now() - lastActivity <= ACTIVE_WINDOW_MS;
  return activeBySession || activeByRecentActivity ? 'Active' : 'Inactive';
};

export const normalizeUserRecord = (user) => ({
  ...user,
  branch: undefined,
  department: user.department || '',
  status: getUserStatus(user),
  lastActivity: user.lastActivity || user.lastLogin || user.updatedAt || null,
});

export const relativeTime = (value) => {
  if (!value) return 'Never';
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return 'Never';
  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

export const appendAuditLog = (user, action, details = '') => {
  try {
    const logs = JSON.parse(localStorage.getItem(ADMIN_AUDIT_KEY) || '[]');
    logs.unshift({
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: user?.username || user?.id || 'unknown',
      userName: user?.fullName || user?.username || 'Operator',
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      userAgent: navigator.userAgent,
    });
    localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(logs.slice(0, 1000)));
  } catch (e) {
    console.warn('Audit log write failed:', e);
  }
};

export const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};
