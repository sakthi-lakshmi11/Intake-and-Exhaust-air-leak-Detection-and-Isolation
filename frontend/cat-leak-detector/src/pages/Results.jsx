import React, { useState, useRef } from 'react';
import { generateDiagnosticPDF } from '../services/pdfReport';
import { getLeakDisplay } from '../services/leakDisplay'; // FEATURE 2
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EngineDiagram from '../components/EngineDiagram';
import {
  CheckCircle2, AlertTriangle, RotateCcw, FileText,
  LayoutDashboard, CheckSquare, Video, MapPin,
  Clock, User, Hash, Cpu, ZoomIn, X, Play, Film
} from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const riskColor = (level) => {
  if (level === 'Critical') return 'text-red-600';
  if (level === 'High')     return 'text-orange-500';
  if (level === 'Medium')   return 'text-yellow-600';
  return 'text-green-600';
};

const riskBg = (level) => {
  if (level === 'Critical') return 'bg-red-50 border-red-200';
  if (level === 'High')     return 'bg-orange-50 border-orange-200';
  if (level === 'Medium')   return 'bg-yellow-50 border-yellow-200';
  return 'bg-green-50 border-green-200';
};

const leakLocationMap = {
  'No Leak':       'No leak location identified.',
  'Intake Leak':   'Turbocharger Intake Pipe / Intake Manifold',
  'Exhaust Leak':  'Exhaust Manifold Joint / Turbine Outlet',
  'Combined Leak': 'Intake Manifold + Exhaust Manifold',
};

const Divider = () => <div className="h-px bg-gray-100" />;

const SectionTitle = ({ children }) => (
  <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-4">
    {children}
  </h2>
);

