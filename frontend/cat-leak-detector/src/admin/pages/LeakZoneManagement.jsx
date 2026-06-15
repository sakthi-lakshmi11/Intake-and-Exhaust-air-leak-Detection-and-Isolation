import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getLeakZones, addLeakZone, updateLeakZone, deleteLeakZone } from '../services/adminMockData';
import { Map, Search, Plus, Edit, Trash2, X, Save, Upload, Eye, Image } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

// TODO: Replace with backend API calls
// API ENDPOINTS: /api/leak-zones (GET), /api/leak-zones (POST), /api/leak-zones/:id (PUT), /api/leak-zones/:id (DELETE)

export default function LeakZoneManagement() {
  const { currentAdmin, addAuditLog } = useAdminAuth();
  const [zones, setZones] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({ name: '', engineModel: 'C7', zoneType: 'Intake', description: '', imageUrl: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => { setZones(getLeakZones()); }, []);

  const filtered = zones.filter(z => {
    const q = search.toLowerCase();
    return !search || z.name?.toLowerCase().includes(q) || z.engineModel?.toLowerCase().includes(q) || z.zoneType?.toLowerCase().includes(q);
  });

  const openAddModal = () => {
    setEditingZone(null);
    setFormData({ name: '', engineModel: 'C7', zoneType: 'Intake', description: '', imageUrl: '' });
    setFormErrors({}); setPreviewUrl(null); setShowModal(true);
  };

  const openEditModal = (zone) => {
    setEditingZone(zone);
    setFormData({ name: zone.name, engineModel: zone.engineModel, zoneType: zone.zoneType, description: zone.description || '', imageUrl: zone.imageUrl || '' });
    setFormErrors({}); setPreviewUrl(zone.imageUrl); setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFormErrors(p => ({ ...p, image: 'File too large (max 5MB)' })); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPreviewUrl(dataUrl);
      setFormData(p => ({ ...p, imageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Required';
    if (!formData.description.trim()) errors.description = 'Required';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    const payload = { name: formData.name.trim(), engineModel: formData.engineModel, zoneType: formData.zoneType, description: formData.description.trim(), imageUrl: formData.imageUrl };

    if (editingZone) {
      updateLeakZone(editingZone.id, payload);
      addAuditLog(currentAdmin, 'Update Leak Zone', `Updated zone: ${editingZone.id}`);
    } else {
      addLeakZone(payload);
      addAuditLog(currentAdmin, 'Add Leak Zone', `Added zone: ${payload.name}`);
    }
    setZones(getLeakZones());
    setShowModal(false);
  };

  const handleDelete = (zone) => {
    if (window.confirm(`Delete leak zone "${zone.name}"?`)) {
      deleteLeakZone(zone.id);
      setZones(getLeakZones());
      addAuditLog(currentAdmin, 'Delete Leak Zone', `Deleted zone: ${zone.id}`);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6" style={FONT}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Leak Zone Management</h1>
            <p className="text-xs text-gray-500 mt-1">{zones.length} zones configured</p>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-[#FFCD11] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Leak Zone
          </button>
        </div>

        {/* Search - White Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search zones..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50"
            />
          </div>
        </div>

        {/* Zones Grid - White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-sm text-gray-500">No leak zones found</div>
          ) : filtered.map((zone, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                {zone.imageUrl ? (
                  <img src={zone.imageUrl} alt={zone.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center">
                    <Image className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-[10px] text-gray-400 mt-1">No diagram</p>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => openEditModal(zone)} className="p-1.5 rounded bg-white/90 text-gray-500 hover:text-blue-600" title="Edit">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(zone)} className="p-1.5 rounded bg-white/90 text-gray-500 hover:text-red-600" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900">{zone.name}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                    zone.zoneType === 'Intake' ? 'bg-blue-100 text-blue-700' :
                    zone.zoneType === 'Exhaust' ? 'bg-orange-100 text-orange-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>{zone.zoneType}</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-2">{zone.description}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-[#FFCD11]/15 text-[#FFCD11] border border-[#FFCD11]/30">{zone.engineModel}</span>
                  <span className="text-[9px] text-gray-400">{zone.updatedAt ? new Date(zone.updatedAt).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal - Slide Over */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-end" onClick={() => setShowModal(false)}>
          <div className="bg-white h-full w-full max-w-lg shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{editingZone ? 'Edit Leak Zone' : 'Add Leak Zone'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Zone Name *</label>
                  <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.name ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50`} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Engine Model</label>
                  <select value={formData.engineModel} onChange={e => setFormData(p => ({ ...p, engineModel: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50">
                    <option value="C7">Caterpillar C7</option>
                    <option value="C15">Caterpillar C15</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Zone Type</label>
                  <select value={formData.zoneType} onChange={e => setFormData(p => ({ ...p, zoneType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50">
                    <option value="Intake">Intake</option>
                    <option value="Exhaust">Exhaust</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Description *</label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.description ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Leak Zone Diagram</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                      <button onClick={() => { setPreviewUrl(null); setFormData(p => ({ ...p, imageUrl: '' })); }} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-2">Drag & drop or click to upload</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" /> Choose File
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
                {formErrors.image && <p className="text-[10px] text-red-500 mt-1">{formErrors.image}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-[#FFCD11] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors">
                <Save className="w-3.5 h-3.5" /> {editingZone ? 'Update' : 'Add'} Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}