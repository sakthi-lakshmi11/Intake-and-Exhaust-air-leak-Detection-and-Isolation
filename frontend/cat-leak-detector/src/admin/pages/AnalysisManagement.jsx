import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, ChevronDown, Eye, X } from 'lucide-react';
import { getAnalyses } from '../services/adminMockData';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

// TODO: Replace with /api/analyses for admin analysis management
// API ENDPOINTS: /api/analyses (GET), /api/reports (GET)

function SortHeader({ field, sortBy, sortDir, onSort, children }) {
  return (
    <th onClick={() => onSort(field)}
      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700 select-none"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === field && (
          <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
        )}
      </div>
    </th>
  );
}

export default function AnalysisManagement() {
  const [analyses, setAnalyses] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    const data = getAnalyses();
    setAnalyses(data);
  }, []);

  const filtered = analyses.filter(a =>
    !search ||
    a.id?.toLowerCase().includes(search.toLowerCase()) ||
    a.technician?.toLowerCase().includes(search.toLowerCase()) ||
    a.engineModel?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortBy] || '';
    const valB = b[sortBy] || '';
    if (String(valA).toLowerCase() < String(valB).toLowerCase()) return sortDir === 'asc' ? -1 : 1;
    if (String(valA).toLowerCase() > String(valB).toLowerCase()) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <AdminLayout>
      <div className="p-6" style={FONT}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Analysis Records</h1>
            <p className="text-xs text-gray-500 mt-1">{analyses.length} Total Analyses</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search analyses..."
              className="w-full max-w-md pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortHeader field="id" sortBy={sortBy} sortDir={sortDir} onSort={(f) => setSortBy(f) || setSortDir('asc')}>Analysis ID</SortHeader>
                  <SortHeader field="reportId" sortBy={sortBy} sortDir={sortDir} onSort={setSortBy}>Report ID</SortHeader>
                  <SortHeader field="technician" sortBy={sortBy} sortDir={sortDir} onSort={setSortBy}>Operator</SortHeader>
                  <SortHeader field="engineModel" sortBy={sortBy} sortDir={sortDir} onSort={setSortBy}>Engine Model</SortHeader>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Result</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Confidence</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Risk Level</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                      {analyses.length === 0 ? 'No analyses recorded' : 'No matches found'}
                    </td>
                  </tr>
                ) : (
                  sorted.map((a, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-gray-800">{a.id}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">{a.reportId}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{a.technician}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{a.engineModel}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          a.result === 'No Leak' ? 'bg-green-100 text-green-700' :
                          a.result?.includes('Intake') ? 'bg-orange-100 text-orange-700' :
                          a.result?.includes('Exhaust') ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {a.result || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{a.confidence ? `${a.confidence}%` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          a.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                          a.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                          a.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {a.riskLevel || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelectedAnalysis(a)}
                          className="p-1.5 rounded text-gray-500 hover:text-[#FFCD11] hover:bg-[#FFCD11]/10 transition-colors" title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-end" onClick={() => setSelectedAnalysis(null)}>
          <div className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Analysis Details</h2>
              <button onClick={() => setSelectedAnalysis(null)} className="p-1 rounded text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Analysis ID</p>
                  <p className="text-xs font-mono font-bold text-gray-900 mt-1">{selectedAnalysis.id}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Report ID</p>
                  <p className="text-xs text-gray-900 mt-1">{selectedAnalysis.reportId}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Operator</p>
                  <p className="text-xs text-gray-900 mt-1">{selectedAnalysis.technician}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Engine</p>
                  <p className="text-xs text-gray-900 mt-1">{selectedAnalysis.engineModel}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Confidence</p>
                  <p className="text-xs text-gray-900 mt-1">{selectedAnalysis.confidence}%</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Date</p>
                  <p className="text-xs text-gray-900 mt-1">
                    {selectedAnalysis.timestamp ? new Date(selectedAnalysis.timestamp).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              {selectedAnalysis.leaksDetected && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 mb-2">Detections</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.leaksDetected.split(',').map((leak, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-semibold uppercase">
                        {leak.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnalysis.notes && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 mb-2">Notes</p>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">{selectedAnalysis.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}