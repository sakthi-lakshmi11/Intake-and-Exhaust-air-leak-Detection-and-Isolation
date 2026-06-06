import React from 'react';

export default function TelemetryCard({ label, value, unit, status = 'normal', min, max }) {
  // status: 'normal', 'warning', 'critical'
  const borderColors = {
    normal: 'border-l-brand-success',
    warning: 'border-l-brand-warning',
    critical: 'border-l-brand-critical'
  };

  const textColors = {
    normal: 'text-brand-success',
    warning: 'text-brand-warning',
    critical: 'text-brand-critical'
  };

  const bgColors = {
    normal: 'bg-brand-success/10',
    warning: 'bg-brand-warning/10',
    critical: 'bg-brand-critical/10'
  };

  return (
    <div className={`p-4 bg-white dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 border-l-4 ${borderColors[status]} rounded-lg shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{label}</span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${bgColors[status]} ${textColors[status]}`}>
          {status}
        </span>
      </div>
      
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">{value}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium font-mono">{unit}</span>
      </div>

      {(min !== undefined && max !== undefined) && (
        <div className="mt-2.5">
          <div className="flex justify-between text-[9px] text-gray-400 font-mono">
            <span>MIN: {min}</span>
            <span>MAX: {max}</span>
          </div>
          <div className="mt-1 w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                status === 'normal' ? 'bg-brand-success' : status === 'warning' ? 'bg-brand-warning' : 'bg-brand-critical'
              }`}
              style={{
                width: `${Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)}%`
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
