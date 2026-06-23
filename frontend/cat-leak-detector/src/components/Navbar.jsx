import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelect from './LanguageSelect';
import CaterpillarLogo from './CaterpillarLogo';
import { Menu, X, LogOut, User, FileText } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const NAV_ITEMS = [
    { label: t('navHome'), path: '/' },
    { label: t('navAbout'), path: '/about' },
    { label: t('navSupport'), path: '/support' },
    { label: t('navContact'), path: '/contact' },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdown(false);
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleMyReports = () => {
    navigate('/reports');
    setUserDropdown(false);
  };

  const handleProfile = () => {
    console.log("PROFILE CLICKED");
    console.log(window.location.href);
    navigate('/profile');
    setUserDropdown(false);
  };

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

            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1.5 hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-cat-yellow flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-cat-black" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-200" style={FONT}>{currentUser.fullName}</span>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    <button
                      onClick={handleProfile}
                      className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      {t('navProfile') || 'Profile'}
                    </button>
                    <button
                      onClick={handleMyReports}
                      className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {t('navMyReports') || 'My Reports'}
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('navLogout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                style={FONT}
                className="flex items-center rounded border border-cat-yellow bg-cat-yellow text-cat-black font-bold text-[11px] uppercase tracking-widest px-4 py-2 hover:bg-transparent hover:text-cat-yellow transition-all duration-200 cursor-pointer"
              >
                {t('navLogin')}
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex lg:hidden items-center gap-2">
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
                <button
                  onClick={() => {
                    handleProfile();
                    setMobileOpen(false);
                  }}
                  className="text-right leading-tight hover:text-cat-yellow transition-colors"
                  style={FONT}
                >
                  <div className="text-xs font-semibold text-gray-200">{currentUser.fullName}</div>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
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
                className="px-4 py-2 rounded border border-cat-yellow bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-widest cursor-pointer"
              >
                {t('navLogin')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}