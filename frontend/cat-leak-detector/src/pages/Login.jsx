import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Cpu } from 'lucide-react';
import CaterpillarLogo from '../components/CaterpillarLogo';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function Login() {
  const { login, loadingMsg } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    const res = await login(identifier.trim(), password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 transition-colors duration-300"
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Yellow top bar */}
          <div className="h-1 w-full bg-cat-yellow" />

          <div className="px-8 pt-8 pb-8">
            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-8 gap-3">
              <CaterpillarLogo className="h-8 text-cat-black" />
              <div className="text-center">
                <h1 className="text-[15px] font-extrabold uppercase tracking-tight text-gray-900 leading-tight">
                  Intake &amp; Exhaust Air Leak Detection
                </h1>
                <p className="mt-1 text-[11px] text-gray-400 font-normal tracking-wide">
                  Sign in to your account
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username or Email */}
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5"
                >
                  Username or Email
                </label>
                <input
                  id="login-identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-normal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50 focus:border-cat-yellow transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-normal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50 focus:border-cat-yellow transition-all duration-200"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-2 bg-cat-yellow text-cat-black font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl shadow-md hover:bg-yellow-400 hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Login
              </button>
            </form>

            {/* Sign Up link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Not registered yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-cat-black hover:text-cat-yellow transition-colors"
              >
                Sign Up
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
