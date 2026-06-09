import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, ChevronDown, CheckCircle2 } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

// Cascading configuration hierarchy
const ENGINE_FAMILY_OPTIONS = [
  { value: 'C7',  label: 'Caterpillar C7'  },
  { value: 'C15', label: 'Caterpillar C15' },
];

const ENGINE_CONFIG_BY_FAMILY = {
  C7: [
    { value: 'turbocharged', label: 'Turbocharged Diesel Engine' },
    { value: 'industrial', label: 'Industrial Diesel Engine' },
    { value: 'generator', label: 'Generator Diesel Engine' },
  ],
  C15: [
    { value: 'turbocharged', label: 'Turbocharged Diesel Engine' },
    { value: 'heavyduty', label: 'Heavy Duty Industrial Engine' },
    { value: 'generator', label: 'Generator Diesel Engine' },
  ],
};

const TURBO_CONFIG_BY_ENGINE = {
  turbocharged: [
    { value: 'ta', label: 'TA (Turbocharged Aftercooled)' },
    { value: 'ataac', label: 'ATAAC (Air-To-Air Aftercooled)' },
  ],
  industrial: [
    { value: 'standard', label: 'Standard Configuration' },
    { value: 'highoutput', label: 'High Output Configuration' },
  ],
  heavyduty: [
    { value: 'standard', label: 'Standard Configuration' },
    { value: 'highoutput', label: 'High Output Configuration' },
  ],
  generator: [
    { value: 'standard', label: 'Standard Configuration' },
    { value: 'highoutput', label: 'High Output Configuration' },
  ],
};

const MANUFACTURING_YEARS = Array.from({ length: 20 }, (_, i) => 2005 + i).map(year => ({
  value: String(year),
  label: String(year),
}));

const DEFAULTS = {
  C7:  { rpm: 1400, fuelRate: 18,  fuelInjectionTime: 1.6, injectionPressure: 900  },
  C15: { rpm: 1800, fuelRate: 45,  fuelInjectionTime: 2.1, injectionPressure: 1400 },
};

