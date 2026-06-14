import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  Users,
  FileSearch,
  FileText,
  Settings,
  Map,
  Video,
  Shield,
  BarChart3,
  LogOut,
  Menu,
  ChevronLeft,
  Bell,
} from 'lucide-react';
import CaterpillarLogo from '../../components/CaterpillarLogo';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Analyses', icon: FileSearch, path: '/admin/analyses' },
  { label: 'Reports', icon: FileText, path: '/admin/reports' },
  { label: 'Engines', icon: Settings, path: '/admin/engines' },
  { label: 'Leak Zones', icon: Map, path: '/admin/leak-zones' },
  { label: 'Videos', icon: Video, path: '/admin/videos' },
  { label: 'Audit Logs', icon: Shield, path: '/admin/audit-logs' },
  { label: 'System Reports', icon: BarChart3, path: '/admin/system-reports' },
];

export default function AdminLayout({ children }) {
  const { currentAdmin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-[#F5F6F8]" style={FONT}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Charcoal */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[#111111] transition-all duration-300 flex flex-col ${
          collapsed ? 'w-16' : 'w-60'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center px-4 border-b border-[#2B2B2B] ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <CaterpillarLogo className="h-5 text-[#FFCD11]" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Admin Portal</span>
            </div>
          )}
          {collapsed && <CaterpillarLogo className="h-5 text-[#FFCD11]" />}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded text-gray-400 hover:text-[#FFCD11] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                  active
                    ? 'bg-[#FFCD11]/20 text-[#FFCD11] font-semibold border-l-2 border-l-[#FFCD11]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-l-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FFCD11]' : ''}`} />
                {!collapsed && (
                  <span className="text-[11px] font-medium uppercase tracking-wider">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-[#2B2B2B] p-3">
          {!collapsed && currentAdmin && (
            <p className="text-xs font-semibold text-white truncate">{currentAdmin.fullName}</p>
          )}
          {!collapsed && currentAdmin && (
            <p className="text-[10px] text-gray-400 uppercase mt-0.5">{currentAdmin.role}</p>
          )}
          <button
            onClick={handleLogout}
            className={`w-full p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ${
              collapsed ? 'flex justify-center' : 'flex items-center justify-center gap-2'
            }`}
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!collapsed && <span className="text-[10px] font-semibold uppercase">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        collapsed ? 'lg:ml-16' : 'lg:ml-60'
      }`}>
        {/* Header - White with Yellow Accent */}
        <header className="h-16 bg-white border-b-2 border-b-[#FFCD11] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-gray-800 font-semibold">Admin</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">
              {NAV_ITEMS.find(i => isActive(i.path))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-800">{currentAdmin?.fullName}</p>
                <p className="text-[10px] text-[#FFCD11] uppercase font-semibold">{currentAdmin?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FFCD11]/20 border border-[#FFCD11]/40 flex items-center justify-center">
                <span className="text-xs font-bold text-[#FFCD11]">
                  {currentAdmin?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content - Light Gray */}
        <main className="flex-1 bg-[#F5F6F8]">
          {children}
        </main>
      </div>
    </div>
  );
}