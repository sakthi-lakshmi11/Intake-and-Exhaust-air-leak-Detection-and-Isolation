import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getVideos, addVideo, updateVideo, deleteVideo } from '../services/adminMockData';
import { Video, Search, Plus, Edit, Trash2, X, Save, Upload, Film, Clock, Calendar } from 'lucide-react';

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

export default function VideoManagement() {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [filterEngine, setFilterEngine] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: 'Inspection', engineModel: 'C7', leakType: 'Intake Leak', duration: '', thumbnailUrl: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => { setVideos(getVideos()); }, []);

  const filtered = videos.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !search || v.name?.toLowerCase().includes(q) || v.engineModel?.toLowerCase().includes(q);
    const matchEngine = filterEngine === 'All' || v.engineModel === filterEngine;
    return matchSearch && matchEngine;
  });

  const openAddModal = () => {
    setEditingVideo(null);
    setFormData({ name: '', description: '', category: 'Inspection', engineModel: 'C7', leakType: 'Intake Leak', duration: '', thumbnailUrl: '' });
    setFormErrors({}); setShowModal(true);
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setFormData({ name: video.name, description: video.description || '', category: video.category, engineModel: video.engineModel, leakType: video.leakType, duration: video.duration || '', thumbnailUrl: video.thumbnailUrl || '' });
    setFormErrors({}); setShowModal(true);
  };

  const handleSave = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Required';
    if (!formData.duration) errors.duration = 'Required';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    const payload = { name: formData.name.trim(), description: formData.description.trim(), category: formData.category, engineModel: formData.engineModel, leakType: formData.leakType, duration: formData.duration, thumbnailUrl: formData.thumbnailUrl };

    if (editingVideo) {
      updateVideo(editingVideo.id, payload);
      addAuditLog(currentUser, 'Update Video', `Updated video: ${editingVideo.id}`);
    } else {
      addVideo(payload);
      addAuditLog(currentUser, 'Add Video', `Added video: ${payload.name}`);
    }
    setVideos(getVideos());
    setShowModal(false);
  };

  const handleDelete = (video) => {
    if (window.confirm(`Delete video "${video.name}"?`)) {
      deleteVideo(video.id);
      setVideos(getVideos());
      addAuditLog(currentUser, 'Delete Video', `Deleted video: ${video.id}`);
    }
  };

  const categoryColors = {
    'Inspection': 'bg-blue-100 text-blue-700',
    'Repair': 'bg-green-100 text-green-700',
    'Diagnostic': 'bg-purple-100 text-purple-700',
    'Test': 'bg-orange-100 text-orange-700',
    'Maintenance': 'bg-yellow-100 text-yellow-700',
  };

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6" style={FONT}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Video Library Management</h1>
            <p className="text-xs text-gray-500 mt-1">{videos.length} videos in library</p>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Video
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
            </div>
            <select value={filterEngine} onChange={e => setFilterEngine(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
              <option value="All">All Engines</option><option value="C7">C7</option><option value="C15">C15</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-sm text-gray-500">No videos found</div>
          ) : filtered.map((video, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-40 bg-gray-900 flex items-center justify-center relative">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Film className="w-12 h-12 text-gray-600 mx-auto" />
                    <p className="text-[10px] text-gray-500 mt-1">No thumbnail</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-cat-yellow/90 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-cat-black ml-1" />
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(video)} className="p-1.5 rounded bg-white/90 text-gray-600 hover:text-blue-500 shadow cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(video)} className="p-1.5 rounded bg-white/90 text-gray-600 hover:text-red-500 shadow cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {video.duration}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{video.name}</h3>
                <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{video.description}</p>
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold ${categoryColors[video.category] || 'bg-gray-100 text-gray-700'}`}>{video.category}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-cat-yellow/10 text-cat-yellow border border-cat-yellow/30">{video.engineModel}</span>
                  <span className="text-[9px] text-gray-400">{video.leakType}</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-2">
                  <Calendar className="w-2.5 h-2.5 inline mr-1" />
                  {new Date(video.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{editingVideo ? 'Edit Video' : 'Add Video'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Video Name *</label>
                <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.name ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                    <option value="Inspection">Inspection</option><option value="Repair">Repair</option>
                    <option value="Diagnostic">Diagnostic</option><option value="Test">Test</option><option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Duration *</label>
                  <input value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} placeholder="e.g., 12:30"
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.duration ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50`} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Engine Model</label>
                  <select value={formData.engineModel} onChange={e => setFormData(p => ({ ...p, engineModel: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                    <option value="C7">Caterpillar C7</option><option value="C15">Caterpillar C15</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Leak Type</label>
                  <select value={formData.leakType} onChange={e => setFormData(p => ({ ...p, leakType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                    <option value="Intake Leak">Intake Leak</option><option value="Exhaust Leak">Exhaust Leak</option><option value="Combined Leak">Combined Leak</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Thumbnail</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center">
                  <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500">Upload thumbnail image</p>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 mt-2 bg-gray-100 rounded-lg text-[10px] font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer">
                    Choose File <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all cursor-pointer">
                <Save className="w-3.5 h-3.5" /> {editingVideo ? 'Update' : 'Add'} Video
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}