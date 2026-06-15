import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AdminAuthContext = createContext();

// Storage keys (separate from operator AuthContext)
const ADMIN_USERS_KEY = 'cat_admin_users';
const ADMIN_SESSION_KEY = 'cat_admin_session';
const ADMIN_AUDIT_KEY = 'cat_admin_audit_log';
const ADMIN_LOCKOUT_KEY = 'cat_admin_lockout';

// Password strength validator
export const validatePasswordStrength = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
  return errors;
};

// Audit log helper
const addAuditLog = (user, action, details = '') => {
  try {
    const logs = JSON.parse(localStorage.getItem(ADMIN_AUDIT_KEY) || '[]');
    logs.unshift({
      id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user?.id || 'unknown',
      userName: user?.fullName || user?.username || 'unknown',
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1', // Mock IP
      userAgent: navigator.userAgent,
    });
    // Keep only last 1000 logs
    if (logs.length > 1000) logs.length = 1000;
    localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('Audit log write failed:', e);
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUsers, setAdminUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(u => ({
          ...u,
          permissions: u.permissions || [],
          status: u.status || 'Active',
        }));
      }
    } catch (e) { /* ignore */ }
    // Initialize with empty array - admin users must be added via addAdminUser
    return [];
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_KEY);
      if (saved) {
        const session = JSON.parse(saved);
        // Check if session is expired (30 min inactivity)
        if (session.lastActivity && Date.now() - session.lastActivity > 30 * 60 * 1000) {
          localStorage.removeItem(ADMIN_SESSION_KEY);
          return null;
        }
        return session;
      }
    } catch (e) { /* ignore */ }
    return null;
  });

  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const inactivityTimer = useRef(null);
  const LOCKOUT_THRESHOLD = 5; // 5 failed attempts
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Sync admin users to localStorage
  useEffect(() => {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(adminUsers));
  }, [adminUsers]);

  // Session management: update last activity
  const updateSessionActivity = useCallback(() => {
    if (currentAdmin) {
      const updated = { ...currentAdmin, lastActivity: Date.now() };
      setCurrentAdmin(updated);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(updated));
    }
  }, [currentAdmin]);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!currentAdmin) return;

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        addAuditLog(currentAdmin, 'Auto Logout', 'Session expired due to inactivity');
        setCurrentAdmin(null);
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }, 30 * 60 * 1000);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, updateSessionActivity));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, updateSessionActivity));
    };
  }, [currentAdmin, updateSessionActivity]);

  // Admin Login with account lockout
  const adminLogin = async (username, password) => {
    setAdminLoading(true);
    setAdminError('');

    // Check lockout
    try {
      const lockoutData = JSON.parse(localStorage.getItem(ADMIN_LOCKOUT_KEY) || '{}');
      if (lockoutData.username === username && lockoutData.attempts >= LOCKOUT_THRESHOLD) {
        const elapsed = Date.now() - lockoutData.lastAttempt;
        if (elapsed < LOCKOUT_DURATION) {
          const remainingMinutes = Math.ceil((LOCKOUT_DURATION - elapsed) / 60000);
          setAdminLoading(false);
          return {
            success: false,
            message: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
            locked: true,
            remainingMinutes,
          };
        } else {
          // Reset lockout after duration
          localStorage.removeItem(ADMIN_LOCKOUT_KEY);
        }
      }
    } catch (e) { /* ignore */ }

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200));

    const user = adminUsers.find(
      u => (u.username === username || u.email === username) && 
           u.password === password && 
           u.status === 'Active'
    );

    if (user) {
      // Successful login - reset lockout
      localStorage.removeItem(ADMIN_LOCKOUT_KEY);
      
      const sessionUser = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        lastActivity: Date.now(),
      };

      setCurrentAdmin(sessionUser);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionUser));

      // Update last login for user
      setAdminUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
      ));

      // Audit log
      addAuditLog(sessionUser, 'Login', 'Successful admin login');

      setAdminLoading(false);
      return { success: true, user: sessionUser };
    } else {
      // Failed login - increment lockout counter
      const existingUser = adminUsers.find(
        u => u.username === username || u.email === username
      );

      if (existingUser && existingUser.status !== 'Active') {
        setAdminLoading(false);
        return { success: false, message: 'Account is deactivated. Contact support.' };
      }

      try {
        const lockoutData = JSON.parse(localStorage.getItem(ADMIN_LOCKOUT_KEY) || '{}');
        const newAttempts = (lockoutData.username === username ? (lockoutData.attempts || 0) : 0) + 1;
        localStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify({
          username,
          attempts: newAttempts,
          lastAttempt: Date.now(),
        }));

        if (newAttempts >= LOCKOUT_THRESHOLD) {
          setAdminLoading(false);
          return {
            success: false,
            message: `Account locked due to ${LOCKOUT_THRESHOLD} failed attempts. Try again in 15 minutes.`,
            locked: true,
          };
        }

        const remaining = LOCKOUT_THRESHOLD - newAttempts;
        setAdminLoading(false);
        return {
          success: false,
          message: `Invalid credentials. ${remaining} attempt(s) remaining before lockout.`,
          attemptsRemaining: remaining,
        };
      } catch (e) { /* ignore */ }

      setAdminLoading(false);
      return { success: false, message: 'Invalid username or password.' };
    }
  };

  // Admin Logout
  const adminLogout = () => {
    if (currentAdmin) {
      addAuditLog(currentAdmin, 'Logout', 'Manual logout');
    }
    setCurrentAdmin(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  // Check permission
  const hasPermission = (permission) => {
    if (!currentAdmin) return false;
    if (currentAdmin.role === 'Super Admin') return true;
    return currentAdmin.permissions?.includes(permission) || false;
  };

  // Get all admin users (for super admin)
  const getAdminUsers = () => adminUsers;

  // Add a new admin user
  const addAdminUser = (userData) => {
    if (!hasPermission('users.write') && currentAdmin.role !== 'Super Admin') {
      return { success: false, message: 'Permission denied.' };
    }

    const exists = adminUsers.some(
      u => u.username === userData.username || u.email === userData.email
    );
    if (exists) return { success: false, message: 'Username or email already exists.' };

    const newUser = {
      id: `ADM-${String(adminUsers.length + 1).padStart(3, '0')}`,
      ...userData,
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      permissions: userData.permissions || [],
    };

    setAdminUsers(prev => [...prev, newUser]);
    addAuditLog(currentAdmin, 'Create Admin User', `Created user: ${newUser.username} (${newUser.role})`);
    return { success: true, user: newUser };
  };

  // Update admin user
  const updateAdminUser = (userId, updates) => {
    if (!hasPermission('users.write') && currentAdmin.role !== 'Super Admin') {
      return { success: false, message: 'Permission denied.' };
    }

    setAdminUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    ));
    addAuditLog(currentAdmin, 'Update Admin User', `Updated user: ${userId}`);
    return { success: true };
  };

  // Delete admin user
  const deleteAdminUser = (userId) => {
    if (!hasPermission('users.delete') && currentAdmin.role !== 'Super Admin') {
      return { success: false, message: 'Permission denied.' };
    }
    if (userId === currentAdmin.id) return { success: false, message: 'Cannot delete yourself.' };
    if (userId === 'ADM-001') return { success: false, message: 'Cannot delete the primary admin.' };

    setAdminUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog(currentAdmin, 'Delete Admin User', `Deleted user: ${userId}`);
    return { success: true };
  };

  // Reset admin password
  const resetAdminPassword = (userId, newPassword) => {
    if (!hasPermission('users.write') && currentAdmin.role !== 'Super Admin') {
      return { success: false, message: 'Permission denied.' };
    }

    const validationErrors = validatePasswordStrength(newPassword);
    if (validationErrors.length > 0) {
      return { success: false, message: `Password must include: ${validationErrors.join(', ')}` };
    }

    setAdminUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, password: newPassword } : u
    ));
    addAuditLog(currentAdmin, 'Reset Password', `Password reset for user: ${userId}`);
    return { success: true };
  };

  // Get audit logs
  const getAuditLogs = () => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_AUDIT_KEY) || '[]');
    } catch (e) {
      return [];
    }
  };

  // Clear audit logs (super admin only)
  const clearAuditLogs = () => {
    if (!currentAdmin || currentAdmin.role !== 'Super Admin') {
      return { success: false, message: 'Permission denied.' };
    }
    localStorage.setItem(ADMIN_AUDIT_KEY, '[]');
    addAuditLog(currentAdmin, 'Clear Audit Logs', 'All audit logs cleared');
    return { success: true };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        currentAdmin,
        adminLoading,
        adminError,
        adminLogin,
        adminLogout,
        hasPermission,
        getAdminUsers,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        resetAdminPassword,
        getAuditLogs,
        clearAuditLogs,
        addAuditLog,
        validatePasswordStrength,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};