import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getAnalyticsData, getRecentActivity, getReports } from '../services/adminMockData';
import { migrateReportIds } from '../../services/api';
import AdminLayout from '../components/AdminLayout';
import { Users, FileSearch, FileText, Activity, Clock, RefreshCw, ChevronRight, Database } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

function StatCard({ icon: Icon, label, value, onClick, highlight = false }) {
  return (
    <div onClick={onClick} className={`bg-white border border-gray-200 rounded-lg p-5 hover:border-[#FFCD11]/50 transition-all cursor-pointer group ${highlight ? 'border-l-2 border-l-[#FFCD11]' : ''}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:bg-[#FFCD11]/10 transition-colors">
          <Icon className="w-5 h-5 text-gray-600 group-hover:text-[#FFCD11]" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

function ActivityItem({ activity }) {
  const icons = { 'User Login': Users, 'Analysis Execution': FileSearch, 'Report Generated': FileText };
  const Icon = icons[activity.type] || Activity;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-900">
          <span className="font-semibold">{activity.user}</span> {activity.type === 'User Login' ? 'logged in' : activity.type === 'Analysis Execution' ? 'ran analysis' : 'generated report'}
        </p>
        <p className="text-[10px] text-gray-500 truncate">{activity.details}</p>
      </div>
      <p className="text-[10px] text-gray-400 whitespace-nowrap">{formatTime(activity.timestamp)}</p>
    </div>
  );
}

function ReportRow({ report }) {
  const getLeakColor = (prediction) => {
    if (!prediction) return 'bg-gray-100 text-gray-600';
    if (prediction.includes('No Leak')) return 'bg-green-100 text-green-700';
    if (prediction.includes('Intake')) return 'bg-orange-100 text-orange-700';
    if (prediction.includes('Exhaust')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };

  const getRiskColor = (riskLevel) => {
    if (!riskLevel) return 'bg-gray-100 text-gray-600';
    if (riskLevel === 'Critical') return 'bg-red-100 text-red-700';
    if (riskLevel === 'High') return 'bg-orange-100 text-orange-700';
    if (riskLevel === 'Medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-xs font-mono font-semibold text-gray-800">{report.id}</td>
      <td className="px-4 py-3 text-xs text-gray-700">{report.technician || '—'}</td>
      <td className="px-4 py-3 text-xs text-gray-700">{report.engineModel || '—'}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getLeakColor(report.prediction)}`}>
          {report.prediction || '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-700">{report.confidence ? `${report.confidence}%` : '—'}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getRiskColor(report.riskLevel)}`}>
          {report.riskLevel || '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">{report.timestamp ? new Date(report.timestamp).toLocaleTimeString() : '—'}</td>
    </tr>
  );
}

export default function AdminDashboard() {
  const { currentAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [migratedCount, setMigratedCount] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setAnalytics(getAnalyticsData());
    setRecentActivity(getRecentActivity());
    setRecentReports(getReports().slice(0, 8));
  };

  const handleMigrateIds = () => {
    const result = migrateReportIds();
    setMigratedCount(result.migrated);
    loadData();
  };

  const handleRefresh = () => { setRefreshing(true); loadData(); setTimeout(() => setRefreshing(false), 800); };

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#FFCD11] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6" style={FONT}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight">Diagnostics Operations</h1>
            <p className="text-xs text-gray-500 mt-1">Real-time monitoring of Caterpillar engine leak detection system</p>
          </div>
          <div className="flex items-center gap-2">
            {migratedCount > 0 && (
              <span className="text-[10px] text-green-600 font-semibold">{migratedCount} IDs migrated</span>
            )}
            <button onClick={handleMigrateIds} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" title="Migrate legacy IDs">
              <Database className="w-3.5 h-3.5" />
              Fix IDs
            </button>
            <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Total Operators" value={analytics.totalUsers} onClick={() => navigate('/admin/users')} highlight />
          <StatCard icon={Users} label="Active Operators" value={analytics.activeUsers} onClick={() => navigate('/admin/users')} />
          <StatCard icon={FileSearch} label="Total Analyses" value={analytics.totalAnalyses} onClick={() => navigate('/admin/analyses')} />
          <StatCard icon={FileText} label="Total Reports" value={analytics.totalReports} onClick={() => navigate('/admin/reports')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Recent Activity</h2>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="px-5 py-3">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No recent activity</p>
              ) : (
                recentActivity.map(act => <ActivityItem key={act.id} activity={act} />)
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Recent Reports</h2>
              <button onClick={() => navigate('/admin/reports')} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 transition-colors">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Report ID</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Operator</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Engine</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Result</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Confidence</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Risk</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-gray-500">No reports generated</td></tr>
                  ) : (
                    recentReports.map(r => <ReportRow key={r.id} report={r} />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Engine Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Most Tested Engine</p>
              <p className="text-lg font-extrabold text-gray-900 mt-1">{analytics.mostTestedEngine}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Most Common Leak</p>
              <p className="text-lg font-extrabold text-gray-900 mt-1">{analytics.mostCommonLeak}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Engine Models Tracked</p>
              <p className="text-lg font-extrabold text-gray-900 mt-1">{analytics.totalEngineModels}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}