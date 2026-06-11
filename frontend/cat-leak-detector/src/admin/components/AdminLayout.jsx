import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  X,
  ChevronDown,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import CaterpillarLogo from '../../components/CaterpillarLogo';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', icon: Users, path: '/admin/users' },
      { label: 'Analyses', icon: FileSearch, path: '/admin/analyses' },
      { label: 'Reports', icon: FileText, path: '/admin/reports' },
      { label: 'Engines', icon: Settings, path: '/admin/engines' },
      { label: 'Leak Zones', icon: Map, path: '/admin/leak-zones' },
      { label: 'Videos', icon: Video, path: '/admin/videos' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { label: 'Audit Logs', icon: Shield, path: '/admin/audit-logs' },
      { label: 'System Reports', icon: BarChart3, path: '/admin/system-reports' },
    ],
  },
];

export default function AdminLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-gray-50" style={FONT}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm ${
          collapsed ? 'w-16' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo area */}
        <div className={`h-16 flex items-center border-b border-gray-100 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <CaterpillarLogo className="h-6 text-cat-black" />
              <div>
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider leading-tight">Admin Portal</p>
                <p className="text-[7px] text-gray-400 uppercase tracking-widest">Management Console</p>
              </div>
            </div>
          )}
          {collapsed && (
            <CaterpillarLogo className="h-6 text-cat-black" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-gray-300 hover:text-gray-500 transition-colors cursor-pointer ${collapsed ? 'hidden' : 'block'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              {!collapsed && (
                <p className="px-3 mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group ${
                      active
                        ? 'bg-cat-yellow/10 text-cat-black border-l-2 border-l-cat-yellow font-semibold'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-2 border-l-transparent'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-cat-yellow' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {!collapsed && (
                      <span className="text-[11px] font-medium uppercase tracking-wider">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="border-t border-gray-100 p-3">
          {!collapsed && currentUser && (
            <div className="mb-3 px-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{currentUser.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{currentUser.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer ${
              collapsed ? 'flex justify-center' : 'flex items-center justify-center gap-2'
            }`}
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!collapsed && <span className="text-[10px] font-semibold uppercase">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span className="text-gray-500">Admin</span>
              <ChevronDown className="w-2.5 h-2.5 -rotate-90" />
              <span className="text-gray-800 font-semibold">
                {NAV_SECTIONS.flatMap(s => s.items).find(i => isActive(i.path))?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification placeholder */}
            <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* User badge */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="hidden sm:block text-right">
                <p className="text-[11px] font-semibold text-gray-800">{currentUser?.fullName}</p>
                <p className="text-[9px] text-cat-yellow uppercase tracking-wider font-semibold">{currentUser?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-cat-yellow/20 border border-cat-yellow/40 flex items-center justify-center">
                <span className="text-xs font-bold text-cat-yellow">
                  {currentUser?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}