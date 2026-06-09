import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Activity, Settings, Shield } from 'lucide-react';
import heroImg from '../assets/engine-hero.jpg';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function Welcome() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(currentUser ? '/dashboard' : '/login');
  };

  const features = [
    { icon: <Activity className="w-6 h-6" />, title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: <Settings className="w-6 h-6" />, title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: <Shield className="w-6 h-6" />, title: t('feature3Title'), desc: t('feature3Desc') },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={FONT}>

      {/* Hero */}
      <div className="relative h-[82vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Caterpillar Engine"
            className="w-full h-full object-cover brightness-[0.35]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-2xl">
            <p className="section-label-yellow mb-4">
              {t('heroBadge')}
            </p>
            <h1 className="text-5xl sm:text-6xl font-extrabold uppercase tracking-tight text-white leading-[1.1] mb-5">
              {t('heroTitle')}
            </h1>
            <p className="text-base text-gray-300 leading-relaxed mb-3">
              {t('heroSubheading')}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-lg">
              {t('heroDesc')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGetStarted}
                className="flex items-center gap-2 bg-cat-yellow text-cat-black font-bold text-sm uppercase tracking-wider px-6 py-3 hover:bg-white transition-colors cursor-pointer active:scale-95"
              >
                {t('getStarted')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#capabilities"
                className="border border-gray-500 hover:border-white text-gray-300 hover:text-white font-semibold text-sm uppercase tracking-wider px-6 py-3 transition-colors"
              >
                {t('learnMore')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div id="capabilities" className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div className="mb-10">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900">
              {t('featuresTitle')}
            </h2>
            <div className="w-10 h-0.5 bg-cat-yellow mt-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors duration-200"
              >
                <div className="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-700 mb-4">
                  {icon}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
