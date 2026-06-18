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

// Default engine records (seeded on first load)
const DEFAULT_ENGINES = [
  { id: 'ENG-C7-001',  model: 'C7',  version: 'C7 ACERT',              releaseYear: 2003, manufacturingYears: '2003 – 2010',    mfgYearValue: 2003, createdAt: new Date().toISOString() },
  { id: 'ENG-C7-002',  model: 'C7',  version: 'C7 ACERT Tier 4 Interim', releaseYear: 2011, manufacturingYears: '2011 – 2014', mfgYearValue: 2011, createdAt: new Date().toISOString() },
  { id: 'ENG-C7-003',  model: 'C7',  version: 'C7 ACERT Tier 4 Final',  releaseYear: 2014, manufacturingYears: '2014 – 2019',  mfgYearValue: 2014, createdAt: new Date().toISOString() },
  { id: 'ENG-C7-004',  model: 'C7',  version: 'C7 ACERT (2020 Series)', releaseYear: 2020, manufacturingYears: '2020 – Present', mfgYearValue: 2020, createdAt: new Date().toISOString() },
  { id: 'ENG-C15-001', model: 'C15', version: 'C15 ACERT',              releaseYear: 2004, manufacturingYears: '2004 – 2007',   mfgYearValue: 2004, createdAt: new Date().toISOString() },
  { id: 'ENG-C15-002', model: 'C15', version: 'C15 ACERT Tier 4 Interim', releaseYear: 2008, manufacturingYears: '2008 – 2013', mfgYearValue: 2008, createdAt: new Date().toISOString() },
  { id: 'ENG-C15-003', model: 'C15', version: 'C15 ACERT Tier 4 Final', releaseYear: 2014, manufacturingYears: '2014 – 2019',   mfgYearValue: 2014, createdAt: new Date().toISOString() },
  { id: 'ENG-C15-004', model: 'C15', version: 'C15 ACERT (2020 Series)', releaseYear: 2020, manufacturingYears: '2020 – Present', mfgYearValue: 2020, createdAt: new Date().toISOString() },
];

// Engines
// TODO: Replace with /api/engines
export const getEngines = () => {
  const stored = getStoredData(STORAGE_KEYS.ENGINES, null);
  // Seed default engines on first load if storage is empty
  if (stored === null || stored.length === 0) {
    setStoredData(STORAGE_KEYS.ENGINES, DEFAULT_ENGINES);
    return DEFAULT_ENGINES;
  }
  return stored;
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

// Default leak zone records (seeded on first load)
const DEFAULT_LEAK_ZONES = [
  {
    id: 'LZ-001', name: 'CS1 – Air Filter → MAF Sensor', engineModel: 'Both', zoneType: 'Intake',
    description: 'Unfiltered ambient air first passes through the air filter. A differential pressure sensor monitors the pressure drop.',
    imageUrl: '/zones/zone_cs1.png', updatedAt: new Date().toISOString(),
  },
  {
    id: 'LZ-002', name: 'CS2 – MAF Sensor → Turbo Compressor Inlet', engineModel: 'Both', zoneType: 'Intake',
    description: 'The MAF sensor measures metered airflow entering the turbo compressor inlet. Hose leaks here reduce turbo efficiency.',
    imageUrl: '/zones/zone_cs2.png', updatedAt: new Date().toISOString(),
  },
  {
    id: 'LZ-003', name: 'CS3 – Compressor Outlet → Charge Air Cooler', engineModel: 'Both', zoneType: 'Intake',
    description: 'High-pressure, high-temperature compressed air exits the compressor and flows to the charge air cooler. Leaks cause pressure and temperature drops.',
    imageUrl: '/zones/zone_cs3.png', updatedAt: new Date().toISOString(),
  },
  {
    id: 'LZ-004', name: 'CS4 – CAC → Intake Manifold', engineModel: 'Both', zoneType: 'Intake',
    description: 'Cooled air from the CAC flows to the intake manifold. Leaks here cause boost loss, reducing engine performance.',
    imageUrl: '/zones/zone_cs4.png', updatedAt: new Date().toISOString(),
  },
  {
    id: 'LZ-005', name: 'HS1 – Cylinder → Turbine Inlet', engineModel: 'Both', zoneType: 'Exhaust',
    description: 'Hot exhaust gases exit the cylinders and enter the turbine inlet, spinning the turbine to drive the compressor. Leaks here waste exhaust energy.',
    imageUrl: '/zones/zone_hs1.png', updatedAt: new Date().toISOString(),
  },
  {
    id: 'LZ-006', name: 'DOC – Diesel Oxidation Catalyst', engineModel: 'Both', zoneType: 'Exhaust',
    description: 'The DOC oxidizes unburnt hydrocarbons and CO into CO₂ and H₂O, reducing emissions and protecting downstream components.',
    imageUrl: '/zones/zone_doc.png', updatedAt: new Date().toISOString(),
  },
  {
    id: 'LZ-007', name: 'DPF – Diesel Particulate Filter', engineModel: 'Both', zoneType: 'Exhaust',
    description: 'The DPF traps and burns particulate soot from exhaust gases. Leaks upstream reduce filtration efficiency and may release harmful soot.',
    imageUrl: '/zones/zone_dpf.svg', updatedAt: new Date().toISOString(),
  },
  {
    id: 'LZ-008', name: 'SCR – Selective Catalytic Reduction', engineModel: 'Both', zoneType: 'Exhaust',
    description: 'The SCR uses urea (DEF) to convert harmful NOx into nitrogen and water, reducing emissions to meet regulatory standards.',
    imageUrl: '/zones/zone_scr.svg', updatedAt: new Date().toISOString(),
  },
  {
    id: 'LZ-009', name: 'Healthy (No Leak)', engineModel: 'Both', zoneType: 'Both',
    description: 'All components are sealed and functioning properly. Airflow and exhaust flow are optimal with no leaks.',
    imageUrl: '/zones/zone_healthy.svg', updatedAt: new Date().toISOString(),
  },
];

// Leak Zones
// TODO: Replace with /api/leak-zones
export const getLeakZones = () => {
  const stored = getStoredData(STORAGE_KEYS.LEAK_ZONES, null);
  // Seed default leak zones on first load if storage is empty
  if (stored === null || stored.length === 0) {
    setStoredData(STORAGE_KEYS.LEAK_ZONES, DEFAULT_LEAK_ZONES);
    return DEFAULT_LEAK_ZONES;
  }
  
  // Force update null imageUrls for specific zones with SVGs
  let needsUpdate = false;
  const updatedStored = stored.map(zone => {
    if (zone.id === 'LZ-007' && !zone.imageUrl) { needsUpdate = true; return { ...zone, imageUrl: '/zones/zone_dpf.svg' }; }
    if (zone.id === 'LZ-008' && !zone.imageUrl) { needsUpdate = true; return { ...zone, imageUrl: '/zones/zone_scr.svg' }; }
    if (zone.id === 'LZ-009' && !zone.imageUrl) { needsUpdate = true; return { ...zone, imageUrl: '/zones/zone_healthy.svg' }; }
    return zone;
  });

  if (needsUpdate) {
    setStoredData(STORAGE_KEYS.LEAK_ZONES, updatedStored);
    return updatedStored;
  }

  return stored;
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