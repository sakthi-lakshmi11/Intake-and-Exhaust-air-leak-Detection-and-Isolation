// Admin Mock Data Service
// Production-ready - derives analyses from reports, no separate mock storage
// All data should be fetched from backend APIs

// TODO: Replace with backend API calls
// API ENDPOINTS: /api/users (GET), /api/reports (GET), /api/analytics (GET)

const STORAGE_KEYS = {
  ENGINES: 'cat_admin_engines',
  LEAK_ZONES: 'cat_admin_leak_zones',
  VIDEOS: 'cat_admin_videos',
  USERS: 'cat_mock_users',
  REPORTS: 'cat_diagnostics_reports',
};

// Storage helpers
const getStoredData = (key, defaultData = []) => {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return defaultData;
};

const setStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Users - reads from cat_mock_users (same as AuthContext)
// TODO: Replace with /api/users
export const getUsers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return [];
};

// Reports
// TODO: Replace with /api/reports
export const getReports = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return [];
};

// Analyses - derives from reports (single source of truth)
// TODO: Replace with /api/analyses when backend provides separate endpoint
// Each report has: id (Report ID), analysisId (Analysis ID)
export const getAnalyses = () => {
  const reports = getReports();
  return reports.map(r => ({
    id: r.analysisId || r.id,           // Analysis ID (ANL-XXXX)
    reportId: r.id,                      // Report ID (REP-XXXX)
    technician: r.technician || r.operatorName || 'Operator',
    engineModel: r.engineModel || 'C7',
    timestamp: r.timestamp,
    duration: r.duration || 'N/A',
    status: r.status || 'Completed',
    result: r.prediction || 'No Leak',
    confidence: r.confidence || 0,
    riskLevel: r.riskLevel || 'Low',
    leaksDetected: r.prediction || '',
    notes: r.notes || '',
  }));
};

