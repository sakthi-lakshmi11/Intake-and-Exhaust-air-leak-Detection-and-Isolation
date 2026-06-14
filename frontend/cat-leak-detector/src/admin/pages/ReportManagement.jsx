import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Download, Eye, X, ChevronDown } from 'lucide-react';
import { getReports } from '../services/adminMockData';
import { generateDiagnosticPDF } from '../../services/pdfReport';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

// TODO: Replace with /api/reports for admin report management
// API ENDPOINTS: /api/reports (GET), /api/reports/:id (GET)
// TODO: Remove sequential ID generation - database will generate UUIDs

function SortHeader({ field, sortBy, sortDir, onSort, children }) {
  return (
    <th onClick={() => onSort(field)}
      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700 select-none bg-gray-50"
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

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    setReports(getReports());
  }, []);

  const filtered = reports.filter(r =>
    !search ||
    r.id?.toLowerCase().includes(search.toLowerCase()) ||
    r.technician?.toLowerCase().includes(search.toLowerCase()) ||
    r.engineModel?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortBy] || '';
    const valB = b[sortBy] || '';
    if (sortBy === 'timestamp') {
      const dateA = valA ? new Date(valA).getTime() : 0;
      const dateB = valB ? new Date(valB).getTime() : 0;
      if (dateA < dateB) return sortDir === 'asc' ? -1 : 1;
      if (dateA > dateB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    }
    if (String(valA).toLowerCase() < String(valB).toLowerCase()) return sortDir === 'asc' ? -1 : 1;
    if (String(valA).toLowerCase() > String(valB).toLowerCase()) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownload = (report) => {
    generateDiagnosticPDF(report, { fullName: report.technician });
  };

  return (
    <AdminLayout>
      <div className="p-6" style={FONT}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Diagnostic Reports</h1>
            <p className="text-xs text-gray-500 mt-1">{reports.length} Total Reports</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCD11]/50"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <SortHeader field="id" sortBy={sortBy} sortDir={sortDir} onSort={setSortBy}>Report ID</SortHeader>
                  <SortHeader field="technician" sortBy={sortBy} sortDir={sortDir} onSort={setSortBy}>Operator</SortHeader>
                  <SortHeader field="engineModel" sortBy={sortBy} sortDir={sortDir} onSort={setSortBy}>Engine</SortHeader>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Result</th>
                  <SortHeader field="confidence" sortBy={sortBy} sortDir={sortDir} onSort={setSortBy}>Confidence</SortHeader>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Risk Level</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Time</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                      {reports.length === 0 ? 'No reports generated' : 'No matches found'}
                    </td>
                  </tr>
                ) : (
                  sorted.map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-gray-800">{r.id}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{r.technician || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{r.engineModel || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          r.prediction === 'No Leak' ? 'bg-green-100 text-green-700' :
                          r.prediction?.includes('Intake') ? 'bg-orange-100 text-orange-700' :
                          r.prediction?.includes('Exhaust') ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {r.prediction || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.confidence ? `${r.confidence}%` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          r.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                          r.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                          r.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {r.riskLevel || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {r.timestamp ? new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedReport(r)}
                            className="p-1.5 rounded text-gray-500 hover:text-[#FFCD11] hover:bg-[#FFCD11]/10 transition-colors" title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDownload(r)}
                            className="p-1.5 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-100/50 transition-colors" title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-end" onClick={() => setSelectedReport(null)}>
          <div className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Report Details</h2>
              <button onClick={() => setSelectedReport(null)} className="p-1 rounded text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Report ID</p>
                  <p className="text-xs font-mono font-bold text-gray-900 mt-1">{selectedReport.id}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Analysis ID</p>
                  <p className="text-xs font-mono text-gray-600 mt-1">{selectedReport.analysisId || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Operator</p>
                  <p className="text-xs text-gray-900 mt-1">{selectedReport.technician}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Engine</p>
                  <p className="text-xs text-gray-900 mt-1">{selectedReport.engineModel}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Confidence</p>
                  <p className="text-xs text-gray-900 mt-1">{selectedReport.confidence}%</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Generated</p>
                  <p className="text-xs text-gray-900 mt-1">
                    {selectedReport.timestamp ? new Date(selectedReport.timestamp).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              {selectedReport.leakTypes && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 mb-2">Leak Types</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.leakTypes.map((lt, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-semibold uppercase">
                        {lt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}