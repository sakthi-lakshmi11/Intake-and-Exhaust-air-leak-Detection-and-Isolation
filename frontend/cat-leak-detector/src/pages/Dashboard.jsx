import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, ChevronDown, CheckCircle2 } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE VERSION DATABASE
// Each version carries: releaseYear, manufacturingYears (display string),
// and mfgYearValue (numeric – sent to the model as manufacturingYear).
// Add new models/versions here; the UI and read-only field update automatically.
// ─────────────────────────────────────────────────────────────────────────────
export const ENGINE_VERSION_DB = {
  C7: [
    { value: 'c7_acert',        label: 'C7 ACERT',                releaseYear: 2003, manufacturingYears: '2003 – 2010', mfgYearValue: 2003 },
    { value: 'c7_acert_t4i',    label: 'C7 ACERT Tier 4 Interim', releaseYear: 2011, manufacturingYears: '2011 – 2014', mfgYearValue: 2011 },
    { value: 'c7_acert_t4f',    label: 'C7 ACERT Tier 4 Final',   releaseYear: 2014, manufacturingYears: '2014 – 2019', mfgYearValue: 2014 },
    { value: 'c7_acert_2020',   label: 'C7 ACERT (2020 Series)',  releaseYear: 2020, manufacturingYears: '2020 – Present', mfgYearValue: 2020 },
  ],
  C15: [
    { value: 'c15_acert',       label: 'C15 ACERT',               releaseYear: 2004, manufacturingYears: '2004 – 2007', mfgYearValue: 2004 },
    { value: 'c15_acert_t4i',   label: 'C15 ACERT Tier 4 Interim', releaseYear: 2008, manufacturingYears: '2008 – 2013', mfgYearValue: 2008 },
    { value: 'c15_acert_t4f',   label: 'C15 ACERT Tier 4 Final',  releaseYear: 2014, manufacturingYears: '2014 – 2019', mfgYearValue: 2014 },
    { value: 'c15_acert_2020',  label: 'C15 ACERT (2020 Series)', releaseYear: 2020, manufacturingYears: '2020 – Present', mfgYearValue: 2020 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING CONFIGURATION — unchanged
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_FAMILY_OPTIONS = [
  { value: 'C7',  label: 'Caterpillar C7'  },
  { value: 'C15', label: 'Caterpillar C15' },
];

const ENGINE_CONFIG_BY_FAMILY = {
  C7: [
    { value: 'turbocharged', label: 'Turbocharged Diesel Engine' },
    { value: 'industrial',   label: 'Industrial Diesel Engine'   },
    { value: 'generator',    label: 'Generator Diesel Engine'    },
  ],
  C15: [
    { value: 'turbocharged', label: 'Turbocharged Diesel Engine' },
    { value: 'heavyduty',    label: 'Heavy Duty Industrial Engine' },
    { value: 'generator',    label: 'Generator Diesel Engine'    },
  ],
};

const TURBO_CONFIG_BY_ENGINE = {
  turbocharged: [
    { value: 'ta',    label: 'TA (Turbocharged Aftercooled)'    },
    { value: 'ataac', label: 'ATAAC (Air-To-Air Aftercooled)'   },
  ],
  industrial: [
    { value: 'standard',    label: 'Standard Configuration'    },
    { value: 'highoutput',  label: 'High Output Configuration' },
  ],
  heavyduty: [
    { value: 'standard',    label: 'Standard Configuration'    },
    { value: 'highoutput',  label: 'High Output Configuration' },
  ],
  generator: [
    { value: 'standard',    label: 'Standard Configuration'    },
    { value: 'highoutput',  label: 'High Output Configuration' },
  ],
};

const DEFAULTS = {
  C7:  { rpm: 1400, fuelRate: 18,  fuelInjectionTime: 1.6, injectionPressure: 900  },
  C15: { rpm: 1800, fuelRate: 45,  fuelInjectionTime: 2.1, injectionPressure: 1400 },
};

const FIELDS = [
  { key: 'rpm',               label: 'Engine RPM',             unit: 'RPM', min: 600,  max: 2500, step: 50,  placeholder: 'Enter engine RPM'        },
  { key: 'fuelRate',          label: 'Fuel Rate',              unit: 'L/hr', min: 1,   max: 120,  step: 0.5, placeholder: 'Enter fuel rate'          },
  { key: 'fuelInjectionTime', label: 'Fuel Injection Time',    unit: 'ms',  min: 0.5,  max: 5.0,  step: 0.1, placeholder: 'Enter injection time'     },
  { key: 'injectionPressure', label: 'Fuel Injection Pressure', unit: 'bar', min: 200, max: 2000, step: 10,  placeholder: 'Enter injection pressure' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Reusable custom dropdown component
// ─────────────────────────────────────────────────────────────────────────────
function CustomDropdown({ id, label, required, options, value, onChange, openDropdown, setOpenDropdown }) {
  const selected = options.find((o) => o.value === value);
  const isOpen = openDropdown === id;

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
        {label} {required && <span className="text-cat-yellow">*</span>}
      </label>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/40 focus:border-cat-yellow transition-all duration-150 cursor-pointer"
        >
          <span>{selected?.label ?? '— Select —'}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden max-h-56 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpenDropdown(null); }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                  value === opt.value
                    ? 'bg-cat-yellow/10 text-gray-900 font-semibold border-l-2 border-l-cat-yellow'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
                {value === opt.value && <CheckCircle2 className="w-4 h-4 text-cat-yellow" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD — main form
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Cascading dropdown state
  const [engineFamily, setEngineFamily] = useState('C7');
  const [engineConfig, setEngineConfig] = useState('turbocharged');
  const [turboConfig,  setTurboConfig]  = useState('ta');

  // FEATURE 1: engine version — defaults to first version of C7
  // The manufacturingYear is derived from the selected version; never edited manually.
  const [engineVersion, setEngineVersion] = useState(ENGINE_VERSION_DB['C7'][0].value);

  // Input parameters
  const [inputs, setInputs]   = useState({ ...DEFAULTS['C7'] });
  const [errors, setErrors]   = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);

  // ── FEATURE 1: derive the full version object from current selection ──────
  const versionOptions   = ENGINE_VERSION_DB[engineFamily] ?? [];
  const selectedVersion  = versionOptions.find((v) => v.value === engineVersion) ?? versionOptions[0];
  // Auto-populated, read-only manufacturing year shown to the user
  const displayMfgYear   = selectedVersion?.manufacturingYears ?? '—';
  const mfgYearValue     = selectedVersion?.mfgYearValue       ?? '';

  // ── Cascade handlers ──────────────────────────────────────────────────────
  const handleFamilyChange = (family) => {
    setEngineFamily(family);
    const defaultConfig  = ENGINE_CONFIG_BY_FAMILY[family][0].value;
    const defaultTurbo   = TURBO_CONFIG_BY_ENGINE[defaultConfig][0].value;
    // Reset version to first available for the new family
    const defaultVersion = ENGINE_VERSION_DB[family]?.[0]?.value ?? '';
    setEngineConfig(defaultConfig);
    setTurboConfig(defaultTurbo);
    setEngineVersion(defaultVersion);
    setInputs({ ...DEFAULTS[family] });
    setErrors({});
  };

  const handleConfigChange = (config) => {
    setEngineConfig(config);
    setTurboConfig(TURBO_CONFIG_BY_ENGINE[config][0].value);
    setErrors({});
  };

  // FEATURE 1: when version changes, manufacturing year auto-updates (derived from selectedVersion)
  const handleVersionChange = (version) => {
    setEngineVersion(version);
    setErrors({});
  };

  const handleChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    FIELDS.forEach(({ key, min, max, label }) => {
      const val = parseFloat(inputs[key]);
      if (inputs[key] === '' || isNaN(val))    errs[key] = `${label} is required.`;
      else if (val < min || val > max)          errs[key] = `Valid range: ${min} – ${max}`;
    });
    // Edge case: no version available for engine family
    if (!selectedVersion) errs._version = 'Please select a valid engine version.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const parsed = {};
    FIELDS.forEach(({ key }) => { parsed[key] = parseFloat(inputs[key]); });

    navigate('/analysis', {
      state: {
        inputs: {
          ...parsed,
          engineModel:       engineFamily,
          engineFamily,
          engineConfig,
          turboConfig,
          // FEATURE 1: pass auto-populated year values to analysis/results
          engineVersion:     selectedVersion?.value       ?? '',
          engineVersionLabel: selectedVersion?.label      ?? '',
          releaseYear:       selectedVersion?.releaseYear ?? '',
          manufacturingYear: mfgYearValue,
          manufacturingYears: displayMfgYear,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-300" style={FONT}>
      {/* Top yellow accent line */}
      <div className="h-1 w-full bg-cat-yellow" />

      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-14">

        {/* ── Page Header ── */}
        <div className="mb-10">
          <p className="section-label-yellow mb-2">NovaCrafters Diagnostics Platform</p>
          <h1 className="main-heading-white leading-tight">Intake and Exhaust Air Leak Detection</h1>
          <p className="mt-2 text-sm text-gray-500 font-normal">Engine Configuration and Operating Parameters</p>
          <div className="mt-5 h-px bg-gray-100" />
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-7">

          {/* ── CASCADING DROPDOWNS — ROW 1: Engine Family + Engine Config ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <CustomDropdown
              id="family"
              label="Engine Family"
              required
              options={ENGINE_FAMILY_OPTIONS}
              value={engineFamily}
              onChange={handleFamilyChange}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />

            <CustomDropdown
              id="config"
              label="Engine Configuration"
              required
              options={ENGINE_CONFIG_BY_FAMILY[engineFamily]}
              value={engineConfig}
              onChange={handleConfigChange}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />

            <CustomDropdown
              id="turbo"
              label="Turbo Configuration"
              required
              options={TURBO_CONFIG_BY_ENGINE[engineConfig]}
              value={turboConfig}
              onChange={(v) => { setTurboConfig(v); setErrors({}); }}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />

            {/* ── FEATURE 1: Engine Version dropdown ── */}
            <CustomDropdown
              id="version"
              label="Engine Version / Variant"
              required
              options={versionOptions}
              value={engineVersion}
              onChange={handleVersionChange}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />

          </div>

          {/* ── FEATURE 1: Read-only Manufacturing Year + Release Year info panel ── */}
          {selectedVersion && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Release Year — read-only info tile */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Release Year
                </p>
                <p className="text-sm font-bold text-gray-900">{selectedVersion.releaseYear}</p>
              </div>

              {/* Manufacturing Year Range — auto-populated, read-only */}
              <div className="sm:col-span-2 bg-cat-yellow/10 border border-cat-yellow/40 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">
                    Manufacturing Year <span className="text-gray-400 normal-case tracking-normal font-normal">(auto-populated)</span>
                  </p>
                  <p className="text-sm font-bold text-gray-900">{displayMfgYear}</p>
                </div>
                {/* Lock icon indicates read-only */}
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded">
                  Read‑Only
                </span>
              </div>

            </div>
          )}

          {/* Version error (edge case: unknown engine family) */}
          {errors._version && (
            <p className="text-[11px] text-red-500 -mt-4">{errors._version}</p>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* ── OPERATIONAL PARAMETERS (2×2 GRID) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FIELDS.map(({ key, label, unit, placeholder }) => (
              <div key={key}>
                <div className="flex items-baseline justify-between mb-2">
                  <label
                    htmlFor={key}
                    className="text-[11px] font-semibold uppercase tracking-widest text-gray-500"
                  >
                    {label} <span className="text-cat-yellow">*</span>
                  </label>
                  {/* Unit label — solid black, semibold, clearly visible */}
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#000000' }}>
                    {unit}
                  </span>
                </div>

                <input
                  id={key}
                  type="number"
                  value={inputs[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className={`w-full px-4 py-3 text-sm font-normal rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150 ${
                    errors[key]
                      ? 'border-red-400 focus:ring-red-300/40 focus:border-red-400'
                      : 'border-gray-300 hover:border-gray-400 focus:ring-cat-yellow/40 focus:border-cat-yellow'
                  }`}
                />
                {errors[key] && <p className="mt-1.5 text-[11px] text-red-500">{errors[key]}</p>}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-cat-yellow text-cat-black font-extrabold text-[13px] uppercase tracking-[0.18em] py-4 rounded-lg shadow-sm hover:bg-yellow-400 hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer mt-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Analysis
          </button>

          {/* Footer note — now shows version label + mfg year range */}
          <p className="text-center text-[11px] text-gray-400 pb-2">
            Analysis will use the{' '}
            <span className="font-semibold text-gray-600">
              {engineFamily} — {selectedVersion?.label ?? ''}
            </span>{' '}
            machine learning model.{' '}
            <span className="text-gray-400">Mfg. Years: {displayMfgYear}</span>
          </p>

        </form>
      </div>
    </div>
  );
}
