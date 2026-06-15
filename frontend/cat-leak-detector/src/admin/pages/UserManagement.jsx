import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Search, Plus, Edit, Trash2, X, CheckCircle, UserCheck,
  UserX, Key, Eye, AlertCircle, ChevronDown
} from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const USERS_STORAGE_KEY = 'cat_mock_users';

// TODO: Replace with /api/users for admin user management
const getUsers = () => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
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

// TODO: Replace with /api/users (GET, POST, PUT, DELETE)

export default function UserManagement() {
  const { currentAdmin, addAuditLog } = useAdminAuth();
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

    const now = new Date().toISOString();
    const newUser = { ...formData, status: 'Active', createdAt: now, lastActivity: now };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    addAuditLog(currentAdmin, 'Create User', `Created user: ${formData.username}`);
    setShowModal(null);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    const errors = {};
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
    addAuditLog(currentAdmin, 'Update User', `Updated user: ${selectedUser.username}`);
    setShowModal(null);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Remove operator "${user.fullName}"?`)) {
      const updated = users.filter(u => u.username !== user.username);
      setUsers(updated);
      saveUsers(updated);
      addAuditLog(currentAdmin, 'Delete User', `Removed user: ${user.username}`);
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = (user.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
    const updated = users.map(u =>
      u.username === user.username ? { ...u, status: newStatus } : u
    );
    setUsers(updated);
    saveUsers(updated);
    addAuditLog(currentAdmin, `${newStatus} User`, `${newStatus} user: ${user.username}`);
  };

  const openAddModal = () => {
    setFormData({ username: '', email: '', fullName: '', password: '', role: 'Operator', employeeId: '', branch: '', department: '' });
    setFormErrors({});
    setSelectedUser(null);
    setShowModal('add');
  };

  const openEditModal = (user) => {
    setFormData({ ...user, password: '' });
    setFormErrors({});
    setSelectedUser(user);
    setShowModal('edit');
  };

  return (
    <AdminLayout>
      <div className="p-6" style={FONT}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Operator Management</h1>
            <p className="text-xs text-gray-500 mt-1">{users.length} Total Operators</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFCD11] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Operator
          </button>
        </div>

        {/* Filters - White Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search operators..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50"
              />
            </div>
            <div className="flex gap-3">
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50">
                <option value="All">All Roles</option>
                <option value="Operator">Operator</option>
                <option value="Admin">Admin</option>
                <option value="Administrator">Administrator</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50">
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table - White */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Registered</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Last Active</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">No operators found</td>
                  </tr>
                ) : filtered.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-gray-600">{user.fullName?.charAt(0) || '?'}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{user.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-semibold uppercase text-gray-700">{user.role || 'Operator'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                        (user.status || 'Active') === 'Active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${(user.status || 'Active') === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{formatDate(user.lastActivity)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditModal(user)}
                          className="p-1.5 rounded text-gray-500 hover:text-[#FFCD11] hover:bg-[#FFCD11]/10 transition-colors" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded transition-colors ${
                            (user.status || 'Active') === 'Active' ? 'text-gray-500 hover:text-orange-600 hover:bg-orange-100/50'
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-100/50'
                          }`} title="Toggle">
                          {(user.status || 'Active') === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-100/50 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showModal === 'add' || showModal === 'edit') && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-end p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                {showModal === 'add' ? 'Register Operator' : 'Edit Operator'}
              </h2>
              <button onClick={() => setShowModal(null)} className="p-1 rounded text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formErrors.duplicate && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.duplicate}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Full Name *</label>
                <input value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.fullName ? 'border-red-300' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50`} />
                {formErrors.fullName && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.fullName}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Username *</label>
                <input value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                  disabled={showModal === 'edit'}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.username || showModal === 'edit' ? 'border-red-300 bg-gray-100' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50 disabled:opacity-60`} />
                {formErrors.username && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.username}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Email *</label>
                <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.email ? 'border-red-300' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50`} />
                {formErrors.email && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.email}</p>}
              </div>
              {showModal === 'add' && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                      className={`w-full pl-3 pr-10 py-2.5 rounded-lg border text-sm ${formErrors.password ? 'border-red-300' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50`} />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 text-gray-500">
                      {showPassword ? <Eye className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.password}</p>}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Employee ID</label>
                <input value={formData.employeeId} onChange={e => setFormData(p => ({ ...p, employeeId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Branch</label>
                <input value={formData.branch} onChange={e => setFormData(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(null)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={showModal === 'add' ? handleAddUser : handleEditUser}
                className="px-6 py-2 bg-[#FFCD11] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors">
                {showModal === 'add' ? 'Register' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}