import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  OPERATOR_USERS_KEY,
  OPERATOR_SESSION_KEY,
  ADMIN_AUDIT_KEY,
  ACTIVE_WINDOW_MS,
} from '../services/userStatus';

const AuthContext = createContext(null);

const appendAuditLog = (user, action, details = '') => {
  try {
    const logs = JSON.parse(localStorage.getItem(ADMIN_AUDIT_KEY) || '[]');
    logs.unshift({
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: user?.username || 'unknown',
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

const getDerivedStatus = (user) => {
  const saved = localStorage.getItem(OPERATOR_SESSION_KEY);
  const session = saved ? JSON.parse(saved) : null;
  const lastActivity = Date.parse(user?.lastActivity || user?.lastLogin || 0);
  const activeBySession = session?.username === user?.username;
  const activeByRecentActivity =
    Number.isFinite(lastActivity) && Date.now() - lastActivity <= ACTIVE_WINDOW_MS;
  return activeBySession || activeByRecentActivity ? 'Active' : 'Inactive';
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(OPERATOR_USERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).map((user) => ({
          ...user,
          branch: undefined,
          status: getDerivedStatus(user),
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(OPERATOR_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [loadingMsg, setLoadingMsg] = useState('');

  useEffect(() => {
    localStorage.setItem(
      OPERATOR_USERS_KEY,
      JSON.stringify(users.map((user) => ({ ...user, branch: undefined })))
    );
  }, [users]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (identifier, password) => {
    setLoadingMsg('Authenticating...');
    await new Promise((r) => setTimeout(r, 900));
    setLoadingMsg('Verifying credentials...');
    await new Promise((r) => setTimeout(r, 900));

    const normalizedIdentifier = identifier.toLowerCase();
    const user = users.find(
      (u) =>
        ((u.email && u.email.toLowerCase() === normalizedIdentifier) ||
          u.username.toLowerCase() === normalizedIdentifier) &&
        u.password === password
    );

    if (user) {
      const now = new Date().toISOString();
      setUsers((prev) =>
        prev.map((u) =>
          u.username === user.username
            ? { ...u, lastActivity: now, branch: undefined }
            : u
        )
      );
      const sessionUser = {
        username: user.username,
        fullName: user.fullName,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'Operator',
        department: user.department || '',
        lastActivity: now,
      };
      setCurrentUser(sessionUser);
      localStorage.setItem(OPERATOR_SESSION_KEY, JSON.stringify(sessionUser));
      appendAuditLog(sessionUser, 'User Login', 'Operator login successful');
      setLoadingMsg('');
      return { success: true };
    } else {
      setLoadingMsg('');
      return { success: false, message: 'Incorrect email or username or password.' };
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const initiateRegister = async (userData) => {
    setLoadingMsg('Creating account...');
    await new Promise((r) => setTimeout(r, 1200));
    setLoadingMsg('');

    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === userData.username.toLowerCase() ||
        (u.email && u.email.toLowerCase() === userData.email.toLowerCase())
    );

    if (exists) {
      return {
        success: false,
        message: 'An account with this username or email already exists.',
      };
    }

    const now = new Date().toISOString();
    const newUser = {
      ...userData,
      role: 'Operator',
      department: userData.department || '',
      status: 'Active',
      createdAt: now,
      lastActivity: now,
    };
    delete newUser.branch;
    setUsers((prev) => [...prev, { ...newUser, branch: undefined }]);

    const sessionUser = {
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email || '',
      phone: newUser.phone || '',
      role: newUser.role,
      department: newUser.department || '',
      lastActivity: now,
    };
    setCurrentUser(sessionUser);
    localStorage.setItem(OPERATOR_SESSION_KEY, JSON.stringify(sessionUser));
    appendAuditLog(sessionUser, 'User Creation', `Operator account created: ${sessionUser.username}`);
    return { success: true };
  };

  // ── Update Profile / Change Password ──────────────────────────────────────
  const updateUser = (updates) => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };

    // Password-change path — verify current password first
    if (updates.newPassword !== undefined) {
      const storedUser = users.find((u) => u.username === currentUser.username);
      if (!storedUser || storedUser.password !== updates.currentPassword) {
        return { success: false, message: 'Current password is incorrect.' };
      }
      // Build final update payload
      updates = {
        ...updates,
        password: updates.newPassword,
      };
      delete updates.currentPassword;
      delete updates.newPassword;
      delete updates.confirmPassword;
    }

    // Persist to users array
    setUsers((prev) =>
      prev.map((u) =>
        u.username === currentUser.username
          ? { ...u, ...updates, branch: undefined }
          : u
      )
    );

    // Refresh session for display-relevant fields
    const SESSION_FIELDS = ['fullName', 'email', 'phone', 'department', 'role'];
    const sessionUpdates = {};
    SESSION_FIELDS.forEach((key) => {
      if (updates[key] !== undefined) sessionUpdates[key] = updates[key];
    });
    if (Object.keys(sessionUpdates).length > 0) {
      const newSession = { ...currentUser, ...sessionUpdates };
      setCurrentUser(newSession);
      localStorage.setItem(OPERATOR_SESSION_KEY, JSON.stringify(newSession));
    }

    appendAuditLog(currentUser, 'Profile Updated', 'User updated their profile');
    return { success: true };
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    if (currentUser) {
      appendAuditLog(currentUser, 'User Logout', 'Operator logout');
    }
    setCurrentUser(null);
    localStorage.removeItem(OPERATOR_SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        initiateRegister,
        updateUser,
        loadingMsg,
        setLoadingMsg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};