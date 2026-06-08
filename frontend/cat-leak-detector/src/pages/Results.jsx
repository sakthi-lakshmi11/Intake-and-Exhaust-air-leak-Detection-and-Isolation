import React, { useState } from 'react';
import { generateDiagnosticPDF } from '../services/pdfReport';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EngineDiagram from '../components/EngineDiagram';
import {
  CheckCircle2, AlertTriangle, RotateCcw, FileText,
  LayoutDashboard, CheckSquare, Video, MapPin,
  Clock, User, Hash, Cpu, ZoomIn, X
} from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const riskColor = (level) => {
  if (level === 'Critical') return 'text-red-600';
  if (level === 'High')     return 'text-orange-500';
  if (level === 'Medium')   return 'text-yellow-600';
  return 'text-green-600';
};

const riskBg = (level) => {
  if (level === 'Critical') return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800';
  if (level === 'High')     return 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800';
  if (level === 'Medium')   return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800';
  return 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800';
};

const leakLocationMap = {
  'No Leak':       'No leak location identified.',
  'Intake Leak':   'Turbocharger Intake Pipe / Intake Manifold',
  'Exhaust Leak':  'Exhaust Manifold Joint / Turbine Outlet',
  'Combined Leak': 'Intake Manifold + Exhaust Manifold',
};

const Divider = () => <div className="h-px bg-gray-100 dark:bg-gray-800" />;

const SectionTitle = ({ children }) => (
  <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-4">
    {children}
  </h2>
);