const FIELDS = [
  {
    key: 'rpm',
    label: 'Engine RPM',
    unit: 'RPM',
    min: 600,
    max: 2500,
    step: 50,
    placeholder: 'Enter engine RPM',
  },
  {
    key: 'fuelRate',
    label: 'Fuel Rate',
    unit: 'L/hr',
    min: 1,
    max: 120,
    step: 0.5,
    placeholder: 'Enter fuel rate',
  },
  {
    key: 'fuelInjectionTime',
    label: 'Fuel Injection Time',
    unit: 'ms',
    min: 0.5,
    max: 5.0,
    step: 0.1,
    placeholder: 'Enter injection time',
  },
  {
    key: 'injectionPressure',
    label: 'Fuel Injection Pressure',
    unit: 'bar',
    min: 200,
    max: 2000,
    step: 10,
    placeholder: 'Enter injection pressure',
  },
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Cascading state
  const [engineFamily, setEngineFamily] = useState('C7');
  const [engineConfig, setEngineConfig] = useState('turbocharged');
  const [turboConfig, setTurboConfig] = useState('ta');
  const [manufacturingYear, setManufacturingYear] = useState('2024');

  // Input parameters
  const [inputs, setInputs] = useState({ ...DEFAULTS['C7'] });
  const [errors, setErrors] = useState({});

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Handle engine family change
  const handleFamilyChange = (family) => {
    setEngineFamily(family);
    // Reset downstream selections
    const defaultConfig = ENGINE_CONFIG_BY_FAMILY[family][0].value;
    setEngineConfig(defaultConfig);
    const defaultTurbo = TURBO_CONFIG_BY_ENGINE[defaultConfig][0].value;
    setTurboConfig(defaultTurbo);
    setInputs({ ...DEFAULTS[family] });
    setErrors({});
    setOpenDropdown(null);
  };

  // Handle engine config change
  const handleConfigChange = (config) => {
    setEngineConfig(config);
    // Reset turbo config to first option
    const defaultTurbo = TURBO_CONFIG_BY_ENGINE[config][0].value;
    setTurboConfig(defaultTurbo);
    setErrors({});
    setOpenDropdown(null);
  };

  // Handle turbo config change
  const handleTurboChange = (turbo) => {
    setTurboConfig(turbo);
    setErrors({});
    setOpenDropdown(null);
  };

  // Handle year change
  const handleYearChange = (year) => {
    setManufacturingYear(year);
    setErrors({});
    setOpenDropdown(null);
  };

  const handleChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    FIELDS.forEach(({ key, min, max, label }) => {
      const val = parseFloat(inputs[key]);
      if (inputs[key] === '' || isNaN(val)) {
        errs[key] = `${label} is required.`;
      } else if (val < min || val > max) {
        errs[key] = `Valid range: ${min} – ${max}`;
      }
    });
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
          engineModel: engineFamily,
          engineFamily,
          engineConfig,
          turboConfig,
          manufacturingYear,
        } 
      } 
    });
  };

  return (
    <div
      className="min-h-screen bg-white transition-colors duration-300"
      style={FONT}
    >
      {/* Top yellow accent line */}
      <div className="h-1 w-full bg-cat-yellow" />

      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-14">

        {/* ── Page Header ── */}
        <div className="mb-10">
          <p className="section-label-yellow mb-2">
            NovaCrafters Diagnostics Platform
          </p>
          <h1 className="main-heading-white leading-tight">
            Intake and Exhaust Air Leak Detection
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-normal">
            Engine Configuration and Operating Parameters
          </p>
          <div className="mt-5 h-px bg-gray-100" />
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-7">

          {/* ── CASCADING DROPDOWNS (2x2 GRID) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Engine Family */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Engine Family <span className="text-cat-yellow">*</span>
              </label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'family' ? null : 'family')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/40 focus:border-cat-yellow transition-all duration-150 cursor-pointer"
                >
                  <span>{ENGINE_FAMILY_OPTIONS.find((e) => e.value === engineFamily)?.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdown === 'family' ? 'rotate-180' : ''}`}
                  />
                </button>

                {openDropdown === 'family' && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    {ENGINE_FAMILY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleFamilyChange(opt.value)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                          engineFamily === opt.value
                            ? 'bg-cat-yellow/10 text-gray-900 font-semibold border-l-2 border-l-cat-yellow'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                        {engineFamily === opt.value && (
                          <CheckCircle2 className="w-4 h-4 text-cat-yellow" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Engine Configuration */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Engine Configuration <span className="text-cat-yellow">*</span>
              </label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'config' ? null : 'config')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/40 focus:border-cat-yellow transition-all duration-150 cursor-pointer"
                >
                  <span>{ENGINE_CONFIG_BY_FAMILY[engineFamily].find((e) => e.value === engineConfig)?.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdown === 'config' ? 'rotate-180' : ''}`}
                  />
                </button>

                {openDropdown === 'config' && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    {ENGINE_CONFIG_BY_FAMILY[engineFamily].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleConfigChange(opt.value)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                          engineConfig === opt.value
                            ? 'bg-cat-yellow/10 text-gray-900 font-semibold border-l-2 border-l-cat-yellow'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                        {engineConfig === opt.value && (
                          <CheckCircle2 className="w-4 h-4 text-cat-yellow" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Turbo Configuration */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Turbo Configuration <span className="text-cat-yellow">*</span>
              </label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'turbo' ? null : 'turbo')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/40 focus:border-cat-yellow transition-all duration-150 cursor-pointer"
                >
                  <span>{TURBO_CONFIG_BY_ENGINE[engineConfig].find((e) => e.value === turboConfig)?.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdown === 'turbo' ? 'rotate-180' : ''}`}
                  />
                </button>

                {openDropdown === 'turbo' && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    {TURBO_CONFIG_BY_ENGINE[engineConfig].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleTurboChange(opt.value)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                          turboConfig === opt.value
                            ? 'bg-cat-yellow/10 text-gray-900 font-semibold border-l-2 border-l-cat-yellow'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                        {turboConfig === opt.value && (
                          <CheckCircle2 className="w-4 h-4 text-cat-yellow" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Manufacturing Year */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Manufacturing Year <span className="text-cat-yellow">*</span>
              </label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/40 focus:border-cat-yellow transition-all duration-150 cursor-pointer"
                >
                  <span>{manufacturingYear}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdown === 'year' ? 'rotate-180' : ''}`}
                  />
                </button>

                {openDropdown === 'year' && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden max-h-56 overflow-y-auto">
                    {MANUFACTURING_YEARS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleYearChange(opt.value)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                          manufacturingYear === opt.value
                            ? 'bg-cat-yellow/10 text-gray-900 font-semibold border-l-2 border-l-cat-yellow'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                        {manufacturingYear === opt.value && (
                          <CheckCircle2 className="w-4 h-4 text-cat-yellow" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* ── OPERATIONAL PARAMETERS (2x2 GRID) ── */}
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
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
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

                {errors[key] && (
                  <p className="mt-1.5 text-[11px] text-red-500">{errors[key]}</p>
                )}
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

          {/* Footer note */}
          <p className="text-center text-[11px] text-gray-400 pb-2">
            Analysis will use the <span className="font-semibold text-gray-600">{engineFamily} ({manufacturingYear})</span> machine learning model.
          </p>

        </form>
      </div>
    </div>
  );
}
