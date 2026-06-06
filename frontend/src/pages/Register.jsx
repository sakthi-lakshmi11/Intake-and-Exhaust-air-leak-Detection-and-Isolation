import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordStrength from '../components/PasswordStrength';
import { Eye, EyeOff, AlertCircle, Cpu } from 'lucide-react';
import CaterpillarLogo from '../components/CaterpillarLogo';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function Register() {
  const { initiateRegister, loadingMsg } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const res = await initiateRegister({ fullName, username, email, password });
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-cat-dark px-4 py-12 transition-colors duration-300"
      style={FONT}
    >
      {/* Loading overlay */}
      {loadingMsg && (
        <div className="fixed inset-0 z-50 bg-cat-black/95 flex flex-col items-center justify-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
            <div className="absolute inset-0 rounded-full border-4 border-cat-yellow border-t-transparent animate-spin" />
            <Cpu className="w-5 h-5 text-cat-yellow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-xs font-semibold uppercase tracking-widest">{loadingMsg}</p>
        </div>
      )}

      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white dark:bg-cat-charcoal rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Yellow top bar */}
          <div className="h-1 w-full bg-cat-yellow" />

          <div className="px-8 pt-8 pb-8">
            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-7 gap-3">
              <CaterpillarLogo className="h-8 text-cat-black dark:text-white" />
              <div className="text-center">
                <h1 className="text-[15px] font-extrabold uppercase tracking-tight text-gray-900 dark:text-white leading-tight">
                  Create Account
                </h1>
                <p className="mt-1 text-[11px] text-gray-400 font-normal tracking-wide">
                  Intake &amp; Exhaust Air Leak Detection
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="reg-fullname"
                  className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white text-sm font-normal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50 focus:border-cat-yellow transition-all duration-200"
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="reg-username"
                  className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5"
                >
                  Username
                </label>
                <input
                  id="reg-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white text-sm font-normal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50 focus:border-cat-yellow transition-all duration-200"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white text-sm font-normal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50 focus:border-cat-yellow transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white text-sm font-normal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50 focus:border-cat-yellow transition-all duration-200"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && <PasswordStrength password={password} />}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="reg-confirm"
                  className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-4 pr-11 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white text-sm font-normal placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-400 focus:ring-red-300/50 focus:border-red-400'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-cat-yellow/50 focus:border-cat-yellow'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-[11px] text-red-500">Passwords do not match.</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-2 bg-cat-yellow text-cat-black font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl shadow-md hover:bg-yellow-400 hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Create Account
              </button>
            </form>

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-cat-black dark:text-white hover:text-cat-yellow dark:hover:text-cat-yellow transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-gray-400">
          © 2025 Caterpillar Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
