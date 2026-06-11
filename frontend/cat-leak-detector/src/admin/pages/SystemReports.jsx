import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAnalyticsData } from '../services/adminMockData';
import { BarChart3, Download, FileText, Users, Activity, Settings, AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';

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
─────────────────────────────────────────────────

SYSTEM OVERVIEW
• Total Registered Users: ${analytics?.totalUsers || 0}
• Active Users: ${analytics?.activeUsers || 0}
• Total Analyses Performed: ${analytics?.totalAnalyses || 0}
• Total Reports Generated: ${analytics?.totalReports || 0}
• Engine Models in Database: ${analytics?.totalEngineModels || 0}
• Video Library: ${analytics?.totalVideos || 0} videos
• Total Storage Used: ${analytics?.totalStorageMB || 0} MB

ANALYSIS STATISTICS
• Daily Analyses: ${analytics?.dailyAnalyses || 0}
• Weekly Analyses: ${analytics?.weeklyAnalyses || 0}
• Monthly Analyses: ${analytics?.monthlyAnalyses || 0}
• Most Common Leak Type: ${analytics?.mostCommonLeak || 'N/A'}
• Most Tested Engine: ${analytics?.mostTestedEngine || 'N/A'}

SYSTEM STATUS
• Uptime: 99.97%
• API Latency: 42ms
• Status: All Systems Operational

END OF REPORT`;
          break;

        case 'user':
          content = `USER ACTIVITY REPORT
Generated: ${date}
─────────────────────────────────────────────────

USER STATISTICS
• Total Users: ${analytics?.totalUsers || 0}
• Active Users: ${analytics?.activeUsers || 0}
• Inactive Users: ${(analytics?.totalUsers || 0) - (analytics?.activeUsers || 0)}

ROLE DISTRIBUTION
• Administrators: 3
• Quality Managers: 1
• Engine Specialists: 1
• Operators: ${Math.max(0, (analytics?.totalUsers || 0) - 3)}

RECENT ACTIVITY
• Last 24h: ${analytics?.dailyAnalyses || 0} analyses
• Last 7 days: ${analytics?.weeklyAnalyses || 0} analyses
• Last 30 days: ${analytics?.monthlyAnalyses || 0} analyses

END OF REPORT`;
          break;

        case 'analysis':
          content = `ANALYSIS STATISTICS REPORT
Generated: ${date}
─────────────────────────────────────────────────

PERFORMANCE METRICS
• Total Analyses: ${analytics?.totalAnalyses || 0}
• Average Confidence: ${Math.round(Math.random() * 5 + 92)}%
• Average Test Duration: ${Math.round(Math.random() * 10 + 12)} minutes

LEAK DISTRIBUTION
• No Leak: ${Math.round((analytics?.totalAnalyses || 0) * 0.35)}
• Intake Leak: ${Math.round((analytics?.totalAnalyses || 0) * 0.28)}
• Exhaust Leak: ${Math.round((analytics?.totalAnalyses || 0) * 0.22)}
• Combined Leak: ${Math.round((analytics?.totalAnalyses || 0) * 0.15)}

RISK LEVEL BREAKDOWN
• Low Risk: ${Math.round((analytics?.totalAnalyses || 0) * 0.40)}
• Medium Risk: ${Math.round((analytics?.totalAnalyses || 0) * 0.30)}
• High Risk: ${Math.round((analytics?.totalAnalyses || 0) * 0.20)}
• Critical: ${Math.round((analytics?.totalAnalyses || 0) * 0.10)}

END OF REPORT`;
          break;

        case 'engine':
          content = `ENGINE USAGE REPORT
Generated: ${date}
─────────────────────────────────────────────────

ENGINE MODEL STATISTICS
• C7 Engine Analyses: ${Math.round((analytics?.totalAnalyses || 0) * 0.55)}
• C15 Engine Analyses: ${Math.round((analytics?.totalAnalyses || 0) * 0.45)}
• Most Tested Engine: ${analytics?.mostTestedEngine || 'N/A'}

ENGINE DATABASE
• Total Engine Models in Database: ${analytics?.totalEngineModels || 0}
• Versions Per Model: 4

C7 ENGINE VERSIONS
• C7 ACERT (2003–2010)
• C7 ACERT Tier 4 Interim (2011–2014)
• C7 ACERT Tier 4 Final (2014–2019)
• C7 ACERT 2020 Series (2020–Present)

C15 ENGINE VERSIONS
• C15 ACERT (2004–2007)
• C15 ACERT Tier 4 Interim (2008–2013)
• C15 ACERT Tier 4 Final (2014–2019)
• C15 ACERT 2020 Series (2020–Present)

END OF REPORT`;
          break;

        case 'leak':
          content = `LEAK STATISTICS REPORT
Generated: ${date}
─────────────────────────────────────────────────

LEAK TYPE DISTRIBUTION
• Most Common Leak: ${analytics?.mostCommonLeak || 'N/A'}
• Intake Leak Rate: ${Math.round(Math.random() * 15 + 25)}%
• Exhaust Leak Rate: ${Math.round(Math.random() * 10 + 18)}%
• Combined Leak Rate: ${Math.round(Math.random() * 8 + 8)}%

SEVERITY BREAKDOWN
• Low Risk: ${Math.round((analytics?.totalAnalyses || 0) * 0.40)}
• Medium Risk: ${Math.round((analytics?.totalAnalyses || 0) * 0.30)}
• High Risk: ${Math.round((analytics?.totalAnalyses || 0) * 0.20)}
• Critical: ${Math.round((analytics?.totalAnalyses || 0) * 0.10)}

RECOMMENDATIONS
1. Schedule preventive maintenance for intake systems
2. Review exhaust manifold torque specifications
3. Update turbocharger inspection protocols
4. Implement weekly pressure drop tests

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
    { id: 'system', label: 'Overall System Report', icon: BarChart3, color: 'text-cat-yellow' },
    { id: 'user', label: 'User Activity Report', icon: Users, color: 'text-blue-500' },
    { id: 'analysis', label: 'Analysis Statistics Report', icon: Activity, color: 'text-green-500' },
    { id: 'engine', label: 'Engine Usage Report', icon: Settings, color: 'text-purple-500' },
    { id: 'leak', label: 'Leak Statistics Report', icon: AlertTriangle, color: 'text-orange-500' },
  ];

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6" style={FONT}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">System Reports</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generate comprehensive system reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Type Selection */}
          <div className="lg:col-span-1 space-y-2">
            {reportTypes.map((rt) => {
              const Icon = rt.icon;
              return (
                <button
                  key={rt.id}
                  onClick={() => generateReport(rt.id)}
                  disabled={generating}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                    selectedReport === rt.id && reportContent
                      ? 'bg-cat-yellow/10 border-cat-yellow/30'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-cat-yellow/30'
                  } ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className={`w-5 h-5 ${rt.color}`} />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{rt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Report Preview */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cat-yellow" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {reportTypes.find(rt => rt.id === selectedReport)?.label || 'Report Preview'}
                </h3>
              </div>
              {reportContent && (
                <button onClick={downloadReport} className="flex items-center gap-2 px-4 py-2 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              )}
            </div>
            <div className="p-6">
              {generating ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <RefreshCw className="w-8 h-8 text-cat-yellow animate-spin" />
                  <p className="text-sm text-gray-500">Generating report...</p>
                </div>
              ) : reportContent ? (
                <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  {reportContent}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500">Select a report type from the left to generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}