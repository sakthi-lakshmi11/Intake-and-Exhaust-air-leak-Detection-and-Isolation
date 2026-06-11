import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAnalyticsData, getSystemStatus } from '../services/adminMockData';
import AdminLayout from '../components/AdminLayout';
import {
  Users, FileSearch, FileText, Settings, Video, HardDrive,
  TrendingUp, TrendingDown, Activity, Cpu, Clock,
  AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

function StatCard({ icon: Icon, label, value, sublabel, trend, color = 'cat-yellow', onClick }) {
  const colorMap = {
    'cat-yellow': 'bg-cat-yellow/10 border-cat-yellow/30 text-cat-yellow',
    'blue': 'bg-blue-500/10 border-blue-500/30 text-blue-500',
    'green': 'bg-green-500/10 border-green-500/30 text-green-500',
    'purple': 'bg-purple-500/10 border-purple-500/30 text-purple-500',
    'orange': 'bg-orange-500/10 border-orange-500/30 text-orange-500',
  };
  const colorClass = colorMap[color] || colorMap['cat-yellow'];

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-cat-yellow/30 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-semibold ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mt-1">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAnalytics(getAnalyticsData());
    setSystemStatus(getSystemStatus());
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
      setRefreshing(false);
    }, 800);
  };

  if (!analytics || !systemStatus) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cat-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6" style={FONT}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">
              System Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Welcome back, {currentUser?.fullName} — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">All Systems Operational</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Users"
            value={analytics.totalUsers}
            sublabel={`${analytics.activeUsers} active`}
            trend={{ isUp: true, value: '12%' }}
            color="cat-yellow"
            onClick={() => navigate('/admin/users')}
          />
          <StatCard
            icon={FileSearch}
            label="Total Analyses"
            value={analytics.totalAnalyses}
            sublabel={`${analytics.dailyAnalyses} today`}
            trend={{ isUp: analytics.dailyAnalyses > 3, value: analytics.dailyAnalyses > 3 ? '8%' : '3%' }}
            color="blue"
            onClick={() => navigate('/admin/analyses')}
          />
          <StatCard
            icon={FileText}
            label="Total Reports"
            value={analytics.totalReports}
            sublabel="Generated documents"
            color="green"
            onClick={() => navigate('/admin/reports')}
          />
          <StatCard
            icon={Settings}
            label="Engine Models"
            value={analytics.totalEngineModels}
            sublabel={`${analytics.mostTestedEngine} most tested`}
            color="purple"
            onClick={() => navigate('/admin/engines')}
          />
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Video}
            label="Total Videos"
            value={analytics.totalVideos}
            sublabel="Repair guidance library"
            color="orange"
            onClick={() => navigate('/admin/videos')}
          />
          <StatCard
            icon={HardDrive}
            label="Storage Used"
            value={`${analytics.totalStorageMB} MB`}
            sublabel="Total system storage"
          />
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Most Common Leak</p>
            <p className="text-lg font-extrabold text-gray-900">{analytics.mostCommonLeak}</p>
            <p className="text-[10px] text-gray-400 mt-1">Across all analyses</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Analysis Trends</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Daily</span>
                <span className="font-bold text-gray-900">{analytics.dailyAnalyses}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Weekly</span>
                <span className="font-bold text-gray-900">{analytics.weeklyAnalyses}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Monthly</span>
                <span className="font-bold text-gray-900">{analytics.monthlyAnalyses}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Daily Analysis Trend (30 Days)</h3>
              <Activity className="w-4 h-4 text-cat-yellow" />
            </div>
            <div className="h-48 flex items-end gap-1">
              {analytics.dailyTrend.map((day, i) => {
                const maxCount = Math.max(...analytics.dailyTrend.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                    <div
                      className="w-full bg-cat-yellow/30 hover:bg-cat-yellow/60 transition-colors rounded-t"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    {day.count > 0 && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.count}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[9px] text-gray-400">{analytics.dailyTrend[0]?.date}</span>
              <span className="text-[9px] text-gray-400">{analytics.dailyTrend[analytics.dailyTrend.length - 1]?.date}</span>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">System Status</h3>
              <Cpu className="w-4 h-4 text-cat-yellow" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className="flex items-center gap-1.5 text-green-500 font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  {systemStatus.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Uptime</span>
                <span className="text-gray-800 font-semibold">{systemStatus.uptime}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">API Latency</span>
                <span className="text-gray-800 font-semibold">{systemStatus.apiLatency}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Active Sessions</span>
                <span className="text-gray-800 font-semibold">{systemStatus.activeSessions}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">CPU</span>
                <span className="text-gray-800 font-semibold">{systemStatus.cpuUsage}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Memory</span>
                <span className="text-gray-800 font-semibold">{systemStatus.memoryUsage}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Last Backup</span>
                <span className="text-gray-800 font-semibold text-[10px]">{systemStatus.lastBackup}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-cat-yellow/30 transition-all text-left cursor-pointer"
            >
              <Users className="w-4 h-4 text-cat-yellow mb-1.5" />
              <p className="text-[11px] font-semibold text-gray-700">Manage Users</p>
            </button>
            <button
              onClick={() => navigate('/admin/analyses')}
              className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-cat-yellow/30 transition-all text-left cursor-pointer"
            >
              <FileSearch className="w-4 h-4 text-blue-500 mb-1.5" />
              <p className="text-[11px] font-semibold text-gray-700">View Analyses</p>
            </button>
            <button
              onClick={() => navigate('/admin/system-reports')}
              className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-cat-yellow/30 transition-all text-left cursor-pointer"
            >
              <FileText className="w-4 h-4 text-green-500 mb-1.5" />
              <p className="text-[11px] font-semibold text-gray-700">Generate Report</p>
            </button>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-cat-yellow/30 transition-all text-left cursor-pointer"
            >
              <Activity className="w-4 h-4 text-purple-500 mb-1.5" />
              <p className="text-[11px] font-semibold text-gray-700">Audit Logs</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}