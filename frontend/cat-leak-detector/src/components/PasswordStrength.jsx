import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PasswordStrength({ password }) {
  const { t } = useLanguage();

  if (!password) return null;

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const score = calculateStrength(password);

  let strengthText = t('weak');
  let strengthColor = 'bg-red-500';
  let barCount = 1;

  if (score >= 4) {
    strengthText = t('strong');
    strengthColor = 'bg-brand-success';
    barCount = 3;
  } else if (score >= 2) {
    strengthText = t('medium');
    strengthColor = 'bg-brand-warning';
    barCount = 2;
  }

  return (
    <div className="mt-2 text-xs font-mono" id="password-strength-indicator">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-500 dark:text-gray-400">{t('passwordStrength')}:</span>
        <span className={`font-bold uppercase ${
          barCount === 3 ? 'text-brand-success' : barCount === 2 ? 'text-brand-warning' : 'text-red-500'
        }`}>{strengthText}</span>
      </div>
      <div className="flex gap-1 h-1.5">
        <div className={`flex-1 rounded-sm transition-all duration-300 ${barCount >= 1 ? strengthColor : 'bg-gray-200 dark:bg-gray-800'}`}></div>
        <div className={`flex-1 rounded-sm transition-all duration-300 ${barCount >= 2 ? strengthColor : 'bg-gray-200 dark:bg-gray-800'}`}></div>
        <div className={`flex-1 rounded-sm transition-all duration-300 ${barCount >= 3 ? strengthColor : 'bg-gray-200 dark:bg-gray-800'}`}></div>
      </div>
    </div>
  );
}
