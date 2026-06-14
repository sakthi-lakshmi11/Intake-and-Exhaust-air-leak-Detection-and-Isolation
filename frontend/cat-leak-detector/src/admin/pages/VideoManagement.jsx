import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getVideos, addVideo, updateVideo, deleteVideo } from '../services/adminMockData';
import { Video, Search, Plus, Edit, Trash2, X, Save, Film, Clock, Calendar } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

// TODO: Replace with backend API calls
// API ENDPOINTS: /api/videos (GET), /api/videos (POST), /api/videos/:id (PUT), /api/videos/:id (DELETE)

export default function VideoManagement() {
  const { currentAdmin, addAuditLog } = useAdminAuth();
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

    const payload = { ...formData, name: formData.name.trim(), description: formData.description.trim() };

    if (editingVideo) {
      updateVideo(editingVideo.id, payload);
      addAuditLog(currentAdmin, 'Update Video', `Updated video`);
    } else {
      addVideo(payload);
      addAuditLog(currentAdmin, 'Add Video', `Added video`);
    }
    setVideos(getVideos());
    setShowModal(false);
  };

  const handleDelete = (video) => {
    if (window.confirm(`Delete video "${video.name}"?`)) {
      deleteVideo(video.id);
      setVideos(getVideos());
      addAuditLog(currentAdmin, 'Delete Video', `Deleted video`);
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
      <div className="p-6" style={FONT}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Video Library Management</h1>
            <p className="text-xs text-gray-500 mt-1">{videos.length} videos in library</p>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-[#FFCD11] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Video
          </button>
        </div>

        {/* Filters - White Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search videos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50"
              />
            </div>
            <select value={filterEngine} onChange={e => setFilterEngine(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50">
              <option value="All">All Engines</option>
              <option value="C7">C7</option>
              <option value="C15">C15</option>
            </select>
          </div>
        </div>

        {/* Video Grid - White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-sm text-gray-500">No videos found</div>
          ) : filtered.map((video, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Film className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-[10px] text-gray-400 mt-1">No thumbnail</p>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => openEditModal(video)} className="p-1.5 rounded bg-white/90 text-gray-500 hover:text-blue-600" title="Edit">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(video)} className="p-1.5 rounded bg-white/90 text-gray-500 hover:text-red-600" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {video.duration}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{video.name}</h3>
                <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">{video.description}</p>
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-semibold ${categoryColors[video.category] || 'bg-gray-100 text-gray-700'}`}>{video.category}</span>
                  <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-[#FFCD11]/15 text-[#FFCD11] border border-[#FFCD11]/30">{video.engineModel}</span>
                  <span className="text-[9px] text-gray-400">{video.leakType}</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-2">
                  <Calendar className="w-2.5 h-2.5 inline mr-1" />
                  {video.uploadDate ? new Date(video.uploadDate).toLocaleDateString() : '—'}
                </p>
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{editingVideo ? 'Edit Video' : 'Add Video'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Video Name *</label>
                <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.name ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Category</label>
                  <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50">
                    <option value="Inspection">Inspection</option>
                    <option value="Repair">Repair</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Test">Test</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Duration *</label>
                  <input value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} placeholder="e.g., 12:30"
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${formErrors.duration ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50`} />
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
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Leak Type</label>
                  <select value={formData.leakType} onChange={e => setFormData(p => ({ ...p, leakType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50">
                    <option value="Intake Leak">Intake Leak</option>
                    <option value="Exhaust Leak">Exhaust Leak</option>
                    <option value="Combined Leak">Combined Leak</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-[#FFCD11] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors">
                <Save className="w-3.5 h-3.5" /> {editingVideo ? 'Update' : 'Add'} Video
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}