import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelect from './LanguageSelect';
import ThemeToggle from './ThemeToggle';
import CaterpillarLogo from './CaterpillarLogo';
import { Menu, X, LogOut } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_ITEMS = [
    { label: t('navHome'),    path: '/' },
    { label: t('navAbout'),   path: '/about' },
    { label: t('navSupport'), path: '/support' },
    { label: t('navContact'), path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="bg-cat-black text-white border-b-2 border-cat-yellow sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 group" id="nav-logo-link">
            <CaterpillarLogo className="h-6 text-white group-hover:text-cat-yellow transition-colors duration-200" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                style={FONT}
                className={`px-4 py-2 text-[12px] font-semibold uppercase tracking-wide transition-colors duration-150 ${
                  isActive(path)
                    ? 'text-cat-yellow border-b-2 border-cat-yellow'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSelect />
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1.5">
                <div className="text-right leading-tight">
                  <div className="text-[11px] font-semibold text-gray-200" style={FONT}>{currentUser.fullName}</div>
                  <div className="text-[10px] text-cat-yellow uppercase font-semibold tracking-wider" style={FONT}>{currentUser.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title={t('navLogout')}
                  className="ml-1 p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                id="login-signup-btn"
                style={FONT}
                className="flex items-center overflow-hidden rounded border border-cat-yellow bg-cat-yellow text-cat-black hover:bg-transparent hover:text-cat-yellow transition-all duration-200 cursor-pointer active:scale-95"
              >
                <span className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest border-r border-black/20 hover:border-cat-yellow/40">
                  {t('navLogin')}
                </span>
                <span className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest">
                  {t('navSignUp')}
                </span>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded text-gray-300 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-cat-black border-t border-gray-800 px-4 py-4 flex flex-col gap-2">
          {NAV_ITEMS.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              style={FONT}
              className={`px-3 py-2 text-sm font-semibold uppercase tracking-wide rounded ${
                isActive(path) ? 'text-cat-yellow bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-gray-800 pt-3 flex items-center justify-between gap-3">
            <LanguageSelect />
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right leading-tight">
                  <div className="text-xs font-semibold text-gray-200" style={FONT}>{currentUser.fullName}</div>
                  <div className="text-[10px] text-cat-yellow uppercase font-semibold" style={FONT}>{currentUser.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded bg-red-500/10 text-red-400 text-xs font-bold uppercase cursor-pointer"
                  style={FONT}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('navLogout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                style={FONT}
                className="flex items-center overflow-hidden rounded border border-cat-yellow bg-cat-yellow text-cat-black text-xs font-bold uppercase tracking-widest cursor-pointer active:scale-95"
              >
                <span className="px-3 py-2 border-r border-black/20">{t('navLogin')}</span>
                <span className="px-3 py-2">{t('navSignUp')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
