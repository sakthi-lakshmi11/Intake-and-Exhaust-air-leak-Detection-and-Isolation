import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { Shield, Search, Filter, ChevronDown, Download, Trash2, Clock, User, Activity } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function AuditLogs() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  const getAuditLogs = () => {
    try {
      return JSON.parse(localStorage.getItem('cat_admin_audit_log') || '[]');
    } catch (e) {
      return [];
    }
  };

  useEffect(() => { setLogs(getAuditLogs()); }, []);

  const filtered = logs.filter(l => {
    const matchSearch = !search ||
      l.userName?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'All' || l.action === filterAction;
    return matchSearch && matchAction;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  const exportLogs = () => {
    const headers = ['ID', 'User', 'Action', 'Details', 'Timestamp', 'IP Address'];
    const rows = filtered.map(l => [l.id, l.userName, l.action, l.details, l.timestamp, l.ip]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit_logs_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (window.confirm('Clear all audit logs? This action is irreversible.')) {
      localStorage.setItem('cat_admin_audit_log', '[]');
      setLogs([]);
    }
  };

  const actionColors = {
    'Login': 'bg-green-100 text-green-700',
    'Logout': 'bg-gray-100 text-gray-700',
    'Auto Logout': 'bg-orange-100 text-orange-700',
    'Create User': 'bg-blue-100 text-blue-700',
    'Update User': 'bg-blue-100 text-blue-700',
    'Delete User': 'bg-red-100 text-red-700',
    'Activate User': 'bg-green-100 text-green-700',
    'Deactivate User': 'bg-orange-100 text-orange-700',
    'Reset Password': 'bg-purple-100 text-purple-700',
    'Create Admin User': 'bg-blue-100 text-blue-700',
    'Delete Admin User': 'bg-red-100 text-red-700',
    'Update Admin User': 'bg-blue-100 text-blue-700',
    'Clear Audit Logs': 'bg-red-100 text-red-700',
  };

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6" style={FONT}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Audit Logs</h1>
            <p className="text-xs text-gray-500 mt-1">{logs.length} total entries</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportLogs} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            {currentUser?.role === 'Admin' && (
              <button onClick={handleClearLogs} className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by user, action, or details..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
            </div>
            <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
              <option value="All">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Timestamp</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Action</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                      <Shield className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                      No audit log entries found
                    </td>
                  </tr>
                ) : paginated.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{log.userName}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                      currentPage === i + 1 ? 'bg-cat-yellow text-cat-black' : 'text-gray-500 hover:bg-gray-100'
                    }`}>{i + 1}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}