// Flask API Integration Configuration
const USE_MOCK_API = true; // switched to mock mode for reports
const API_BASE_URL = 'http://127.0.0.1:5000/api';

import {
  OPERATOR_USERS_KEY,
  ADMIN_AUDIT_KEY,
} from './userStatus';

const REPORTS_STORAGE_KEY = 'cat_diagnostics_reports';
const SEQ_KEY = 'cat_report_sequence'; // 🔥 FIXED GLOBAL COUNTER

// -----------------------------
// MOCK STORAGE HELPERS
// -----------------------------
const getMockReports = () => {
  const data = localStorage.getItem(REPORTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const getNextSequence = () => {
  const seq = localStorage.getItem(SEQ_KEY);
  const next = seq ? parseInt(seq, 10) + 1 : 1;
  localStorage.setItem(SEQ_KEY, next);
  return next;
};

// -----------------------------
// SAVE REPORT (FIXED ID SYSTEM)
// -----------------------------
const saveMockReport = (report) => {
  const current = getMockReports();
  const nextSeq = getNextSequence();

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(nextSeq).padStart(4, '0');

  const reportWithId = {
    ...report,
    id: `REP-${date}-${seq}`,
    analysisId: `ANL-${date}-${seq}`
  };

  const updated = [reportWithId, ...current];
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));

  updateOperatorActivity(report.technician);

  return reportWithId;
};

const updateOperatorActivity = (operatorName) => {
  if (!operatorName) return;
  const users = localStorage.getItem(OPERATOR_USERS_KEY);
  if (!users) return;
  try {
    const parsed = JSON.parse(users);
    const now = new Date().toISOString();
    const updatedUsers = parsed.map(u =>
      (u.fullName === operatorName || u.username === operatorName)
        ? { ...u, lastActivity: now, branch: undefined }
        : u
    );
    localStorage.setItem(OPERATOR_USERS_KEY, JSON.stringify(updatedUsers));
  } catch (e) {
    console.warn('User update failed:', e);
  }
};

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

export const persistGeneratedReportPdf = async (report, blob, filename) => {
  if (!blob) return null;
  const reports = getMockReports();
  const now = new Date().toISOString();
  const pdfDataUrl = await blobToDataUrl(blob);
  let saved = report;
  const updated = reports.map(r => {
    if (r.id !== report.id) return r;
    saved = {
      ...r,
      pdfBlob: pdfDataUrl,
      pdfName: filename,
      pdfGeneratedAt: now,
      pdfSizeBytes: blob.size || 0,
      technician: report.technician || r.technician,
    };
    return saved;
  });
  if (saved === report) {
    saved = { ...report, pdfBlob: pdfDataUrl, pdfName: filename, pdfGeneratedAt: now, pdfSizeBytes: blob.size || 0 };
    updated.unshift(saved);
  }
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  updateOperatorActivity(report.technician);
  appendAuditLog({ username: report.technician, fullName: report.technician }, 'Report Generation', `Generated PDF for ${saved.id}`);
  return saved;
};

export const appendAuditLog = (user, action, details = '') => {
  try {
    const logs = JSON.parse(localStorage.getItem(ADMIN_AUDIT_KEY) || '[]');
    logs.unshift({
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: user?.username || user?.id || 'unknown',
      userName: user?.fullName || user?.username || 'Operator',
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      userAgent: navigator.userAgent,
    });
    localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(logs.slice(0, 1000)));
  } catch (e) {
    console.warn('Audit log write failed:', e);
  }
};