// Analytics & Dashboard - derives from reports and users
// TODO: Replace with backend API calls /api/analytics
export const getAnalyticsData = () => {
  const reports = getReports();
  const users = getUsers();
  const engines = getStoredData(STORAGE_KEYS.ENGINES, []);
  const videos = getStoredData(STORAGE_KEYS.VIDEOS, []);

  const activeUsers = users.filter(u => !u.status || u.status === 'Active').length;

  // Daily analyses = reports from today
  const dailyAnalyses = reports.filter(r => {
    if (!r.timestamp) return false;
    const date = new Date(r.timestamp);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  }).length;

  // Weekly analyses
  const weeklyAnalyses = reports.filter(r => {
    if (!r.timestamp) return false;
    const date = new Date(r.timestamp);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }).length;

  // Monthly analyses
  const monthlyAnalyses = reports.filter(r => {
    if (!r.timestamp) return false;
    const date = new Date(r.timestamp);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return date >= monthAgo;
  }).length;

  // Most common leak type (from reports)
  const leakCounts = {};
  reports.forEach(r => {
    if (r.prediction) leakCounts[r.prediction] = (leakCounts[r.prediction] || 0) + 1;
  });
  const mostCommonLeak = Object.entries(leakCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Most tested engine model (from reports)
  const engineCounts = {};
  reports.forEach(r => {
    if (r.engineModel) engineCounts[r.engineModel] = (engineCounts[r.engineModel] || 0) + 1;
  });
  const mostTestedEngine = Object.entries(engineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Daily trend - derive from actual report dates
  const dailyTrend = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = reports.filter(r => {
      if (!r.timestamp) return false;
      const reportDate = new Date(r.timestamp);
      return reportDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateStr;
    }).length;
    dailyTrend.push({ date: dateStr, count });
  }

  return {
    totalUsers: users.length,
    activeUsers,
    totalAnalyses: reports.length,
    totalReports: reports.length,
    totalEngineModels: engines.length,
    totalVideos: videos.length,
    totalStorageMB: 0,
    dailyAnalyses,
    weeklyAnalyses,
    monthlyAnalyses,
    mostCommonLeak,
    mostTestedEngine,
    dailyTrend,
  };
};

// Recent Activity - combines user logins, analyses, and reports
// TODO: Replace with /api/recent-activity
export const getRecentActivity = () => {
  const users = getUsers();
  const reports = getReports();

  const activities = [];

  // User logins (from users with lastActivity)
  users.forEach(u => {
    if (u.lastActivity) {
      activities.push({
        id: `login-${u.username}`,
        type: 'User Login',
        user: u.fullName || u.username,
        timestamp: u.lastActivity,
        details: `Logged in as ${u.role || 'Operator'}`,
        icon: 'User',
      });
    }
  });

  // Analyses (from reports)
  reports.forEach(r => {
    if (r.timestamp) {
      activities.push({
        id: `analysis-${r.id}`,
        type: 'Analysis Execution',
        user: r.technician || 'Operator',
        timestamp: r.timestamp,
        details: `${r.engineModel || 'C7'} - ${r.prediction || 'No Leak'}`,
        icon: 'FileSearch',
      });
    }
  });

  // Report generation
  reports.forEach(r => {
    if (r.timestamp) {
      activities.push({
        id: `report-${r.id}`,
        type: 'Report Generated',
        user: r.technician || 'Operator',
        timestamp: r.timestamp,
        details: `${r.engineModel || 'C7'} - ${r.prediction || 'No Leak'} (${r.confidence}%)`,
        icon: 'FileText',
      });
    }
  });

  // Sort by timestamp descending
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
};

// Engines
// TODO: Replace with /api/engines
export const getEngines = () => {
  return getStoredData(STORAGE_KEYS.ENGINES, []);
};

export const addEngine = (engine) => {
  const engines = getEngines();
  const newEngine = {
    ...engine,
    id: `ENG-${engine.model}-${String(engines.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  engines.push(newEngine);
  setStoredData(STORAGE_KEYS.ENGINES, engines);
  return newEngine;
};

export const updateEngine = (id, updates) => {
  const engines = getEngines();
  const index = engines.findIndex(e => e.id === id);
  if (index === -1) return null;
  engines[index] = { ...engines[index], ...updates };
  setStoredData(STORAGE_KEYS.ENGINES, engines);
  return engines[index];
};

export const deleteEngine = (id) => {
  const engines = getEngines();
  const filtered = engines.filter(e => e.id !== id);
  setStoredData(STORAGE_KEYS.ENGINES, filtered);
  return filtered;
};

// Leak Zones
// TODO: Replace with /api/leak-zones
export const getLeakZones = () => {
  return getStoredData(STORAGE_KEYS.LEAK_ZONES, []);
};

export const addLeakZone = (zone) => {
  const zones = getLeakZones();
  const newZone = {
    ...zone,
    id: `LZ-${String(zones.length + 1).padStart(3, '0')}`,
    updatedAt: new Date().toISOString(),
    imageUrl: zone.imageUrl || null,
  };
  zones.push(newZone);
  setStoredData(STORAGE_KEYS.LEAK_ZONES, zones);
  return newZone;
};

export const updateLeakZone = (id, updates) => {
  const zones = getLeakZones();
  const index = zones.findIndex(z => z.id === id);
  if (index === -1) return null;
  zones[index] = { ...zones[index], ...updates, updatedAt: new Date().toISOString() };
  setStoredData(STORAGE_KEYS.LEAK_ZONES, zones);
  return zones[index];
};

export const deleteLeakZone = (id) => {
  const zones = getLeakZones();
  const filtered = zones.filter(z => z.id !== id);
  setStoredData(STORAGE_KEYS.LEAK_ZONES, filtered);
  return filtered;
};

// Videos
// TODO: Replace with /api/videos
export const getVideos = () => {
  return getStoredData(STORAGE_KEYS.VIDEOS, []);
};

export const addVideo = (video) => {
  const videos = getVideos();
  const newVideo = {
    ...video,
    id: `VID-${String(videos.length + 1).padStart(3, '0')}`,
    uploadDate: new Date().toISOString(),
  };
  videos.push(newVideo);
  setStoredData(STORAGE_KEYS.VIDEOS, videos);
  return newVideo;
};

export const updateVideo = (id, updates) => {
  const videos = getVideos();
  const index = videos.findIndex(v => v.id === id);
  if (index === -1) return null;
  videos[index] = { ...videos[index], ...updates };
  setStoredData(STORAGE_KEYS.VIDEOS, videos);
  return videos[index];
};

export const deleteVideo = (id) => {
  const videos = getVideos();
  const filtered = videos.filter(v => v.id !== id);
  setStoredData(STORAGE_KEYS.VIDEOS, filtered);
  return filtered;
};

// System status - placeholder for backend integration
// TODO: Replace with /api/system-status
export const getSystemStatus = () => {
  return {
    status: 'N/A',
    uptime: 'N/A',
    lastBackup: 'N/A',
    apiLatency: 'N/A',
    activeSessions: 0,
    databaseSize: 'N/A',
    cpuUsage: 'N/A',
    memoryUsage: 'N/A',
    storageUsage: 'N/A',
  };
};