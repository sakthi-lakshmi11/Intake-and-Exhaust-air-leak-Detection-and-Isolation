import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSelect() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef} id="language-selector-wrapper">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-cat-gray-light dark:bg-cat-gray-dark text-gray-800 dark:text-gray-200 text-sm font-medium hover:border-cat-yellow dark:hover:border-cat-yellow transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4 text-cat-yellow" />
        <span className="hidden sm:inline">{currentLang.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-lg shadow-lg bg-white dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-sm hover:bg-cat-gray-light dark:hover:bg-cat-gray-dark transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                locale === lang.code ? 'text-cat-yellow font-bold bg-cat-gray-light/50 dark:bg-cat-gray-dark/50' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-xs opacity-60 font-mono">{lang.native}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