const normalizeReport = (report) => {
  if (!report) return null;

  const source = report.data && !Array.isArray(report.data) ? report.data : report;
  const id = source.id || source.reportId || `REP-${Date.now()}`;
  const prediction = source.prediction || source.leakLabel || source.leak_section || 'No Leak';
  const leakLocation = source.leakLocation || source.detectedLocation || source.detectedPath || source.leakSection || prediction;

  return {
    ...source,
    id,
    analysisId: source.analysisId || id.replace(/^REP-/, 'ANL-'),
    technician: source.technician || source.operator || source.operatorName || 'Operator',
    engineModel: source.engineModel || source.engine || 'C15',
    prediction,
    leakLocation,
    leakSection: source.leakSection || source.leak_section || source.detectedLocation || prediction,
    status: source.status || source.go_nogo || 'GO',
    confidence: Number(source.confidence || 0),
    riskLevel: source.riskLevel || 'Low',
    inputs: source.inputs || {},
    recommendations: source.recommendations || [],
    pdfBlob: source.pdfBlob || null,
    pdfName: source.pdfName || null,
    pdfGeneratedAt: source.pdfGeneratedAt || source.timestamp || null,
    pdfSizeBytes: source.pdfSizeBytes || 0,
  };
};

const normalizeReportsResponse = (response) => {
  const payload = response?.data ?? response;
  const reports = Array.isArray(payload) ? payload : [];
  return reports.map(normalizeReport).filter(Boolean);
};

// -----------------------------
// MIGRATION (ONE-TIME FIX)
// -----------------------------
export const migrateReportIds = () => {
  const reports = getMockReports();
  if (reports.length === 0) return { migrated: 0 };

  const sorted = [...reports].sort((a, b) => {
    return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
  });

  let counter = 1;

  const remapped = sorted.map((r) => ({
    ...r,
    id: `REP-${String(counter).padStart(4, '0')}`,
    analysisId: `ANL-${String(counter++).padStart(4, '0')}`
  }));

  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(remapped));
  localStorage.setItem(SEQ_KEY, counter - 1); // sync counter

  return { migrated: reports.length };
};