// ─────────────────────────────────────────────────────────────────────────────
// REPAIR VIDEO LIBRARY
// System-provided guidance videos. Operators watch only — no upload.
// Replace `src` with a real URL or hosted path when videos are available.
// ─────────────────────────────────────────────────────────────────────────────
const VIDEO_SLOTS = [
  {
    id:    1,
    label: 'Repair Video 1',
    title: 'Pre-Inspection Walkthrough',
    desc:  'Complete engine bay inspection procedure before beginning any repair.',
    src:   '',   // replace with hosted video URL, e.g. '/videos/repair-guide-1.mp4'
  },
  {
    id:    2,
    label: 'Repair Video 2',
    title: 'Intake & Exhaust Leak Diagnosis',
    desc:  'Step-by-step identification of intake and exhaust air leak sources.',
    src:   '',   // replace with hosted video URL
  },
  {
    id:    3,
    label: 'Repair Video 3',
    title: 'Post-Repair Verification',
    desc:  'Verification checklist and pressure test after completing the repair.',
    src:   '',   // replace with hosted video URL
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RepairVideoCard
// Read-only guidance video card. Operators can play / pause / seek / fullscreen.
// No upload, no file-picker, no user-supplied content.
// ─────────────────────────────────────────────────────────────────────────────
function RepairVideoCard({ slot }) {
  const videoRef            = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Sync the `playing` flag with native play/pause events so the overlay
  // button icon stays accurate even when the user uses browser-native controls.
  const handlePlay  = () => setPlaying(true);
  const handlePause = () => setPlaying(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col">

      {/* Card header — black strip matching the industrial dashboard theme */}
      <div className="bg-cat-black px-4 py-2.5 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cat-yellow">
          <Film className="w-3.5 h-3.5" />
          {slot.label}
        </span>
        {/* System-provided badge — reinforces read-only intent */}
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cat-yellow/20 text-cat-yellow">
          System Guide
        </span>
      </div>

      {/* Video area */}
      <div className="relative bg-black flex-1">
        {slot.src ? (
          // ── Real video: native player with full browser controls ──────────
          // `controls` gives play / pause / seek / volume / fullscreen natively.
          <video
            ref={videoRef}
            src={slot.src}
            controls
            onPlay={handlePlay}
            onPause={handlePause}
            className="w-full block bg-black"
            style={{ maxHeight: '180px', objectFit: 'contain' }}
          />
        ) : (
          // ── Placeholder thumbnail shown when no src is configured ─────────
          // Clicking the play button or the thumbnail area triggers togglePlay,
          // which is a no-op here but wires up naturally once a src is set.
          <div
            className="w-full h-[148px] flex flex-col items-center justify-center gap-3
                       bg-gradient-to-br from-gray-900 to-gray-800 cursor-pointer group"
            onClick={togglePlay}
            role="button"
            aria-label={`Play ${slot.label}`}
          >
            {/* Play button ring */}
            <div className="w-12 h-12 rounded-full border-2 border-cat-yellow/60
                            flex items-center justify-center
                            group-hover:border-cat-yellow group-hover:bg-cat-yellow/10
                            transition-all duration-200">
              <Play className="w-5 h-5 text-cat-yellow fill-cat-yellow ml-0.5" />
            </div>
            {/* Video title inside the thumbnail */}
            <p className="text-[11px] font-semibold text-gray-300 px-4 text-center leading-snug">
              {slot.title}
            </p>
          </div>
        )}
      </div>

      {/* Footer — video description + Watch Video button */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 shrink-0 space-y-2">
        {/* Short description of what the video covers */}
        <p className="text-[10px] text-gray-500 leading-relaxed">{slot.desc}</p>
        {/* Watch Video button — plays the video (or shows coming-soon notice) */}
        <button
          type="button"
          onClick={() =>
            slot.src
              ? videoRef.current?.play()
              : alert('Video coming soon. Contact your system administrator to configure the repair video library.')
          }
          className="w-full flex items-center justify-center gap-2
                     bg-cat-black text-white text-[11px] font-bold uppercase tracking-wider
                     py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Watch Video
        </button>
      </div>

    </div>
  );
}

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

  // Resolve all no-leak display values from a single source of truth.
  // isGo → leakLabel='NO LEAK' (green), riskDisplay='—', sectionDisplay='—'
  // leak  → leakLabel=prediction, riskDisplay=riskLevel, sectionDisplay=derived
  const leakDisplay = getLeakDisplay(prediction, riskLevel);

  const handleGenerateReport = () => {
    generateDiagnosticPDF(report, currentUser);
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-300" style={FONT}>
      <div className="h-1 w-full bg-cat-yellow" />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">

        {/* ── 1. HEADER ── */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cat-yellow">
            Diagnostics Analysis Report
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            Intake and Exhaust Air Leak Detection
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-[12px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Analysis ID: <span className="font-semibold text-gray-700 ml-1">{id}</span>
            </span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{timestamp}</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />Caterpillar {engineModel}</span>
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{report.technician || currentUser?.fullName || '—'}</span>
          </div>
        </div>

        <Divider />

        {/* ── 2. PRIMARY RESULT ── */}
        <div className={`rounded-xl border-2 p-6 sm:p-8 flex items-start gap-5 ${
          isGo ? 'bg-green-50 border-green-300'
               : 'bg-red-50 border-red-300'
        }`}>
          <div className={`p-3 rounded-full shrink-0 ${isGo ? 'bg-green-100' : 'bg-red-100'}`}>
            {isGo ? <CheckCircle2 className="w-10 h-10 text-green-600" /> : <AlertTriangle className="w-10 h-10 text-red-600" />}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1">System Status</p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold uppercase tracking-tight ${isGo ? 'text-green-700' : 'text-red-700'}`}>
              {isGo ? 'GO — System Clear' : 'NON-GO — Leak Detected'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-xl leading-relaxed">
              {isGo
                ? 'Engine operating parameters are within acceptable limits. No significant intake or exhaust air leak detected.'
                : 'Potential air leak detected in the engine air system. Maintenance action is recommended before continued operation.'}
            </p>
          </div>
        </div>

        {/* ── 3. SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Confidence Score</p>
            <p className="text-2xl font-extrabold text-gray-900">{confidence}%</p>
            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-cat-yellow rounded-full" style={{ width: `${confidence}%` }} />
            </div>
          </div>
          {/* Leak Status card
               No-leak  → 'NO LEAK' in green
               Leak      → raw prediction string in existing dark colour */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Leak Status</p>
            <p className={`text-lg font-extrabold leading-tight ${
              leakDisplay.isNil ? 'text-green-600' : 'text-gray-900'
            }`}>
              {leakDisplay.leakLabel}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
              {leakDisplay.leakStatus}
            </p>
          </div>

          {/* Risk Level card
               No-leak  → '—' in neutral grey, neutral background
               Leak      → existing coloured background + coloured text */}
          <div className={`border rounded-xl p-5 ${
            leakDisplay.isNil ? 'bg-white border-gray-200' : riskBg(riskLevel)
          }`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Risk Level</p>
            <p className={`text-lg font-extrabold leading-tight ${
              leakDisplay.isNil ? 'text-gray-400' : riskColor(riskLevel)
            }`}>
              {leakDisplay.isNil ? '—' : riskLevel}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Risk Assessment</p>
          </div>

          {/* Detected Section card
               No-leak  → '—' in neutral grey
               Leak      → derived section label in dark colour */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Detected Section</p>
            <p className={`text-sm font-extrabold leading-tight ${
              leakDisplay.isNil ? 'text-gray-400' : 'text-gray-900'
            }`}>
              {leakDisplay.sectionDisplay}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Engine Section</p>
          </div>
        </div>

        <Divider />

        {/* ── 4. LEAK LOCATION ── */}
        <div>
          <SectionTitle>Detected Leak Location</SectionTitle>
          <div className="flex items-start gap-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${isGo ? 'text-green-500' : 'text-red-500'}`} />
            <div>
              <p className="text-sm font-semibold text-gray-900">{leakLocation}</p>
              {/* Severity badge — hidden entirely when no leak */}
              {!leakDisplay.isNil && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Severity:</span>
                  <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                    riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                    riskLevel === 'High'     ? 'bg-orange-100 text-orange-700' :
                    riskLevel === 'Medium'   ? 'bg-yellow-100 text-yellow-700' :
                                               'bg-green-100 text-green-700'
                  }`}>{riskLevel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Divider />

        {/* ── 5. ENGINE DIAGRAM ── */}
        <div>
          <SectionTitle>Leak Location Visualization</SectionTitle>
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {/* Header strip */}
            <div className="bg-cat-black px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cat-yellow">
                {engineModel} — Air System Schematic
              </span>
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                isGo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isGo ? '✓ Clear' : '⚠ Leak'}
              </span>
            </div>

            {/* Diagram wrapper — centred, aspect-ratio preserved, no overflow clip */}
            <div
              className="w-full flex items-center justify-center cursor-pointer group relative bg-white py-2 px-2"
              onClick={() => setImageOpen(true)}
            >
              {/* SVG fills available width; height is auto via viewBox + preserveAspectRatio */}
              <div className="w-full max-w-full">
                <EngineDiagram engineModel={engineModel} prediction={prediction} isGo={isGo} />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200 flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-cat-black/85 text-white rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
                  <ZoomIn className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">View Full Diagram</span>
                </div>
              </div>
            </div>

            {/* Footer strip */}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                {isGo ? 'No Leak Location Identified' : leakLocation}
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

        <Divider />

        {/* ── 6. REPAIR GUIDANCE LIBRARY (system-provided, read-only) ── */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <SectionTitle>Repair Guidance Library</SectionTitle>
            {/* Contextual note — makes the read-only intent explicit to the operator */}
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              System-provided · Read only
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {VIDEO_SLOTS.map((slot) => (
              <RepairVideoCard key={slot.id} slot={slot} />
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 7. RECOMMENDATIONS ── */}
        <div>
          <SectionTitle>Recommended Maintenance Actions</SectionTitle>
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {(recommendations || []).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <CheckSquare className="w-4 h-4 text-cat-yellow shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 leading-relaxed">{rec}</span>
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
              <div key={label} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 9. ACTION BUTTONS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 border border-gray-300 hover:border-cat-yellow text-gray-700 hover:text-gray-900 px-5 py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.98]"
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

            {/* Diagram — centred, aspect-ratio preserved, equal padding */}
            <div className="flex-1 overflow-auto bg-white flex items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-full">
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
