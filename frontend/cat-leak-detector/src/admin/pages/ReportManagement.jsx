import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getReports } from '../services/adminMockData';
import { FileText, Search, Download, Filter, ChevronDown, Eye, Clock, User, Calendar } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [filterPrediction, setFilterPrediction] = useState('All');
  const [filterEngine, setFilterEngine] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  useEffect(() => { setReports(getReports()); }, []);

  const filtered = reports.filter(r => {
    const matchSearch = !search ||
      r.id?.toLowerCase().includes(search.toLowerCase()) ||
      r.technician?.toLowerCase().includes(search.toLowerCase()) ||
      r.engineModel?.toLowerCase().includes(search.toLowerCase());
    const matchPred = filterPrediction === 'All' || r.prediction === filterPrediction;
    const matchEngine = filterEngine === 'All' || r.engineModel === filterEngine;
    let matchDate = true;
    if (dateFrom && r.timestamp) matchDate = matchDate && new Date(r.timestamp) >= new Date(dateFrom);
    if (dateTo && r.timestamp) matchDate = matchDate && new Date(r.timestamp) <= new Date(dateTo + 'T23:59:59');
    return matchSearch && matchPred && matchEngine && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  const downloadReport = (report) => {
    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${report.id}_report.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (prediction) => {
    const colors = {
      'No Leak': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Intake Leak': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Exhaust Leak': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'Combined Leak': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[prediction] || 'bg-gray-100 text-gray-700';
  };

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6" style={FONT}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">Report Management</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{reports.length} total reports</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search reports..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <select value={filterPrediction} onChange={e => { setFilterPrediction(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                <option value="All">All Diagnoses</option>
                <option value="No Leak">No Leak</option>
                <option value="Intake Leak">Intake Leak</option>
                <option value="Exhaust Leak">Exhaust Leak</option>
                <option value="Combined Leak">Combined Leak</option>
              </select>
              <select value={filterEngine} onChange={e => { setFilterEngine(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50">
                <option value="All">All Engines</option>
                <option value="C7">C7</option>
                <option value="C15">C15</option>
              </select>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
              <span className="text-xs text-gray-400">to</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cat-yellow/50" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Report ID</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Engine</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Diagnosis</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Confidence</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Timestamp</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">No reports found</td></tr>
                ) : paginated.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white font-mono">{r.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{r.technician}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{r.engineModel || 'C7'}</span>
                      {r.engineVersionLabel && <span className="text-[10px] text-gray-400 ml-1">{r.engineVersionLabel}</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadge(r.prediction)}`}>{r.prediction}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">{r.confidence}%</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {r.timestamp}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => downloadReport(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500">Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, sorted.length)} of {sorted.length}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${currentPage === i + 1 ? 'bg-cat-yellow text-cat-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{i + 1}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}