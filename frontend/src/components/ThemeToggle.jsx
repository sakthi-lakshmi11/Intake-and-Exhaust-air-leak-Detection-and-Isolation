import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full transition-all duration-300 bg-cat-gray-light dark:bg-cat-gray-dark border border-gray-300 dark:border-gray-700 hover:border-cat-yellow dark:hover:border-cat-yellow text-gray-800 dark:text-gray-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
      id="theme-toggle-btn"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 text-cat-yellow transition-transform duration-500 rotate-0 scale-100" />
        ) : (
          <Moon className="w-5 h-5 text-cat-black transition-transform duration-500 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
}
