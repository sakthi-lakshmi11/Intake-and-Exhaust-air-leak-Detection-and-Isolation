import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  User, Mail, Briefcase, ShieldCheck, Calendar, AtSign,
  Phone, FileText, Activity, Edit3, KeyRound,
  Save, X, Eye, EyeOff, CheckCircle2, AlertCircle,
} from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };
const OPERATOR_USERS_KEY = 'cat_mock_users';

const formatLastLogin = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
};

const normalizeText = (value) => String(value || '').trim();

/* ─────────────────────────── Password strength ─────────────────────────── */
function StrengthBar({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6)           score++;
  if (password.length >= 10)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const level  = score >= 4 ? 'Strong' : score >= 2 ? 'Medium' : 'Weak';
  const color  = score >= 4 ? 'bg-green-500' : score >= 2 ? 'bg-yellow-400' : 'bg-red-500';
  const bars   = score >= 4 ? 3 : score >= 2 ? 2 : 1;
  const text   = score >= 4 ? 'text-green-600' : score >= 2 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-[11px] font-semibold mb-1">
        <span className="text-gray-400">Password Strength</span>
        <span className={text}>{level}</span>
      </div>
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3].map((b) => (
          <div key={b} className={`flex-1 rounded-full transition-all duration-300 ${b <= bars ? color : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Toast notification ────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === 'success';
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-semibold animate-fade-in
      ${isSuccess ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      {isSuccess
        ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
      {message}
    </div>
  );
}

/* ══════════════════════════ MAIN PROFILE PAGE ══════════════════════════════ */
export default function Profile() {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);      // { message, type }
  const [activeTab, setActiveTab] = useState('view');  // 'view' | 'edit' | 'password'

  /* ── fetch reports for stats ── */
  useEffect(() => {
    let mounted = true;
    api.getReports()
      .then((data) => { if (mounted) setReports(Array.isArray(data) ? data : []); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  /* ── resolve stored user from localStorage for phone / department ── */
  const storedUser = useMemo(() => {
    try {
      const users = JSON.parse(localStorage.getItem(OPERATOR_USERS_KEY) || '[]');
      return users.find(
        (u) =>
          normalizeText(u.username) === normalizeText(currentUser?.username) ||
          normalizeText(u.email)    === normalizeText(currentUser?.email)
      ) || {};
    } catch { return {}; }
  }, [currentUser]);

  const profile = useMemo(() => ({
    fullName:   currentUser?.fullName   || storedUser?.fullName   || 'Operator',
    role:       currentUser?.role       || storedUser?.role       || 'Operator',
    email:      currentUser?.email      || storedUser?.email      || '',
    username:   currentUser?.username   || storedUser?.username   || '',
    phone:      currentUser?.phone      || storedUser?.phone      || '',
    department: currentUser?.department || storedUser?.department || '',
    status:     storedUser?.status      || 'Active',
    lastLogin:  storedUser?.lastActivity || currentUser?.lastActivity || '',
  }), [currentUser, storedUser]);

  /* ── stats ── */
  const stats = useMemo(() => {
    const fullName = normalizeText(profile.fullName);
    const username = normalizeText(profile.username);
    const userReports = reports.filter((r) => {
      const tech = normalizeText(r.technician || r.operator || r.operatorName);
      return tech === fullName || tech === username;
    });
    return {
      reportsGenerated:  userReports.length,
      analysesCompleted: userReports.length,
    };
  }, [reports, profile]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-cat-black" style={FONT}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="h-1 w-full bg-cat-yellow" />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">

        {/* ── Page header ── */}
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cat-yellow">User Profile</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            Intake and Exhaust Air Leak Detection and Isolation
          </h1>
        </div>

        {/* ── Avatar card ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-cat-yellow border-4 border-cat-black flex items-center justify-center">
              <User className="w-10 h-10 text-cat-black" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{profile.fullName}</h2>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 mt-1">{profile.role}</p>
            </div>
          </div>
        </div>

        {/* ── Tab buttons ── */}
        <div className="flex gap-3 flex-wrap">
          <TabBtn
            icon={<Edit3 className="w-4 h-4" />}
            label="Edit Profile"
            active={activeTab === 'edit'}
            onClick={() => setActiveTab(activeTab === 'edit' ? 'view' : 'edit')}
          />
          <TabBtn
            icon={<KeyRound className="w-4 h-4" />}
            label="Change Password"
            active={activeTab === 'password'}
            onClick={() => setActiveTab(activeTab === 'password' ? 'view' : 'password')}
          />
        </div>

        {/* ── Edit Profile form ── */}
        {activeTab === 'edit' && (
          <EditProfileForm
            profile={profile}
            updateUser={updateUser}
            showToast={showToast}
            onClose={() => setActiveTab('view')}
          />
        )}

        {/* ── Change Password form ── */}
        {activeTab === 'password' && (
          <ChangePasswordForm
            updateUser={updateUser}
            showToast={showToast}
            onClose={() => setActiveTab('view')}
          />
        )}

        {/* ── Info grid (always visible) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoCard icon={<User className="w-4 h-4" />}    label="Name"       value={profile.fullName} />
          <InfoCard icon={<Briefcase className="w-4 h-4" />} label="Role"     value={profile.role} />
          <InfoCard icon={<ShieldCheck className="w-4 h-4" />} label="Status" value={profile.status} tone="active" />
          <InfoCard icon={<Mail className="w-4 h-4" />}    label="Email"      value={profile.email || '—'} href={profile.email ? `mailto:${profile.email}` : undefined} />
          <InfoCard icon={<Phone className="w-4 h-4" />}   label="Phone"      value={profile.phone || '—'} />

          <InfoCard icon={<AtSign className="w-4 h-4" />}  label="Username"   value={profile.username || '—'} />
          <InfoCard icon={<Calendar className="w-4 h-4" />} label="Last Login" value={formatLastLogin(profile.lastLogin)} />
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatCard icon={<FileText className="w-5 h-5" />} label="Reports Generated"  value={loading ? '—' : stats.reportsGenerated} />
          <StatCard icon={<Activity className="w-5 h-5" />} label="Analyses Completed" value={loading ? '—' : stats.analysesCompleted} />
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════ EDIT PROFILE FORM ═══════════════════════════════ */
function EditProfileForm({ profile, updateUser, showToast, onClose }) {
  const [form, setForm] = useState({
    fullName: profile.fullName || '',
    email:    profile.email    || '',
    phone:    profile.phone    || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim())                         errs.fullName = 'Name is required.';
    if (!form.email.trim())                            errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))        errs.email = 'Enter a valid email address.';
    if (form.phone && !/^[\d\s+\-().]{7,15}$/.test(form.phone))
      errs.phone = 'Enter a valid phone number.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // brief async feel

    const result = updateUser({
      fullName: form.fullName.trim(),
      email:    form.email.trim(),
      phone:    form.phone.trim(),
    });

    setSaving(false);

    if (result?.success === false) {
      showToast(result.message || 'Failed to save changes.', 'error');
    } else {
      showToast('Profile updated successfully!', 'success');
      onClose();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-extrabold uppercase tracking-wide text-gray-900">Edit Profile</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField
          id="fullName" label="Full Name" required
          value={form.fullName} error={errors.fullName}
          onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
          placeholder="Your full name"
        />
        <FormField
          id="email" label="Email Address" required type="email"
          value={form.email} error={errors.email}
          onChange={(v) => setForm((p) => ({ ...p, email: v }))}
          placeholder="you@example.com"
        />
        <FormField
          id="phone" label="Phone Number"
          value={form.phone} error={errors.phone}
          onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
          placeholder="+91 99999 00000"
        />

      </div>

      <div className="flex gap-3 pt-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-cat-yellow text-cat-black px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-yellow-400 transition-all shadow-sm disabled:opacity-60 cursor-pointer active:scale-[0.98]"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════ CHANGE PASSWORD FORM ════════════════════════════ */
function ChangePasswordForm({ updateUser, showToast, onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });

  const toggle = (field) => setShow((p) => ({ ...p, [field]: !p[field] }));

  const validate = () => {
    const errs = {};
    if (!form.currentPassword)                           errs.currentPassword = 'Current password is required.';
    if (!form.newPassword)                               errs.newPassword = 'New password is required.';
    else if (form.newPassword.length < 6)                errs.newPassword = 'Password must be at least 6 characters.';
    if (!form.confirmPassword)                           errs.confirmPassword = 'Please confirm your new password.';
    else if (form.newPassword !== form.confirmPassword)  errs.confirmPassword = 'Passwords do not match.';
    if (form.currentPassword && form.currentPassword === form.newPassword)
      errs.newPassword = 'New password must be different from current password.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = updateUser({
      currentPassword: form.currentPassword,
      newPassword:     form.newPassword,
      confirmPassword: form.confirmPassword,
    });

    setSaving(false);

    if (result?.success === false) {
      showToast(result.message || 'Failed to change password.', 'error');
      if (result.message?.toLowerCase().includes('current password')) {
        setErrors({ currentPassword: result.message });
      }
    } else {
      showToast('Password changed successfully!', 'success');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-extrabold uppercase tracking-wide text-gray-900">Change Password</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current password */}
      <PasswordField
        id="currentPassword" label="Current Password" required
        value={form.currentPassword} error={errors.currentPassword}
        show={show.current} onToggle={() => toggle('current')}
        onChange={(v) => { setForm((p) => ({ ...p, currentPassword: v })); setErrors((p) => ({ ...p, currentPassword: '' })); }}
        placeholder="Enter current password"
      />

      {/* New password */}
      <div>
        <PasswordField
          id="newPassword" label="New Password" required
          value={form.newPassword} error={errors.newPassword}
          show={show.newPass} onToggle={() => toggle('newPass')}
          onChange={(v) => { setForm((p) => ({ ...p, newPassword: v })); setErrors((p) => ({ ...p, newPassword: '' })); }}
          placeholder="Enter new password"
        />
        <StrengthBar password={form.newPassword} />
      </div>

      {/* Confirm password */}
      <PasswordField
        id="confirmPassword" label="Confirm New Password" required
        value={form.confirmPassword} error={errors.confirmPassword}
        show={show.confirm} onToggle={() => toggle('confirm')}
        onChange={(v) => { setForm((p) => ({ ...p, confirmPassword: v })); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
        placeholder="Re-enter new password"
      />

      <div className="flex gap-3 pt-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-cat-yellow text-cat-black px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-yellow-400 transition-all shadow-sm disabled:opacity-60 cursor-pointer active:scale-[0.98]"
        >
          <KeyRound className="w-4 h-4" />
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════ SMALL HELPERS ═══════════════════════════════════ */
function TabBtn({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wide shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]
        ${active
          ? 'bg-cat-black text-cat-yellow ring-2 ring-cat-yellow/40'
          : 'bg-cat-yellow text-cat-black hover:bg-yellow-400 hover:shadow-md'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function FormField({ id, label, value, onChange, error, placeholder, type = 'text', required }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label} {required && <span className="text-cat-yellow">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 text-sm rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150
          ${error
            ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
            : 'border-gray-300 hover:border-gray-400 focus:ring-cat-yellow/40 focus:border-cat-yellow'}`}
      />
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, error, placeholder, required, show, onToggle }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label} {required && <span className="text-cat-yellow">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-11 text-sm rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150
            ${error
              ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-300 hover:border-gray-400 focus:ring-cat-yellow/40 focus:border-cat-yellow'}`}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function InfoCard({ icon, label, value, href, tone }) {
  const content = (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
        {icon}{label}
      </div>
      <div className={`text-base sm:text-lg font-extrabold leading-tight break-words ${tone === 'active' ? 'text-green-700' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );

  if (href) {
    return <a href={href} className="block hover:border-cat-yellow transition-colors">{content}</a>;
  }
  return content;
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</div>
        <div className="text-cat-yellow">{icon}</div>
      </div>
      <div className="text-4xl font-extrabold text-gray-900 tracking-tight">{value}</div>
      <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-cat-yellow rounded-full" style={{ width: `${Math.min(Number(value) || 0, 100)}%` }} />
      </div>
    </div>
  );
}
