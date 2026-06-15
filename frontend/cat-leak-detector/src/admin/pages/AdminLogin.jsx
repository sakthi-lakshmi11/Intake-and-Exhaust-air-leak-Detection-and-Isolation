import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Eye, EyeOff, AlertCircle, Shield, Lock, AlertTriangle } from 'lucide-react';
import CaterpillarLogo from '../../components/CaterpillarLogo';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function AdminLogin() {
  const { adminLogin, adminLoading, currentAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lockoutWarning, setLockoutWarning] = useState('');

  useEffect(() => {
    if (currentAdmin) navigate('/admin/dashboard');
  }, [currentAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLockoutWarning('');

    if (!username.trim() || !password) {
      setError('Enter username and password.');
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
          setLockoutWarning(`${res.attemptsRemaining} attempt(s) remaining.`);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8] px-4" style={FONT}>
      {adminLoading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#FFCD11] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <CaterpillarLogo className="h-8 text-[#111111] mx-auto mb-3" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Admin Portal</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div className="h-1 w-full bg-[#FFCD11]" />
          <div className="p-8">
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight text-center mb-6">
              Admin Login
            </h1>

            {error && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {lockoutWarning && (
              <div className="mb-4 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-600">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{lockoutWarning}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin credentials"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full py-3 bg-[#FFCD11] text-[#111111] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {adminLoading ? 'Authenticating...' : 'Access Portal'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="text-[11px] text-gray-500 hover:text-[#FFCD11]">
                ← Return to Operator Portal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}