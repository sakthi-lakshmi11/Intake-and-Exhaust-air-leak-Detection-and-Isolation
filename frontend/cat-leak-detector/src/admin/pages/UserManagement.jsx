import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Search, Plus, Edit, Trash2, X, CheckCircle, XCircle,
  UserCheck, UserX, Key, Filter, ChevronDown, Eye, EyeOff,
  AlertCircle, Shield
} from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const USERS_STORAGE_KEY = 'cat_mock_users';

const getUsers = () => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return '—'; }
};

// Local audit log helper
const addAuditLog = (user, action, details = '') => {
  try {
    const logs = JSON.parse(localStorage.getItem('cat_admin_audit_log') || '[]');
    logs.unshift({
      id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user?.username || 'unknown',
      userName: user?.fullName || user?.username || 'unknown',
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      userAgent: navigator.userAgent,
    });
    if (logs.length > 1000) logs.length = 1000;
    localStorage.setItem('cat_admin_audit_log', JSON.stringify(logs));
  } catch (e) {
    console.warn('Audit log write failed:', e);
  }
};

export default function UserManagement() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '', email: '', fullName: '', password: '', role: 'Operator',
    employeeId: '', branch: '', department: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const perPage = 10;

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search || 
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || u.role === filterRole;
    const matchStatus = filterStatus === 'All' || (u.status || 'Active') === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
      valA = new Date(valA).getTime() || 0;
      valB = new Date(valB).getTime() || 0;
    }
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const openAddModal = () => {
    setFormData({ username: '', email: '', fullName: '', password: '', role: 'Operator', employeeId: '', branch: '', department: '' });
    setFormErrors({});
    setSelectedUser(null);
    setShowModal('add');
  };

  const openEditModal = (user) => {
    setFormData({
      username: user.username || '', email: user.email || '', fullName: user.fullName || '',
      password: '', role: user.role || 'Operator', employeeId: user.employeeId || '',
      branch: user.branch || '', department: user.department || ''
    });
    setFormErrors({});
    setSelectedUser(user);
    setShowModal('edit');
  };

  const openResetPassword = (user) => {
    setFormData({ password: '', confirmPassword: '' });
    setFormErrors({});
    setSelectedUser(user);
    setShowModal('resetPassword');
  };

  const handleAddUser = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Required';
    if (!formData.email.trim()) errors.email = 'Required';
    if (!formData.fullName.trim()) errors.fullName = 'Required';
    if (!formData.password) errors.password = 'Required';
    else if (formData.password.length < 6) errors.password = 'Min 6 characters';
    if (users.some(u => u.username === formData.username)) errors.username = 'Username taken';
    if (users.some(u => u.email === formData.email)) errors.email = 'Email taken';

    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    const newUser = {
      ...formData,
      role: formData.role || 'Operator',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    addAuditLog(currentUser, 'Create User', `Created user: ${formData.username}`);
    setShowModal(null);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Required';
    if (!formData.email.trim()) errors.email = 'Required';
    if (!formData.fullName.trim()) errors.fullName = 'Required';
    const duplicateUser = users.find(u => 
      (u.username === formData.username || u.email === formData.email) && 
      u.username !== selectedUser.username
    );
    if (duplicateUser) errors.duplicate = 'Username or email already in use';

    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    const updated = users.map(u => 
      u.username === selectedUser.username ? { ...u, ...formData, password: u.password } : u
    );
    setUsers(updated);
    saveUsers(updated);
    addAuditLog(currentUser, 'Update User', `Updated user: ${selectedUser.username}`);
    setShowModal(null);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Delete user "${user.fullName}"? This action cannot be undone.`)) {
      const updated = users.filter(u => u.username !== user.username);
      setUsers(updated);
      saveUsers(updated);
      addAuditLog(currentUser, 'Delete User', `Deleted user: ${user.username}`);
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = (user.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
    const updated = users.map(u => 
      u.username === user.username ? { ...u, status: newStatus } : u
    );
    setUsers(updated);
    saveUsers(updated);
    addAuditLog(currentUser, newStatus === 'Active' ? 'Activate User' : 'Deactivate User', 
      `${newStatus} user: ${user.username}`);
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    const errors = {};
    if (!formData.password) errors.password = 'Required';
    else if (formData.password.length < 6) errors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    const updated = users.map(u => 
      u.username === selectedUser.username ? { ...u, password: formData.password } : u
    );
    setUsers(updated);
    saveUsers(updated);
    addAuditLog(currentUser, 'Reset Password', `Password reset for user: ${selectedUser.username}`);
    setShowModal(null);
  };

  const SortHeader = ({ field, children }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700 select-none"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === field && (
          <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
        )}
      </div>
    </th>
  );

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6" style={FONT}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">User Management</h1>
            <p className="text-xs text-gray-500 mt-1">{users.length} total users</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add User
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={filterRole}
                onChange={e => { setFilterRole(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50"
              >
                <option value="All">All Roles</option>
                <option value="Operator">Operator</option>
                <option value="Admin">Admin</option>
                <option value="Administrator">Administrator</option>
                <option value="Engineer">Engineer</option>
                <option value="Manager">Manager</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortHeader field="fullName">Name</SortHeader>
                  <SortHeader field="email">Email</SortHeader>
                  <SortHeader field="role">Role</SortHeader>
                  <SortHeader field="status">Status</SortHeader>
                  <SortHeader field="createdAt">Registered</SortHeader>
                  <SortHeader field="lastLogin">Last Login</SortHeader>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">No users found</td>
                  </tr>
                ) : paginated.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cat-yellow/10 border border-cat-yellow/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-cat-yellow">{user.fullName?.charAt(0) || '?'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                          <p className="text-[10px] text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{user.email || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        user.role === 'Admin' || user.role === 'Administrator' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'Operator' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role || 'Operator'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                        (user.status || 'Active') === 'Active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(user.status || 'Active') === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{formatDate(user.lastLogin)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            (user.status || 'Active') === 'Active'
                              ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                              : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                          }`}
                          title={(user.status || 'Active') === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {(user.status || 'Active') === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openResetPassword(user)}
                          className="p-1.5 rounded text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                      currentPage === i + 1
                        ? 'bg-cat-yellow text-cat-black'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showModal === 'add' || showModal === 'edit') && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                {showModal === 'add' ? 'Add New User' : 'Edit User'}
              </h2>
              <button onClick={() => setShowModal(null)} className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formErrors.duplicate && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  {formErrors.duplicate}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Full Name *</label>
                  <input value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.fullName ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                  {formErrors.fullName && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.fullName}</p>}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Username *</label>
                  <input value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.username ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                  {formErrors.username && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.username}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.email ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                  {formErrors.email && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.email}</p>}
                </div>
                {showModal === 'add' && (
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                        className={`w-full pl-3 pr-10 py-2.5 rounded-lg border text-sm ${formErrors.password ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 cursor-pointer">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {formErrors.password && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.password}</p>}
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                    <option>Operator</option>
                    <option>Admin</option>
                    <option>Administrator</option>
                    <option>Engineer</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Employee ID</label>
                  <input value={formData.employeeId} onChange={e => setFormData(p => ({ ...p, employeeId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Branch</label>
                  <input value={formData.branch} onChange={e => setFormData(p => ({ ...p, branch: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Department</label>
                  <input value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(null)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
              <button onClick={showModal === 'add' ? handleAddUser : handleEditUser}
                className="px-6 py-2 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all cursor-pointer">
                {showModal === 'add' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showModal === 'resetPassword' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Reset Password</h2>
              <button onClick={() => setShowModal(null)} className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500">Resetting password for <span className="font-semibold text-gray-700">{selectedUser.fullName}</span></p>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">New Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    className={`w-full pl-3 pr-10 py-2.5 rounded-lg border text-sm ${formErrors.password ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 cursor-pointer">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.password}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Confirm Password *</label>
                <input type="password" value={formData.confirmPassword} onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                {formErrors.confirmPassword && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.confirmPassword}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(null)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleResetPassword}
                className="px-6 py-2 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all cursor-pointer">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}