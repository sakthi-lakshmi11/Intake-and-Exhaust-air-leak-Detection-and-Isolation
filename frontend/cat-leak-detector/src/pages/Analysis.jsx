import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { CheckCircle2 } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const STEPS = [
  { label: 'Validating Input Parameters',    start: 0,  end: 20  },
  { label: 'Loading Selected Engine Model',  start: 20, end: 40  },
  { label: 'Running Leak Detection Model',   start: 40, end: 65  },
  { label: 'Calculating Confidence Score',   start: 65, end: 85  },
  { label: 'Preparing Recommendations',      start: 85, end: 100 },
];

// SVG circular progress
function CircularProgress({ pct }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width="136" height="136" viewBox="0 0 136 136">
      {/* Track */}
      <circle cx="68" cy="68" r={r} fill="none" stroke="#F3F4F6" strokeWidth="8" />
      {/* Progress */}
      <circle
        cx="68"
        cy="68"
        r={r}
        fill="none"
        stroke="#FFCD11"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 68 68)"
        style={{ transition: 'stroke-dashoffset 0.12s linear' }}
      />
      {/* Percentage text */}
      <text
        x="68"
        y="68"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="22"
        fontWeight="800"
        fill="#111111"
        fontFamily="Inter, Segoe UI, Arial, sans-serif"
      >
        {pct}%
      </text>
    </svg>
  );
}

export default function Analysis() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const inputs = location.state?.inputs;

  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!inputs) { navigate('/dashboard'); return; }

    const duration    = 5000;
    const interval    = 50;
    const totalTicks  = duration / interval;
    let ticks         = 0;

    const timer = setInterval(() => {
      ticks++;
      const pct = Math.min(Math.round((ticks / totalTicks) * 100), 100);
      setProgress(pct);

      let step = 0;
      for (let i = 0; i < STEPS.length; i++) {
        if (pct >= STEPS[i].start && pct < STEPS[i].end) { step = i; break; }
        if (pct === 100) step = STEPS.length - 1;
      }
      setActiveStep(step);

      if (pct >= 100) {
        clearInterval(timer);
        api.predict(inputs, currentUser).then((res) => {
          if (res.success) {
            navigate('/results', { state: { report: res.data } });
          } else {
            alert('Analysis error: ' + res.message);
            navigate('/dashboard');
          }
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const engineModel = inputs?.engineModel || '—';

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center px-4 py-12 transition-colors duration-300"
      style={FONT}
    >
      {/* Top yellow accent */}
      <div className="fixed top-0 left-0 w-full h-1 bg-cat-yellow z-50" />

      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">

          {/* Card header */}
          <div className="bg-cat-black px-8 py-5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cat-yellow mb-1">
              Caterpillar Diagnostics Platform
            </p>
            <h1 className="text-base font-extrabold uppercase tracking-wide text-white leading-snug">
              Intake and Exhaust Air Leak Detection
            </h1>
          </div>

          <div className="px-8 py-8 space-y-8">

            {/* Circular progress */}
            <div className="flex flex-col items-center gap-3">
              <CircularProgress pct={progress} />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Analyzing Engine Parameters
              </p>
              <p className="text-[11px] text-gray-400">
                Engine Model:&nbsp;
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Caterpillar {engineModel}
                </span>
              </p>
            </div>

            {/* Linear progress bar */}
            <div className="space-y-2">
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cat-yellow rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                <span>Analysis in progress</span>
                <span>Estimated time: 3–5 sec</span>
              </div>
            </div>

            {/* Steps list */}
            <div className="space-y-3">
              {STEPS.map((step, idx) => {
                const done    = idx < activeStep || progress === 100;
                const current = idx === activeStep && progress < 100;
                const pending = idx > activeStep && progress < 100;

                return (
                  <div
                    key={step.label}
                    className={`flex items-center gap-3 transition-opacity duration-300 ${pending ? 'opacity-35' : 'opacity-100'}`}
                  >
                    {/* Icon */}
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : current ? (
                      <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full border-2 border-cat-yellow border-t-transparent animate-spin block" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-gray-300 block" />
                      </span>
                    )}

                    {/* Label */}
                    <span
                      className={`text-sm ${
                        done    ? 'text-gray-700 font-medium' :
                        current ? 'text-gray-900 font-semibold' :
                                  'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Card footer */}
          <div className="border-t border-gray-100 px-8 py-4 bg-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
              Do not close or navigate away
            </span>
            <span className="text-[10px] font-bold text-cat-yellow uppercase tracking-widest">
              {progress}% Complete
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
