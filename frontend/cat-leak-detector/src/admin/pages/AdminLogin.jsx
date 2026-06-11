import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Eye, EyeOff, AlertCircle, Shield, Lock, Cpu, AlertTriangle } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function AdminLogin() {
  const { adminLogin, adminLoading, currentAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lockoutWarning, setLockoutWarning] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (currentAdmin) {
      navigate('/admin/dashboard');
    }
  }, [currentAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLockoutWarning('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    const res = await adminLogin(username.trim(), password);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      if (res.locked) {
        setLockoutWarning(res.message);
      } else {
        setError(res.message);
        if (res.attemptsRemaining && res.attemptsRemaining <= 2) {
          setLockoutWarning(`Warning: ${res.attemptsRemaining} attempt(s) remaining before account lockout.`);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-cat-black to-gray-900 px-4 py-12" style={FONT}>
      {/* Loading overlay */}
      {adminLoading && (
        <div className="fixed inset-0 z-50 bg-cat-black/95 flex flex-col items-center justify-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
            <div className="absolute inset-0 rounded-full border-4 border-cat-yellow border-t-transparent animate-spin" />
            <Shield className="w-5 h-5 text-cat-yellow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-xs font-semibold uppercase tracking-widest">Authenticating...</p>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Security Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-1.5">
            <Shield className="w-3.5 h-3.5 text-cat-yellow" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Secure Admin Portal</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Yellow top bar */}
          <div className="h-1.5 w-full bg-cat-yellow" />

          <div className="px-8 pt-8 pb-8">
            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-8 gap-3">
              <div className="w-16 h-16 rounded-xl bg-cat-yellow/10 border border-cat-yellow/30 flex items-center justify-center">
                <Shield className="w-8 h-8 text-cat-yellow" />
              </div>
              <div className="text-center">
                <h1 className="text-lg font-extrabold uppercase tracking-tight text-white leading-tight">
                  Admin Management Portal
                </h1>
                <p className="mt-1 text-[11px] text-gray-400 font-normal tracking-wide">
                  Authorized Personnel Only
                </p>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Tier 3 Access Control</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-3 text-xs text-red-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Lockout Warning */}
            {lockoutWarning && (
              <div className="mb-4 flex items-start gap-2.5 bg-orange-900/30 border border-orange-800/50 rounded-xl px-4 py-3 text-xs text-orange-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{lockoutWarning}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5"
                >
                  Username or Email
                </label>
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin credentials"
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-gray-100 text-sm font-normal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50 focus:border-cat-yellow transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-gray-100 text-sm font-normal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50 focus:border-cat-yellow transition-all duration-200"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={adminLoading}
                className="w-full mt-2 bg-cat-yellow text-cat-black font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl shadow-md hover:bg-yellow-400 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {adminLoading ? 'Authenticating...' : 'Access Admin Portal'}
              </button>
            </form>

            {/* Quick Access Info */}
            <div className="mt-6 p-3 bg-gray-800/30 border border-gray-800 rounded-xl">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Quick Access</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Super Admin:</span>
                  <span className="text-gray-300 font-mono text-[10px]">admin / Admin@123456</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Quality Manager:</span>
                  <span className="text-gray-300 font-mono text-[10px]">quality_manager / Quality@123</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Engine Specialist:</span>
                  <span className="text-gray-300 font-mono text-[10px]">engine_specialist / Engine@123</span>
                </div>
              </div>
            </div>

            {/* Back to main site */}
            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-[11px] text-gray-500 hover:text-cat-yellow transition-colors"
              >
                ← Return to Operator Portal
              </a>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-gray-600">
          © 2026 Caterpillar Inc. — Admin Portal v2.0 | All access is monitored and logged.
        </p>
      </div>
    </div>
  );
}