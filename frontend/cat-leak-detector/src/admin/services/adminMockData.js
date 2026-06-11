// Admin Mock Data Service
// Provides comprehensive mock data for the Admin Portal
// All data is stored in localStorage for persistence

const STORAGE_KEYS = {
  ANALYSES: 'cat_admin_analyses',
  ENGINES: 'cat_admin_engines',
  LEAK_ZONES: 'cat_admin_leak_zones',
  VIDEOS: 'cat_admin_videos',
  USERS: 'cat_mock_users',
  REPORTS: 'cat_diagnostics_reports',
};

// ─────────────────────────────────────────────────────────
// ENGINE DATABASE
// ─────────────────────────────────────────────────────────
const DEFAULT_ENGINES = [
  { id: 'ENG-C7-001', model: 'C7', version: 'C7 ACERT', releaseYear: 2003, manufacturingYears: '2003 – 2010', mfgYearValue: 2003, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'ENG-C7-002', model: 'C7', version: 'C7 ACERT Tier 4 Interim', releaseYear: 2011, manufacturingYears: '2011 – 2014', mfgYearValue: 2011, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'ENG-C7-003', model: 'C7', version: 'C7 ACERT Tier 4 Final', releaseYear: 2014, manufacturingYears: '2014 – 2019', mfgYearValue: 2014, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'ENG-C7-004', model: 'C7', version: 'C7 ACERT (2020 Series)', releaseYear: 2020, manufacturingYears: '2020 – Present', mfgYearValue: 2020, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'ENG-C15-001', model: 'C15', version: 'C15 ACERT', releaseYear: 2004, manufacturingYears: '2004 – 2007', mfgYearValue: 2004, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'ENG-C15-002', model: 'C15', version: 'C15 ACERT Tier 4 Interim', releaseYear: 2008, manufacturingYears: '2008 – 2013', mfgYearValue: 2008, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'ENG-C15-003', model: 'C15', version: 'C15 ACERT Tier 4 Final', releaseYear: 2014, manufacturingYears: '2014 – 2019', mfgYearValue: 2014, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'ENG-C15-004', model: 'C15', version: 'C15 ACERT (2020 Series)', releaseYear: 2020, manufacturingYears: '2020 – Present', mfgYearValue: 2020, createdAt: '2024-01-15T10:00:00Z' },
];

// ─────────────────────────────────────────────────────────
// LEAK ZONE DIAGRAMS (mock)
// ─────────────────────────────────────────────────────────
const DEFAULT_LEAK_ZONES = [
  { id: 'LZ-001', name: 'Intake Manifold', engineModel: 'C7', zoneType: 'Intake', description: 'Intake manifold gasket and seal area', imageUrl: null, updatedAt: '2024-02-10T14:30:00Z' },
  { id: 'LZ-002', name: 'Exhaust Manifold', engineModel: 'C7', zoneType: 'Exhaust', description: 'Exhaust manifold gasket and weld joints', imageUrl: null, updatedAt: '2024-02-10T14:30:00Z' },
  { id: 'LZ-003', name: 'Turbocharger Inlet', engineModel: 'C7', zoneType: 'Intake', description: 'Turbocharger inlet piping and connections', imageUrl: null, updatedAt: '2024-02-10T14:30:00Z' },
  { id: 'LZ-004', name: 'Turbocharger Outlet', engineModel: 'C7', zoneType: 'Exhaust', description: 'Turbine outlet flange and exhaust piping', imageUrl: null, updatedAt: '2024-02-10T14:30:00Z' },
  { id: 'LZ-005', name: 'Intercooler Piping', engineModel: 'C7', zoneType: 'Intake', description: 'Charge air cooler piping and clamps', imageUrl: null, updatedAt: '2024-02-10T14:30:00Z' },
  { id: 'LZ-006', name: 'Intake Manifold', engineModel: 'C15', zoneType: 'Intake', description: 'Intake manifold gasket and seal area', imageUrl: null, updatedAt: '2024-02-10T14:30:00Z' },
  { id: 'LZ-007', name: 'Exhaust Manifold', engineModel: 'C15', zoneType: 'Exhaust', description: 'Exhaust manifold gasket and weld joints', imageUrl: null, updatedAt: '2024-02-10T14:30:00Z' },
  { id: 'LZ-008', name: 'Turbocharger Assembly', engineModel: 'C15', zoneType: 'Both', description: 'Complete turbocharger assembly seals', imageUrl: null, updatedAt: '2024-02-10T14:30:00Z' },
];

