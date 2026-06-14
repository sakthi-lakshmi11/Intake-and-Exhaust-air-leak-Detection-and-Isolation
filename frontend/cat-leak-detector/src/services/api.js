// Flask API Integration Configuration
const USE_MOCK_API = false; 
const API_BASE_URL = 'http://localhost:5000/api';

const REPORTS_STORAGE_KEY = 'cat_diagnostics_reports';

const getMockReports = () => {
  const data = localStorage.getItem(REPORTS_STORAGE_KEY);
  if (data) return JSON.parse(data);
  return [];
};

const getNextSequence = () => {
  const reports = getMockReports();
  let maxSeq = 0;
  reports.forEach(r => {
    const match = r.id?.match(/^REP-(\d+)$/);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  });
  return maxSeq + 1;
};

const saveMockReport = (report) => {
  const current = getMockReports();
  const nextSeq = getNextSequence();
  // TODO: Replace with /api/reports POST when backend generates report IDs
  const reportWithId = {
    ...report,
    id: `REP-${String(nextSeq).padStart(4, '0')}`,
    analysisId: `ANL-${String(nextSeq).padStart(4, '0')}`
  };
  const updated = [reportWithId, ...current];
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  // TODO: Replace with /api/users/:username/activity PATCH for backend
  // Update user lastActivity - operator activity tracking
  if (report.technician) {
    const usersKey = 'cat_mock_users';
    const users = localStorage.getItem(usersKey);
    if (users) {
      try {
        const parsed = JSON.parse(users);
        const now = new Date().toISOString();
        const updatedUsers = parsed.map(u =>
          u.fullName === report.technician ? { ...u, lastActivity: now } : u
        );
        localStorage.setItem(usersKey, JSON.stringify(updatedUsers));
      } catch { /* ignore */ }
    }
  }
  return reportWithId;
};

export const migrateReportIds = () => {
  const reports = getMockReports();
  if (reports.length === 0) return { migrated: 0 };

  const sorted = [...reports].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeA - timeB;
  });

  const remapped = sorted.map((r, idx) => ({
    ...r,
    id: `REP-${String(idx + 1).padStart(4, '0')}`,
    analysisId: `ANL-${String(idx + 1).padStart(4, '0')}`
  }));

  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(remapped));
  return { migrated: reports.length };
};

// API Client Layer
export const api = {
  // POST /api/login
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
        return { success: false, message: `Flask API connection error: ${err.message}` };
      }
    }
    // Handled in AuthContext for simulation, fallback
    return { success: true };
  },

  // POST /api/register
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
        return { success: false, message: `Flask API connection error: ${err.message}` };
      }
    }
    // Handled in AuthContext for simulation
    return { success: true };
  },

  // GET /api/reports
  // TODO: Replace localStorage with real API call
  getReports: async () => {
    if (!USE_MOCK_API) {
      try {
        const response = await fetch(`${API_BASE_URL}/reports`);
        return await response.json();
      } catch (err) {
        console.warn('Real API failed, fallback to mock:', err);
        return getMockReports();
      }
    }
    await new Promise((r) => setTimeout(r, 600)); // Network latency simulator
    return getMockReports();
  },

  // POST /api/predict
  // TODO: Replace localStorage with real API call
  predict: async (inputs, technicianInfo) => {
    if (!USE_MOCK_API) {
      try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs, technician: technicianInfo })
        });
        return await response.json();
      } catch (err) {
        console.warn('Real Flask API failed. Running fallback local AI model algorithm.', err);
      }
    }

    await new Promise((r) => setTimeout(r, 4500));

    const { rpm, fuelRate, fuelInjectionTime, injectionPressure, engineModel,
            engineVersion, engineVersionLabel, releaseYear,
            manufacturingYear, manufacturingYears } = inputs; // FEATURE 1: destructure version fields

    let prediction = 'No Leak';
    let status = 'GO';
    let confidence = 97.0;
    let riskLevel = 'Low';
    let recommendations = [];

    // C7 model thresholds (lighter engine — lower RPM/pressure range)
    // C15 model thresholds (heavier engine — higher RPM/pressure range)
    const isC15 = engineModel === 'C15';

    const rpmThresholdHigh    = isC15 ? 2100 : 1700;
    const rpmThresholdMedium  = isC15 ? 1600 : 1300;
    const fuelRateHigh        = isC15 ? 80   : 30;
    const fuelRateMedium      = isC15 ? 55   : 22;
    const injTimeHigh         = isC15 ? 3.5  : 2.8;
    const pressureLow         = isC15 ? 900  : 600;

    const highRpm       = rpm > rpmThresholdHigh;
    const abnormalFuel  = fuelRate > fuelRateHigh;
    const longInjTime   = fuelInjectionTime > injTimeHigh;
    const lowPressure   = injectionPressure < pressureLow;

    const intakeSigns  = (rpm > rpmThresholdMedium && fuelRate > fuelRateMedium) || lowPressure;
    const exhaustSigns = highRpm && longInjTime;

    if (intakeSigns && exhaustSigns) {
      prediction = 'Combined Leak';
      status = 'NON-GO';
      riskLevel = 'Critical';
      confidence = 93.5 + Math.random() * 2;
      recommendations = [
        'Inspect intake manifold gaskets and seal integrity.',
        'Verify intercooler piping clamps and run pressure drop test.',
        'Check exhaust manifold gaskets and weld joints for soot.',
        'Perform high-pressure smoke test to locate all micro-leaks.'
      ];
    } else if (exhaustSigns) {
      prediction = 'Exhaust Leak';
      status = 'NON-GO';
      riskLevel = 'High';
      confidence = 90.0 + Math.random() * 3;
      recommendations = [
        'Inspect exhaust manifold for micro-cracks and carbon deposits.',
        'Check turbine inlet/outlet flange seals and gasket torque.',
        'Perform visual inspection on all exhaust slip-joints.'
      ];
    } else if (intakeSigns) {
      prediction = 'Intake Leak';
      status = 'NON-GO';
      riskLevel = 'Medium';
      confidence = 91.0 + Math.random() * 3;
      recommendations = [
        'Inspect intake manifold connections and silicone hose clamps.',
        'Check charge-air cooler header welds for leaks.',
        'Verify MAP sensor seals and intake piping integrity.'
      ];
    } else {
      prediction = 'No Leak';
      status = 'GO';
      riskLevel = 'Low';
      confidence = 96.0 + Math.random() * 3;
      recommendations = [
        'All parameters within nominal operating range.',
        'Perform routine scheduled visual inspection.',
        'Verify boost sensor and fuel trim readings.'
      ];
    }

    const newReport = {
      timestamp: new Date().toLocaleString(),
      technician: technicianInfo?.fullName || 'Operator',
      role: technicianInfo?.role || 'Operator',
      branch: technicianInfo?.branch || '',
      engineModel: engineModel || 'C7',
      // FEATURE 1: persist version metadata in the stored report
      engineVersion:      engineVersion      || '',
      engineVersionLabel: engineVersionLabel || '',
      releaseYear:        releaseYear        || '',
      manufacturingYear:  manufacturingYear  || '',
      manufacturingYears: manufacturingYears || '',
      prediction,
      status,
      confidence: parseFloat(confidence.toFixed(1)),
      riskLevel,
      inputs,
      recommendations
    };

    const savedReport = saveMockReport(newReport);
    return { success: true, data: savedReport };
  }
};