// -----------------------------
// API CLIENT
// -----------------------------
export const api = {
  // LOGIN
  login: async (username, employeeId, password, loginType) => {
    if (!USE_MOCK_API) {
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, employeeId, password, loginType })
        });
        return await response.json();
      } catch (err) {
        return {
          success: false,
          message: `Flask API connection error: ${err.message}`
        };
      }
    }
    return { success: true };
  },

  // REGISTER
  register: async (userData) => {
    if (!USE_MOCK_API) {
      try {
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        return await response.json();
      } catch (err) {
        return {
          success: false,
          message: `Flask API connection error: ${err.message}`
        };
      }
    }
    return { success: true };
  },

  // GET REPORTS
  getReports: async () => {
    if (!USE_MOCK_API) {
      try {
        const response = await fetch(`${API_BASE_URL}/reports`);
        const data = await response.json();
        return normalizeReportsResponse(data);
      } catch (err) {
        console.warn('API failed, using mock data:', err);
        return getMockReports().map(normalizeReport).filter(Boolean);
      }
    }

    await new Promise(r => setTimeout(r, 600));
    return getMockReports().map(normalizeReport).filter(Boolean);
  },

  // GET RANDOM C15 SEQUENCE
  getRandomC15Sequence: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/random-c15-sequence`);
      return await response.json();
    } catch (err) {
      return { success: false, message: `Flask API connection error: ${err.message}` };
    }
  },

  // GET RANDOM C7 SEQUENCE
  getRandomC7Sequence: async () => {
    if (!USE_MOCK_API) {
      try {
        const response = await fetch(`${API_BASE_URL}/random-c7-sequence`);
        return await response.json();
      } catch (err) {
        return { success: false, message: `Flask API connection error: ${err.message}` };
      }
    }
    // Mock for C7 sequence
    return {
      success: true,
      data: {
        sequence_id: 42,
        inputs: {
          rpm: 1450,
          fuelRate: 18,
          injectionPressure: 900,
          fuelInjectionTime: 1.6
        }
      }
    };
  },

  // PREDICT
  predict: async (inputs, technicianInfo) => {
    if (!USE_MOCK_API || inputs?.engineModel === 'C15') {
      try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs, technician: technicianInfo })
        });
        const apiResult = await response.json();

        // Map backend field names → admin dashboard expected field names,
        // then persist to localStorage so the admin dashboard can read it.
        if (apiResult && apiResult.success && apiResult.data) {
          const backendData = apiResult.data;

          // Derive a human-readable prediction label from leak_section/go_nogo
          const goNogo    = backendData.go_nogo   || 'GO';
          const leakSec   = backendData.leak_section || 'Healthy';
          const severity  = backendData.severity  || 'Healthy';

          // Map severity text → riskLevel expected by admin dashboard
          const severityToRisk = {
            'Healthy':               'Low',
            'No Leak Detected-Healthy': 'Low',
            'Low Severity Leak':     'Low',
            'Moderate Severity Leak':'Medium',
            'High Severity Leak':    'High',
          };

          const prediction = goNogo === 'GO' ? 'No Leak' : leakSec;
          const leakLocation = goNogo === 'GO' ? 'No leak location identified.' : leakSec;
          const riskLevel  = severityToRisk[severity] || (goNogo === 'GO' ? 'Low' : 'High');

          const reportToSave = {
            timestamp:          new Date().toLocaleString(),
            technician:         technicianInfo?.fullName || 'Operator',
            role:               technicianInfo?.role     || 'Operator',
            engineModel:        backendData.engine       || inputs?.engineModel || 'C15',
            prediction,
            leakLocation,
            leakSection: leakSec,
            status:             goNogo,
            confidence:         Math.round(backendData.confidence || 0),
            riskLevel,
            inputs: { ...inputs, ...(backendData.inputs || {}) },
            recommendations:    backendData.recommendations || [],
            leak_section:       leakSec,
            severity,
            go_nogo:            goNogo,
          };

          const saved = saveMockReport(reportToSave);

          // Return the enriched record so Results.jsx gets proper field names too
          return { success: true, data: { ...backendData, ...saved, leakLocation, leakSection: leakSec } };
        }

        return apiResult;
      } catch (err) {
        console.warn('Flask API failed. Using fallback model.', err);
      }
    }

    await new Promise(r => setTimeout(r, 1500));

    const {
      rpm,
      fuelRate,
      fuelInjectionTime,
      injectionPressure,
      engineModel,
      engineVersion,
      engineVersionLabel,
      releaseYear,
      manufacturingYear,
      manufacturingYears
    } = inputs;

    const isC15 = engineModel === 'C15';

    const rpmHigh = isC15 ? 2100 : 1700;
    const rpmMed = isC15 ? 1600 : 1300;
    const fuelHigh = isC15 ? 80 : 30;
    const injHigh = isC15 ? 3.5 : 2.8;
    const pressureLow = isC15 ? 900 : 600;

    let prediction = 'No Leak';
    let leakLocation = 'No leak location identified.';
    let status = 'GO';
    let confidence = 96;
    let riskLevel = 'Low';
    let recommendations = [];

    const intake =
      (rpm > rpmMed && fuelRate > (isC15 ? 55 : 22)) ||
      injectionPressure < pressureLow;

    const exhaust = rpm > rpmHigh && fuelInjectionTime > injHigh;

    if (intake && exhaust) {
      prediction = 'Combined Leak';
      leakLocation = 'Intake Manifold + Exhaust Manifold';
      status = 'NON-GO';
      riskLevel = 'Critical';
      confidence = 94;
    } else if (exhaust) {
      prediction = 'Exhaust Leak';
      leakLocation = 'Exhaust Manifold Joint / Turbine Outlet';
      status = 'NON-GO';
      riskLevel = 'High';
      confidence = 91;
    } else if (intake) {
      prediction = 'Intake Leak';
      leakLocation = 'Turbocharger Intake Pipe / Intake Manifold';
      status = 'NON-GO';
      riskLevel = 'Medium';
      confidence = 90;
    }

    const newReport = {
      timestamp: new Date().toLocaleString(),
      technician: technicianInfo?.fullName || 'Operator',
      role: technicianInfo?.role || 'Operator',
      engineModel,

      engineVersion,
      engineVersionLabel,
      releaseYear,
      manufacturingYear,
      manufacturingYears,

      prediction,
      leakLocation,
      leakSection: leakLocation,
      status,
      confidence,
      riskLevel,
      inputs,
      recommendations
    };

    const saved = saveMockReport(newReport);
    return { success: true, data: saved };
  }
};