export default function Results() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [imageOpen, setImageOpen] = useState(false);

  const report = location.state?.report;

  if (!report) {
    React.useEffect(() => { navigate('/dashboard'); }, []);
    return null;
  }

 const {
  id,
  timestamp,
  prediction = report.leak_section || 'No Leak',
  status = report.go_nogo || 'GO',
  confidence = 0,
  riskLevel = report.severity || 'Low',
  recommendations = [],
  inputs = {}
} = report;
  const engineModel = report.engineModel || inputs?.engineModel || 'C7';
  const isGo =
  status === 'GO' ||
  status === 'Healthy' ||
  prediction === 'Healthy' ||
  prediction === 'No Leak';
  const leakLocation = leakLocationMap[prediction] || '—';

  const handleGenerateReport = () => {
    generateDiagnosticPDF(report, currentUser);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-cat-dark transition-colors duration-300" style={FONT}>
      <div className="h-1 w-full bg-cat-yellow" />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">

        {/* ── 1. HEADER ── */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cat-yellow">
            Diagnostics Analysis Report
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">
            Intake and Exhaust Air Leak Detection
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-[12px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Analysis ID: <span className="font-semibold text-gray-700 dark:text-gray-300 ml-1">{id}</span>
            </span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{timestamp}</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />Caterpillar {engineModel}</span>
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{report.technician || currentUser?.fullName || '—'}</span>
          </div>
        </div>

        <Divider />

        {/* ── 2. PRIMARY RESULT ── */}
        <div className={`rounded-xl border-2 p-6 sm:p-8 flex items-start gap-5 ${
          isGo ? 'bg-green-50 border-green-300 dark:bg-green-900/10 dark:border-green-700'
               : 'bg-red-50 border-red-300 dark:bg-red-900/10 dark:border-red-700'
        }`}>
          <div className={`p-3 rounded-full shrink-0 ${isGo ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {isGo ? <CheckCircle2 className="w-10 h-10 text-green-600" /> : <AlertTriangle className="w-10 h-10 text-red-600" />}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">System Status</p>
            <h2 className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-tight ${isGo ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {isGo ? 'GO — System Clear' : 'NON-GO — Leak Detected'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
              {isGo
                ? 'Engine operating parameters are within acceptable limits. No significant intake or exhaust air leak detected.'
                : 'Potential air leak detected in the engine air system. Maintenance action is recommended before continued operation.'}
            </p>
          </div>
        </div>

        {/* ── 3. SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Confidence Score</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{confidence}%</p>
            <div className="mt-2 h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-cat-yellow rounded-full" style={{ width: `${confidence}%` }} />
            </div>
          </div>
          <div className="bg-white dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Leak Status</p>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{prediction}</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">ML Classification</p>
          </div>
          <div className={`border rounded-xl p-5 ${riskBg(riskLevel)}`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Risk Level</p>
            <p className={`text-lg font-extrabold leading-tight ${riskColor(riskLevel)}`}>{riskLevel}</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Risk Assessment</p>
          </div>
          <div className="bg-white dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Detected Section</p>
            <p className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
              {isGo ? 'None' : prediction.includes('Intake') && prediction.includes('Exhaust') ? 'Intake + Exhaust'
                : prediction.includes('Intake') ? 'Intake System' : 'Exhaust System'}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Engine Section</p>
          </div>
        </div>

        <Divider />

        {/* ── 4. LEAK LOCATION ── */}
        <div>
          <SectionTitle>Detected Leak Location</SectionTitle>
          <div className="flex items-start gap-4 bg-gray-50 dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${isGo ? 'text-green-500' : 'text-red-500'}`} />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{leakLocation}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Severity:</span>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                  riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                  riskLevel === 'High'     ? 'bg-orange-100 text-orange-700' :
                  riskLevel === 'Medium'   ? 'bg-yellow-100 text-yellow-700' :
                                             'bg-green-100 text-green-700'
                }`}>{riskLevel}</span>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* ── 5 + 6. ENGINE DIAGRAM + REPAIR VIDEO ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Engine Diagram */}
          <div>
            <SectionTitle>Leak Location Visualization</SectionTitle>
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-cat-charcoal">
              {/* Header strip */}
              <div className="bg-cat-black px-4 py-2.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cat-yellow">
                  CAT {engineModel} — Air System Schematic
                </span>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  isGo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {isGo ? '✓ Clear' : '⚠ Leak'}
                </span>
              </div>

              {/* Diagram — full width, aspect-ratio preserved */}
              <div
                className="w-full cursor-pointer group relative bg-white"
                onClick={() => setImageOpen(true)}
              >
                <EngineDiagram
                  engineModel={engineModel}
                  prediction={prediction}
                  isGo={isGo}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-cat-black/85 text-white rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">View Full Diagram</span>
                  </div>
                </div>
              </div>

              {/* Footer strip */}
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {isGo ? 'No leak markers' : leakLocation}
                </span>
                <button
                  onClick={() => setImageOpen(true)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-cat-yellow hover:underline uppercase tracking-wider cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  View Leak Location
                </button>
              </div>
            </div>
          </div>

          {/* Repair Video */}
          <div>
            <SectionTitle>Repair Guidance Video</SectionTitle>
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-cat-charcoal h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <div className="text-center">
                  <div
                    className="w-14 h-14 rounded-full bg-cat-black/80 flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-cat-yellow group transition-colors"
                    onClick={() => alert('Video integration ready. Connect MP4 or YouTube link to enable playback.')}
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white group-hover:fill-cat-black transition-colors ml-0.5">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isGo ? 'Routine Maintenance Guide' : `${prediction} Repair Tutorial`}
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => alert('Video integration ready. Connect MP4 or YouTube link to enable playback.')}
                  className="w-full flex items-center justify-center gap-2 bg-cat-black text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  Watch Repair Guide
                </button>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* ── 7. RECOMMENDATIONS ── */}
        <div>
          <SectionTitle>Recommended Maintenance Actions</SectionTitle>
          <div className="bg-white dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
            {(recommendations || []).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <CheckSquare className="w-4 h-4 text-cat-yellow shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 8. PARAMETERS SUMMARY ── */}
        <div>
          <SectionTitle>Input Parameters Summary</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Engine Model',       value: `CAT ${engineModel}` },
              { label: 'Engine RPM',         value: `${inputs?.rpm} RPM` },
              { label: 'Fuel Rate',          value: `${inputs?.fuelRate} L/hr` },
              { label: 'Injection Time',     value: `${inputs?.fuelInjectionTime} ms` },
              { label: 'Injection Pressure', value: `${inputs?.injectionPressure} bar` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 9. ACTION BUTTONS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 hover:border-cat-yellow text-gray-700 dark:text-gray-300 hover:text-gray-900 px-5 py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            Run New Analysis
          </button>
          <button
            onClick={handleGenerateReport}
            className="flex items-center justify-center gap-2 bg-cat-yellow text-cat-black hover:bg-yellow-400 px-5 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 bg-cat-black text-white hover:bg-gray-800 px-5 py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <LayoutDashboard className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>

      </div>

      {/* ── Engine Diagram Modal ── */}
      {imageOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setImageOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-3xl flex flex-col"
            style={{ maxHeight: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="bg-cat-black px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cat-yellow">
                  Leak Location Analysis
                </p>
                <p className="text-sm font-bold text-white mt-0.5">
                  Engine: Caterpillar {engineModel}
                </p>
              </div>
              <button
                onClick={() => setImageOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagram — centered, responsive, aspect-ratio preserved */}
            <div className="flex-1 overflow-auto bg-white flex items-center justify-center p-6">
              <div className="w-full">
                <EngineDiagram
                  engineModel={engineModel}
                  prediction={prediction}
                  isGo={isGo}
                />
              </div>
            </div>

            {/* Status + location info */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  {/* Leak status */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Leak Status:</span>
                    <span className={`flex items-center gap-1.5 text-sm font-bold ${
                      isGo ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isGo ? (
                        <><CheckCircle2 className="w-4 h-4" /> NO LEAK DETECTED</>
                      ) : (
                        <><AlertTriangle className="w-4 h-4" /> LEAK DETECTED</>
                      )}
                    </span>
                  </div>
                  {/* Leak location */}
                  <div className="flex items-start gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">Leak Location:</span>
                    <span className="text-sm font-semibold text-gray-800">{leakLocation}</span>
                  </div>
                  {/* Analysis summary */}
                  <div className="flex items-start gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">Analysis Summary:</span>
                    <span className="text-xs text-gray-600 leading-relaxed max-w-sm">
                      {isGo
                        ? 'All air pathways operating within nominal parameters. No corrective action required.'
                        : `ML model detected anomaly in the ${leakLocation.toLowerCase()} region. Prompt inspection recommended.`
                      }
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleGenerateReport}
                    className="flex items-center gap-2 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generate Report
                  </button>
                  <button
                    onClick={() => setImageOpen(false)}
                    className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:border-gray-400 font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
