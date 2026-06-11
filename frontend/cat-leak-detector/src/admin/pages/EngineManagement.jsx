import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getEngines, addEngine, updateEngine, deleteEngine } from '../services/adminMockData';
import { Settings, Search, Plus, Edit, Trash2, X, ChevronDown, AlertCircle, Save } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

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

export default function EngineManagement() {
  const { currentUser } = useAuth();
  const [engines, setEngines] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEngine, setEditingEngine] = useState(null);
  const [formData, setFormData] = useState({ model: 'C7', version: '', releaseYear: '', manufacturingYears: '', mfgYearValue: '' });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => { setEngines(getEngines()); }, []);

  const filtered = engines.filter(e => {
    const q = search.toLowerCase();
    return !search || e.model?.toLowerCase().includes(q) || e.version?.toLowerCase().includes(q) || e.id?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const openAddModal = () => {
    setEditingEngine(null);
    setFormData({ model: 'C7', version: '', releaseYear: '', manufacturingYears: '', mfgYearValue: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (engine) => {
    setEditingEngine(engine);
    setFormData({
      model: engine.model,
      version: engine.version,
      releaseYear: engine.releaseYear.toString(),
      manufacturingYears: engine.manufacturingYears,
      mfgYearValue: engine.mfgYearValue.toString(),
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    const errors = {};
    if (!formData.version.trim()) errors.version = 'Required';
    if (!formData.releaseYear) errors.releaseYear = 'Required';
    if (!formData.manufacturingYears.trim()) errors.manufacturingYears = 'Required';
    if (!formData.mfgYearValue) errors.mfgYearValue = 'Required';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    const payload = {
      model: formData.model,
      version: formData.version.trim(),
      releaseYear: parseInt(formData.releaseYear),
      manufacturingYears: formData.manufacturingYears.trim(),
      mfgYearValue: parseInt(formData.mfgYearValue),
    };

    if (editingEngine) {
      const result = updateEngine(editingEngine.id, payload);
      if (result) {
        setEngines(getEngines());
        addAuditLog(currentUser, 'Update Engine', `Updated engine: ${editingEngine.id} - ${payload.version}`);
        setShowModal(false);
      }
    } else {
      const newEngine = addEngine(payload);
      setEngines(getEngines());
      addAuditLog(currentUser, 'Add Engine', `Added engine: ${newEngine.id} - ${payload.version}`);
      setShowModal(false);
    }
  };

  const handleDelete = (engine) => {
    if (deleteConfirm === engine.id) {
      deleteEngine(engine.id);
      setEngines(getEngines());
      addAuditLog(currentUser, 'Delete Engine', `Deleted engine: ${engine.id} - ${engine.version}`);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(engine.id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6" style={FONT}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Engine Database Management</h1>
            <p className="text-xs text-gray-500 mt-1">{engines.length} engine records</p>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Engine Model
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search engine models..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Engine ID</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Model</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Version</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Release Year</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Manufacturing Years</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">No engine records found</td></tr>
                ) : paginated.map((e, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-mono text-gray-500">{e.id}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cat-yellow/10 text-cat-yellow border border-cat-yellow/30">{e.model}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{e.version}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{e.releaseYear}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{e.manufacturingYears}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditModal(e)} className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(e)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${deleteConfirm === e.id ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                          title={deleteConfirm === e.id ? 'Click again to confirm' : 'Delete'}>
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
              <p className="text-xs text-gray-500">Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${currentPage === i + 1 ? 'bg-cat-yellow text-cat-black' : 'text-gray-500 hover:bg-gray-100'}`}>{i + 1}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{editingEngine ? 'Edit Engine Model' : 'Add Engine Model'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Engine Model *</label>
                  <select value={formData.model} onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                    <option value="C7">Caterpillar C7</option>
                    <option value="C15">Caterpillar C15</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Release Year *</label>
                  <input type="number" value={formData.releaseYear} onChange={e => setFormData(p => ({ ...p, releaseYear: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.releaseYear ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Version Name *</label>
                  <input value={formData.version} onChange={e => setFormData(p => ({ ...p, version: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.version ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Manufacturing Year Range *</label>
                  <input value={formData.manufacturingYears} onChange={e => setFormData(p => ({ ...p, manufacturingYears: e.target.value }))} placeholder="e.g., 2003 – 2010"
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.manufacturingYears ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Mfg Year Value (numeric) *</label>
                  <input type="number" value={formData.mfgYearValue} onChange={e => setFormData(p => ({ ...p, mfgYearValue: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.mfgYearValue ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all cursor-pointer">
                <Save className="w-3.5 h-3.5" /> {editingEngine ? 'Update' : 'Add'} Engine
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}