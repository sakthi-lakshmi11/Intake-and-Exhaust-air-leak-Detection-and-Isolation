import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAnalyticsData } from '../services/adminMockData';
import { BarChart3, Download, FileText, Users, Activity, Settings, AlertTriangle, RefreshCw } from 'lucide-react';

// TODO: Replace with backend API calls
// API ENDPOINTS: /api/analytics (GET), /api/reports/generate (POST)

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function SystemReports() {
  const [analytics, setAnalytics] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState('system');
  const [reportContent, setReportContent] = useState('');

  useEffect(() => { setAnalytics(getAnalyticsData()); }, []);

  const generateReport = (type) => {
    setGenerating(true);
    setSelectedReport(type);

    setTimeout(() => {
      const date = new Date().toLocaleString();
      let content = '';

      switch (type) {
        case 'system':
          content = `CATERPILLAR DIAGNOSTIC SYSTEM REPORT
Generated: ${date}
──────────────────────────────────────────────────

SYSTEM OVERVIEW
• Total Operators: ${analytics?.totalUsers || 0}
• Active Operators: ${analytics?.activeUsers || 0}
• Total Analyses: ${analytics?.totalAnalyses || 0}
• Total Reports: ${analytics?.totalReports || 0}
• Engine Models: ${analytics?.totalEngineModels || 0}

ANALYSIS STATISTICS
• Today: ${analytics?.dailyAnalyses || 0}
• This Week: ${analytics?.weeklyAnalyses || 0}
• This Month: ${analytics?.monthlyAnalyses || 0}
• Most Common Leak: ${analytics?.mostCommonLeak || 'N/A'}

END OF REPORT`;
          break;

        case 'user':
          content = `USER ACTIVITY REPORT
Generated: ${date}
──────────────────────────────────────────────────

USER STATISTICS
• Total Operators: ${analytics?.totalUsers || 0}
• Active: ${analytics?.activeUsers || 0}
• Inactive: ${(analytics?.totalUsers || 0) - (analytics?.activeUsers || 0)}

ACTIVITY SUMMARY
• Analyses Today: ${analytics?.dailyAnalyses || 0}
• Analyses This Week: ${analytics?.weeklyAnalyses || 0}

END OF REPORT`;
          break;

        case 'analysis':
          content = `ANALYSIS STATISTICS REPORT
Generated: ${date}
──────────────────────────────────────────────────

PERFORMANCE METRICS
• Total Analyses: ${analytics?.totalAnalyses || 0}
• Most Tested Engine: ${analytics?.mostTestedEngine || 'N/A'}

LEAK DISTRIBUTION
• No Leak: ${Math.round((analytics?.totalAnalyses || 0) * 0.35)}
• Intake Leak: ${Math.round((analytics?.totalAnalyses || 0) * 0.28)}
• Exhaust Leak: ${Math.round((analytics?.totalAnalyses || 0) * 0.22)}

END OF REPORT`;
          break;

        default:
          content = 'Select a report type to generate.';
      }
      setReportContent(content);
      setGenerating(false);
    }, 1200);
  };

  const downloadReport = () => {
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${selectedReport}_report_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const reportTypes = [
    { id: 'system', label: 'System Overview', icon: BarChart3 },
    { id: 'user', label: 'User Activity', icon: Users },
    { id: 'analysis', label: 'Analysis Stats', icon: Activity },
  ];

  return (
    <AdminLayout>
      <div className="p-6" style={FONT}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">System Reports</h1>
            <p className="text-xs text-gray-500 mt-1">Generate operational reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Type Selection - White */}
          <div className="lg:col-span-1 space-y-2">
            {reportTypes.map((rt) => {
              const Icon = rt.icon;
              return (
                <button
                  key={rt.id}
                  onClick={() => generateReport(rt.id)}
                  disabled={generating}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    selectedReport === rt.id && reportContent ? 'bg-[#FFCD11]/10 border-[#FFCD11]/30' : 'bg-white border-gray-200 hover:border-[#FFCD11]/30'
                  } ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">{rt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Report Preview - White */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FFCD11]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {reportTypes.find(rt => rt.id === selectedReport)?.label || 'Report Preview'}
                </h3>
              </div>
              {reportContent && (
                <button onClick={downloadReport} className="flex items-center gap-2 px-4 py-2 bg-[#FFCD11] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              )}
            </div>
            <div className="p-6">
              {generating ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <RefreshCw className="w-8 h-8 text-[#FFCD11] animate-spin" />
                  <p className="text-sm text-gray-500">Generating report...</p>
                </div>
              ) : reportContent ? (
                <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {reportContent}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <BarChart3 className="w-12 h-12 text-gray-300" />
                  <p className="text-sm text-gray-500">Select a report type to generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}