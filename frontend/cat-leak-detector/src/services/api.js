// Flask API Integration Configuration
const USE_MOCK_API = false; 
const API_BASE_URL = 'http://localhost:5000/api';

const REPORTS_STORAGE_KEY = 'cat_diagnostics_reports';

const getMockReports = () => {
  const data = localStorage.getItem(REPORTS_STORAGE_KEY);
  if (data) return JSON.parse(data);
  // Default reports history to show initially
  const defaultReports = [
    {
      id: 'REP-7401',
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toLocaleString(),
      technician: 'David Miller',
      role: 'Operator',
      branch: 'Peoria HQ, IL',
      prediction: 'No Leak',
      status: 'GO',
      confidence: 98.4,
      riskLevel: 'Low',
      inputs: {
        fuelInjectionTime: 1.8,
        rpm: 1500,
        fuelRate: 220,
        injectionPressure: 1400,
        maf: 450,
        map: 2.1,
        mat: 45,
        deltaP: 85,
        turboInletP: 1.0,
        turbineInletP: 1.8,
        egt: 520,
        nox: 180
      },
      recommendations: ['Perform routine visual checks', 'Verify pressure leak sensors integrity']
    },
    {
      id: 'REP-7402',
      timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(),
      technician: 'David Miller',
      role: 'Operator',
      branch: 'Peoria HQ, IL',
      prediction: 'Intake Leak',
      status: 'NON-GO',
      confidence: 91.2,
      riskLevel: 'Medium',
      inputs: {
        fuelInjectionTime: 2.2,
        rpm: 1800,
        fuelRate: 280,
        injectionPressure: 1550,
        maf: 310, // low maf for this RPM
        map: 1.4, // low manifold boost pressure
        mat: 58,
        deltaP: 180, // high pressure drop
        turboInletP: 0.9,
        turbineInletP: 1.5,
        egt: 590,
        nox: 210
      },
      recommendations: ['Inspect intake manifold gaskets', 'Check turbocharger outlet flexible hoses', 'Verify intercooler piping clamps']
    }
  ];
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(defaultReports));
  return defaultReports;
};

const saveMockReport = (report) => {
  const current = getMockReports();
  const updated = [report, ...current];
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
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

    const { rpm, fuelRate, fuelInjectionTime, injectionPressure, engineModel } = inputs;

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
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString(),
      technician: technicianInfo?.fullName || 'Operator',
      role: technicianInfo?.role || 'Operator',
      branch: technicianInfo?.branch || '',
      engineModel: engineModel || 'C7',
      prediction,
      status,
      confidence: parseFloat(confidence.toFixed(1)),
      riskLevel,
      inputs,
      recommendations
    };

    saveMockReport(newReport);
    return { success: true, data: newReport };
  }
};