// ─────────────────────────────────────────────────────────
// VIDEO LIBRARY (mock)
// ─────────────────────────────────────────────────────────
const DEFAULT_VIDEOS = [
  { id: 'VID-001', name: 'C7 Intake Manifold Inspection', description: 'Step-by-step inspection guide for C7 intake manifold leaks', category: 'Inspection', engineModel: 'C7', leakType: 'Intake Leak', videoUrl: null, thumbnailUrl: null, uploadDate: '2024-03-01T09:00:00Z', duration: '12:30' },
  { id: 'VID-002', name: 'C7 Exhaust Gasket Replacement', description: 'Complete guide to replace exhaust manifold gaskets on C7 engines', category: 'Repair', engineModel: 'C7', leakType: 'Exhaust Leak', videoUrl: null, thumbnailUrl: null, uploadDate: '2024-03-05T09:00:00Z', duration: '18:45' },
  { id: 'VID-003', name: 'C15 Turbo Seal Diagnostics', description: 'Diagnosing turbocharger oil and air leaks on C15 engines', category: 'Diagnostic', engineModel: 'C15', leakType: 'Combined Leak', videoUrl: null, thumbnailUrl: null, uploadDate: '2024-03-10T09:00:00Z', duration: '15:20' },
  { id: 'VID-004', name: 'Intercooler Pressure Test', description: 'How to perform a pressure drop test on charge air cooler system', category: 'Test', engineModel: 'C7', leakType: 'Intake Leak', videoUrl: null, thumbnailUrl: null, uploadDate: '2024-03-15T09:00:00Z', duration: '8:55' },
  { id: 'VID-005', name: 'C15 Intake System Sealing', description: 'Proper sealing techniques for C15 intake system components', category: 'Maintenance', engineModel: 'C15', leakType: 'Intake Leak', videoUrl: null, thumbnailUrl: null, uploadDate: '2024-03-20T09:00:00Z', duration: '22:10' },
];

// ─────────────────────────────────────────────────────────
// GENERATE MOCK ANALYSES (for the past 90 days)
// ─────────────────────────────────────────────────────────
const generateMockAnalyses = () => {
  const users = ['David Miller', 'Sarah Jenkins', 'John Smith', 'Emily Davis', 'Robert Brown', 'Lisa Anderson'];
  const engineModels = ['C7', 'C15'];
  const engineVersions = {
    'C7': ['C7 ACERT', 'C7 ACERT Tier 4 Interim', 'C7 ACERT Tier 4 Final', 'C7 ACERT (2020 Series)'],
    'C15': ['C15 ACERT', 'C15 ACERT Tier 4 Interim', 'C15 ACERT Tier 4 Final', 'C15 ACERT (2020 Series)'],
  };
  const leakStatuses = ['No Leak', 'Intake Leak', 'Exhaust Leak', 'Combined Leak'];
  const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
  
  const analyses = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const hoursOffset = Math.floor(Math.random() * 12);
    const date = new Date(now - daysAgo * dayMs - hoursOffset * 3600000);
    
    const user = users[Math.floor(Math.random() * users.length)];
    const engineModel = engineModels[Math.floor(Math.random() * engineModels.length)];
    const versions = engineVersions[engineModel];
    const version = versions[Math.floor(Math.random() * versions.length)];
    const manufacturingYear = 2003 + Math.floor(Math.random() * 21);
    
    const leakStatus = leakStatuses[Math.floor(Math.random() * leakStatuses.length)];
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const confidence = (85 + Math.random() * 14.9).toFixed(1);
    const duration = (5 + Math.random() * 25).toFixed(1);

    analyses.push({
      analysisId: `ANL-${String(1000 + i).padStart(4, '0')}`,
      userName: user,
      engineModel,
      engineVersion: version,
      manufacturingYear,
      leakStatus,
      riskLevel,
      confidence: parseFloat(confidence),
      analysisDate: date.toISOString(),
      analysisDateTime: date.toLocaleString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      durationMinutes: parseFloat(duration),
      hasReport: Math.random() > 0.3, // 70% have reports
      reportId: `REP-${String(8000 + i).padStart(4, '0')}`,
    });
  }

  return analyses.sort((a, b) => new Date(b.analysisDate) - new Date(a.analysisDate));
};

