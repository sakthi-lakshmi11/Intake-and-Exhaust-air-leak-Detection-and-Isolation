import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const MOCK_USERS_KEY = 'cat_mock_users';
const SESSION_KEY = 'cat_active_session';

const INITIAL_USERS = [
  {
    username: 'operator1',
    email: 'operator1@gmail.com',
    employeeId: 'EMP-1001',
    fullName: 'David Miller',
    role: 'Operator',
    branch: 'Peoria HQ, IL',
    department: 'Heavy Assembly',
    password: '123456'
  },
  {
    username: 'admin1',
    email: 'admin1@gmail.com',
    employeeId: 'EMP-9009',
    fullName: 'Sarah Jenkins',
    role: 'Administrator',
    branch: 'Peoria HQ, IL',
    department: 'Quality Assurance',
    password: '123456'
  }
];

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(MOCK_USERS_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [loadingMsg, setLoadingMsg] = useState('');
  const [tempRegisterData, setTempRegisterData] = useState(null);

  // Sync users database to localStorage
  useEffect(() => {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }, [users]);

  // Simplified Login — username or email + password
  const login = async (identifier, password) => {
    setLoadingMsg('Authenticating...');
    await new Promise((r) => setTimeout(r, 900));
    setLoadingMsg('Verifying credentials...');
    await new Promise((r) => setTimeout(r, 900));

    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === identifier.toLowerCase() ||
          (u.email && u.email.toLowerCase() === identifier.toLowerCase())) &&
        u.password === password
    );

    if (user) {
      const sessionUser = {
        username: user.username,
        fullName: user.fullName,
        role: user.role || 'Operator',
        branch: user.branch || '',
        department: user.department || ''
      };
      setCurrentUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setLoadingMsg('');
      return { success: true };
    } else {
      setLoadingMsg('');
      return { success: false, message: 'Incorrect username/email or password.' };
    }
  };

  // Simplified Registration — no OTP, no org fields
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
      return { success: false, message: 'An account with this username or email already exists.' };
    }

    const newUser = { ...userData, role: 'Operator', branch: '', department: '' };
    setUsers((prev) => [...prev, newUser]);
    const sessionUser = {
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      branch: '',
      department: ''
    };
    setCurrentUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        initiateRegister,
        loadingMsg,
        setLoadingMsg
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
