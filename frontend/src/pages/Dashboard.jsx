import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, ChevronDown, CheckCircle2 } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const ENGINE_OPTIONS = [
  { value: 'C7',  label: 'Caterpillar C7'  },
  { value: 'C15', label: 'Caterpillar C15' },
];

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

  const [engineModel, setEngineModel]   = useState('C7');
  const [inputs, setInputs]             = useState({ ...DEFAULTS['C7'] });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors]             = useState({});

  const handleEngineChange = (val) => {
    setEngineModel(val);
    setInputs({ ...DEFAULTS[val] });
    setErrors({});
    setDropdownOpen(false);
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
    navigate('/analysis', { state: { inputs: { ...parsed, engineModel } } });
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-cat-dark transition-colors duration-300"
      style={FONT}
    >
      {/* Top yellow accent line */}
      <div className="h-1 w-full bg-cat-yellow" />

      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-14">

        {/* ── Page Header ── */}
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cat-yellow mb-2">
            Caterpillar Diagnostics Platform
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white leading-tight">
            Intake and Exhaust Air Leak Detection
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-normal">
            Engine Configuration and Operating Parameters
          </p>
          <div className="mt-5 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-7">

          {/* Engine Type */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Engine Type <span className="text-cat-yellow">*</span>
            </label>

            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-cat-yellow/40 focus:border-cat-yellow transition-all duration-150 cursor-pointer"
              >
                <span>{ENGINE_OPTIONS.find((e) => e.value === engineModel)?.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
                  {ENGINE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleEngineChange(opt.value)}
                      className={`w-full text-left px-5 py-3 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                        engineModel === opt.value
                          ? 'bg-cat-yellow/10 text-gray-900 dark:text-white font-semibold border-l-2 border-l-cat-yellow'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {opt.label}
                      {engineModel === opt.value && (
                        <CheckCircle2 className="w-4 h-4 text-cat-yellow" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Parameter Fields */}
          {FIELDS.map(({ key, label, unit, placeholder }) => (
            <div key={key}>
              <div className="flex items-baseline justify-between mb-2">
                <label
                  htmlFor={key}
                  className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400"
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
                className={`w-full px-5 py-3.5 text-sm font-normal rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150 ${
                  errors[key]
                    ? 'border-red-400 focus:ring-red-300/40 focus:border-red-400'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 focus:ring-cat-yellow/40 focus:border-cat-yellow'
                }`}
              />

              {errors[key] && (
                <p className="mt-1.5 text-[11px] text-red-500">{errors[key]}</p>
              )}
            </div>
          ))}

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800" />

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
            Analysis will use the <span className="font-semibold text-gray-600 dark:text-gray-300">Caterpillar {engineModel}</span> machine learning model.
          </p>

        </form>
      </div>
    </div>
  );
}
