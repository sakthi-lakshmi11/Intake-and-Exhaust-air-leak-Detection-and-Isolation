import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAnalyses, refreshAnalyses } from '../services/adminMockData';
import {
  FileSearch, Search, Download, RefreshCw, ChevronDown, Filter,
  AlertTriangle, CheckCircle, XCircle, FileText, Clock, Eye
} from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const riskColors = {
  'Low': 'bg-green-100 text-green-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'High': 'bg-orange-100 text-orange-700',
  'Critical': 'bg-red-100 text-red-700',
};

const statusIcons = {
  'No Leak': { icon: CheckCircle, color: 'text-green-500' },
  'Intake Leak': { icon: AlertTriangle, color: 'text-yellow-500' },
  'Exhaust Leak': { icon: AlertTriangle, color: 'text-orange-500' },
  'Combined Leak': { icon: XCircle, color: 'text-red-500' },
};

export default function AnalysisManagement() {
  const [analyses, setAnalyses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterLeak, setFilterLeak] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterEngine, setFilterEngine] = useState('All');
  const [sortBy, setSortBy] = useState('analysisDate');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const perPage = 15;

  useEffect(() => { setAnalyses(getAnalyses()); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setAnalyses(refreshAnalyses());
      setRefreshing(false);
    }, 800);
  };

  const filtered = analyses.filter(a => {
    const matchSearch = !search ||
      a.analysisId?.toLowerCase().includes(search.toLowerCase()) ||
      a.userName?.toLowerCase().includes(search.toLowerCase()) ||
      a.engineModel?.toLowerCase().includes(search.toLowerCase());
    const matchLeak = filterLeak === 'All' || a.leakStatus === filterLeak;
    const matchRisk = filterRisk === 'All' || a.riskLevel === filterRisk;
    const matchEngine = filterEngine === 'All' || a.engineModel === filterEngine;
    return matchSearch && matchLeak && matchRisk && matchEngine;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy] || '', valB = b[sortBy] || '';
    if (sortBy === 'confidence') { valA = parseFloat(valA); valB = parseFloat(valB); }
    if (sortBy === 'analysisDate') { valA = new Date(valA).getTime(); valB = new Date(valB).getTime(); }
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    return valA < valB ? (sortDir === 'asc' ? -1 : 1) : valA > valB ? (sortDir === 'asc' ? 1 : -1) : 0;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const exportCSV = () => {
    const headers = ['Analysis ID', 'User', 'Engine Model', 'Engine Version', 'Leak Status', 'Risk Level', 'Confidence', 'Date', 'Duration (min)', 'Report ID'];
    const rows = sorted.map(a => [a.analysisId, a.userName, a.engineModel, a.engineVersion, a.leakStatus, a.riskLevel, a.confidence, a.analysisDateTime, a.durationMinutes, a.reportId || '—']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `analyses_export_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({ field, children }) => (
    <th onClick={() => handleSort(field)} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700 select-none">
      <div className="flex items-center gap-1">
        {children}
        {sortBy === field && <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} />}
      </div>
    </th>
  );

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6" style={FONT}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Analysis Management</h1>
            <p className="text-xs text-gray-500 mt-1">{analyses.length} total analyses</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by ID, user, engine..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <select value={filterLeak} onChange={e => { setFilterLeak(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                <option value="All">All Leak Status</option>
                <option value="No Leak">No Leak</option>
                <option value="Intake Leak">Intake Leak</option>
                <option value="Exhaust Leak">Exhaust Leak</option>
                <option value="Combined Leak">Combined Leak</option>
              </select>
              <select value={filterRisk} onChange={e => { setFilterRisk(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                <option value="All">All Risk Levels</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <select value={filterEngine} onChange={e => { setFilterEngine(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                <option value="All">All Engines</option>
                <option value="C7">C7</option>
                <option value="C15">C15</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortHeader field="analysisId">Analysis ID</SortHeader>
                  <SortHeader field="userName">User</SortHeader>
                  <SortHeader field="engineModel">Engine</SortHeader>
                  <SortHeader field="engineVersion">Version</SortHeader>
                  <SortHeader field="leakStatus">Leak Status</SortHeader>
                  <SortHeader field="riskLevel">Risk Level</SortHeader>
                  <SortHeader field="confidence">Confidence</SortHeader>
                  <SortHeader field="analysisDate">Date</SortHeader>
                  <SortHeader field="durationMinutes">Duration</SortHeader>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-500">No analyses found</td></tr>
                ) : paginated.map((a, i) => {
                  const StatusIcon = statusIcons[a.leakStatus]?.icon || CheckCircle;
                  const statusColor = statusIcons[a.leakStatus]?.color || 'text-green-500';
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-gray-900 font-mono">{a.analysisId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{a.userName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">{a.engineModel}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{a.engineVersion}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${statusColor}`}>
                          <StatusIcon className="w-3 h-3" /> {a.leakStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${riskColors[a.riskLevel] || 'bg-gray-100 text-gray-700'}`}>{a.riskLevel}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{a.confidence}%</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{a.analysisDateTime}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{a.durationMinutes} min</td>
                      <td className="px-4 py-3">
                        {a.hasReport ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <FileText className="w-3 h-3" /> {a.reportId}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, sorted.length)} of {sorted.length}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${currentPage === i + 1 ? 'bg-cat-yellow text-cat-black' : 'text-gray-500 hover:bg-gray-100'}`}>{i + 1}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}