// Flask API Integration Configuration
const USE_MOCK_API = false;
const API_BASE_URL = 'http://localhost:5000/api';

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

  return reportWithId;
};

  const updated = [reportWithId, ...current];
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));

  // Update technician last activity
  if (report.technician) {
    const usersKey = 'cat_mock_users';
    const users = localStorage.getItem(usersKey);

    if (users) {
      try {
        const parsed = JSON.parse(users);
        const now = new Date().toISOString();

        const updatedUsers = parsed.map(u =>
          u.fullName === report.technician
            ? { ...u, lastActivity: now }
            : u
        );

        localStorage.setItem(usersKey, JSON.stringify(updatedUsers));
      } catch (e) {
        console.warn('User update failed:', e);
      }
    }
  }

  return reportWithId;
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
        return await response.json();
      } catch (err) {
        console.warn('API failed, using mock data:', err);
        return getMockReports();
      }
    }

    await new Promise(r => setTimeout(r, 600));
    return getMockReports();
  },

  // PREDICT
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
      status = 'NON-GO';
      riskLevel = 'Critical';
      confidence = 94;
    } else if (exhaust) {
      prediction = 'Exhaust Leak';
      status = 'NON-GO';
      riskLevel = 'High';
      confidence = 91;
    } else if (intake) {
      prediction = 'Intake Leak';
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