// ─────────────────────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────────────────────
const getStoredData = (key, defaultData) => {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) { /* ignore */ }
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

const setStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ─────────────────────────────────────────────────────────
// EXPORTED SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────

// Analytics & Dashboard
export const getAnalyticsData = () => {
  const analyses = getAnalyses();
  const reports = getReports();
  const users = getStoredData(STORAGE_KEYS.USERS, []);
  const engines = getStoredData(STORAGE_KEYS.ENGINES, DEFAULT_ENGINES);
  const videos = getStoredData(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS);

  const activeUsers = users.filter(u => {
    try {
      return u.status === 'Active' || !u.status;
    } catch (e) { return true; }
  }).length;

  const dailyAnalyses = analyses.filter(a => {
    const date = new Date(a.analysisDate);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  }).length;

  const weeklyAnalyses = analyses.filter(a => {
    const date = new Date(a.analysisDate);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }).length;

  const monthlyAnalyses = analyses.filter(a => {
    const date = new Date(a.analysisDate);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return date >= monthAgo;
  }).length;

  // Most common leak type
  const leakCounts = {};
  analyses.forEach(a => {
    leakCounts[a.leakStatus] = (leakCounts[a.leakStatus] || 0) + 1;
  });
  const mostCommonLeak = Object.entries(leakCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Most tested engine model
  const engineCounts = {};
  analyses.forEach(a => {
    engineCounts[a.engineModel] = (engineCounts[a.engineModel] || 0) + 1;
  });
  const mostTestedEngine = Object.entries(engineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Daily analysis trend (last 30 days)
  const dailyTrend = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const count = analyses.filter(a => {
      const aDate = new Date(a.analysisDate);
      return aDate.toDateString() === date.toDateString();
    }).length;
    dailyTrend.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count
    });
  }

  // Storage estimation (mock)
  const totalStorageMB = (analyses.length * 0.5 + reports.length * 1.2 + videos.length * 150).toFixed(1);

  return {
    totalUsers: users.length,
    activeUsers,
    totalAnalyses: analyses.length,
    totalReports: reports.length,
    totalEngineModels: engines.length,
    totalVideos: videos.length,
    totalStorageMB: parseFloat(totalStorageMB),
    dailyAnalyses,
    weeklyAnalyses,
    monthlyAnalyses,
    mostCommonLeak,
    mostTestedEngine,
    dailyTrend,
  };
};

// Analyses
export const getAnalyses = () => {
  return getStoredData(STORAGE_KEYS.ANALYSES, generateMockAnalyses());
};

export const refreshAnalyses = () => {
  const data = generateMockAnalyses();
  setStoredData(STORAGE_KEYS.ANALYSES, data);
  return data;
};

// Reports
export const getReports = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (data) return JSON.parse(data);
  } catch (e) { /* ignore */ }
  return [];
};

// Engines
export const getEngines = () => {
  return getStoredData(STORAGE_KEYS.ENGINES, DEFAULT_ENGINES);
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
export const getLeakZones = () => {
  return getStoredData(STORAGE_KEYS.LEAK_ZONES, DEFAULT_LEAK_ZONES);
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
export const getVideos = () => {
  return getStoredData(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS);
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

// System status mock
export const getSystemStatus = () => {
  return {
    status: 'Operational',
    uptime: '99.97%',
    lastBackup: new Date(Date.now() - 86400000).toLocaleString(),
    apiLatency: '42ms',
    activeSessions: Math.floor(Math.random() * 8) + 2,
    databaseSize: '2.4 GB',
    cpuUsage: `${(Math.random() * 40 + 20).toFixed(1)}%`,
    memoryUsage: `${(Math.random() * 30 + 40).toFixed(1)}%`,
    storageUsage: `${(Math.random() * 20 + 50).toFixed(1)}%`,
  };
};