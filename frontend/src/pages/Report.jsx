import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import CaterpillarLogo from '../components/CaterpillarLogo';
import { Printer, Download, Plus, ChevronRight, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export default function Report() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports().then((reps) => {
      setReports(reps);
      if (reps.length > 0) {
        setSelectedReport(reps[0]);
      }
      setLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Simulated PDF generator
    alert('Simulating PDF Compilation...\nEncrypting report metadata...\nReport PDF compiled and saved successfully to Downloads directory.');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-cat-dark transition-colors duration-300 print:bg-white text-left" id="reports-page-wrapper">
      <div className="max-w-7xl mx-auto space-y-8 print:space-y-0">
        
        {/* Page Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 print:hidden">
          <div>
            <span className="text-[10px] font-mono font-extrabold text-cat-yellow uppercase tracking-widest">{t('reports')}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-gray-900 dark:text-white uppercase tracking-tight mt-1">
              INTAKE AND EXHAUST AIR LEAK DETECTION
            </h1>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 bg-cat-yellow text-cat-black font-mono font-bold text-xs uppercase px-4 py-2 hover:bg-cat-black hover:text-white dark:hover:bg-white dark:hover:text-cat-black transition-all cursor-pointer shadow active:scale-95"
            id="new-analysis-report-btn"
          >
            <Plus className="w-4 h-4" />
            {t('newAnalysis')}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 print:hidden text-gray-500">
            <span>Loading Reports History...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:grid-cols-1 print:gap-0">
            
            {/* Left Side: Reports List (Hidden in Print) */}
            <div className="lg:col-span-4 bg-white dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm print:hidden">
              <div className="bg-cat-black p-4 border-b border-gray-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">TEST RUN LOGS</span>
                <FileSpreadsheet className="w-4 h-4 text-cat-yellow" />
              </div>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-800/60 max-h-[600px] overflow-y-auto">
                {reports.map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-cat-dark/40 transition-colors flex items-center justify-between cursor-pointer ${
                      selectedReport?.id === rep.id ? 'bg-cat-gray-light/60 dark:bg-cat-gray-dark/40 border-r-4 border-r-cat-yellow' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-mono font-bold text-gray-900 dark:text-white tracking-wide">{rep.id}</div>
                      <div className="text-[10px] text-gray-400 font-mono tracking-wider">{rep.timestamp}</div>
                      <div className="text-xs font-sans font-medium text-gray-500 dark:text-gray-400">
                        Class: <span className="text-cat-yellow font-bold">{t(rep.prediction.replace(' ', '').toLowerCase() || 'noleak')}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side: Active Printable Report (Styled sheet) */}
            <div className="lg:col-span-8 bg-white dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg p-6 sm:p-8 print:border-none print:shadow-none print:p-0 print:m-0 relative">
              {selectedReport ? (
                <div id="printable-report-sheet">
                  {/* Top CAT Brand Skewed Header */}
                  <div className="flex justify-between items-start border-b-2 border-cat-yellow pb-4 mb-6">
                    <div className="flex items-center gap-4">
                      <CaterpillarLogo className="h-8 text-cat-black dark:text-white" />
                      <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                        <div className="text-[11px] font-mono font-extrabold text-gray-900 dark:text-white uppercase tracking-[0.15em]">{t('systemDiagnosticLog')}</div>
                        <div className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em] font-bold mt-0.5">CATERPILLAR HEAVY ENGINE DIVISION</div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs text-gray-500 dark:text-gray-400">
                      <div>REPORT ID: <span className="font-bold text-gray-900 dark:text-white">{selectedReport.id}</span></div>
                      <div className="mt-0.5">DATE: <span>{selectedReport.timestamp}</span></div>
                    </div>
                  </div>

                  {/* Sections list */}
                  <div className="space-y-6">
                    {/* User and Engine basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono bg-gray-50 dark:bg-cat-dark/40 p-4 border border-gray-200 dark:border-gray-800 rounded">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-widest font-extrabold mb-0.5">Technician</span>
                        <span className="font-bold text-gray-800 dark:text-white">{selectedReport.technician}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-widest font-extrabold mb-0.5">Role</span>
                        <span className="font-bold text-gray-800 dark:text-white">{t(selectedReport.role.toLowerCase() || 'operator')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-widest font-extrabold mb-0.5">Branch</span>
                        <span className="font-bold text-gray-800 dark:text-white">{selectedReport.branch}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-widest font-extrabold mb-0.5">Status</span>
                        <span className={`font-bold ${selectedReport.status === 'GO' ? 'text-brand-success' : 'text-brand-critical'}`}>{selectedReport.status}</span>
                      </div>
                    </div>

                    {/* Result and Confidence */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded p-4">
                      <div className="text-[10px] font-mono font-extrabold text-cat-yellow uppercase tracking-[0.18em] mb-3">NEURAL PREDICTION SUMMARY</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
                        <div>
                          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block mb-0.5">CLASSIFICATION</span>
                          <span className="font-bold uppercase text-gray-900 dark:text-white">{t(selectedReport.prediction.replace(' ', '').toLowerCase() || 'noleak')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block mb-0.5">CONFIDENCE ACCURACY</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedReport.confidence}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block mb-0.5">RISK INDEX</span>
                          <span className={`font-bold uppercase ${
                            selectedReport.riskLevel === 'Critical' ? 'text-red-500' : selectedReport.riskLevel === 'High' ? 'text-brand-warning' : 'text-brand-success'
                          }`}>{t(selectedReport.riskLevel.toLowerCase() === 'medium' ? 'riskMedium' : selectedReport.riskLevel.toLowerCase() || 'low')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Engine parameters values list in a table */}
                    <div>
                      <div className="text-[10px] font-mono font-extrabold text-cat-yellow uppercase tracking-[0.18em] mb-2">ENGINE TELEMETRY VALUES</div>
                      <div className="border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 dark:bg-cat-dark border-b border-gray-200 dark:border-gray-800 text-gray-500">
                            <tr>
                              <th className="px-4 py-2.5 text-left font-mono font-extrabold tracking-widest uppercase text-[10px]">PARAMETER</th>
                              <th className="px-4 py-2.5 text-right font-mono font-extrabold tracking-widest uppercase text-[10px]">VALUE</th>
                              <th className="px-4 py-2.5 text-left font-mono font-extrabold tracking-widest uppercase text-[10px]">UNIT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-gray-700 dark:text-gray-200">
                            <tr>
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-700 dark:text-gray-300">{t('rpm')}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">{selectedReport.inputs.rpm}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">RPM</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-700 dark:text-gray-300">{t('fuelRate')}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">{selectedReport.inputs.fuelRate}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">kg/h</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-700 dark:text-gray-300">{t('fuelInjectionTime')}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">{selectedReport.inputs.fuelInjectionTime}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">ms</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-700 dark:text-gray-300">{t('injectionPressure')}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">{selectedReport.inputs.injectionPressure}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">bar</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-700 dark:text-gray-300">{t('maf')}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">{selectedReport.inputs.maf}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">kg/h</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-700 dark:text-gray-300">{t('map')}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">{selectedReport.inputs.map}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">bar</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-700 dark:text-gray-300">{t('deltaP')}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">{selectedReport.inputs.deltaP}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">mbar</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-700 dark:text-gray-300">{t('egt')}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">{selectedReport.inputs.egt}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">°C</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-700 dark:text-gray-300">{t('nox')}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">{selectedReport.inputs.nox}</td>
                              <td className="px-4 py-2.5 font-mono text-gray-400">ppm</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recommendations details */}
                    <div>
                      <div className="text-[10px] font-mono font-extrabold text-cat-yellow uppercase tracking-[0.18em] mb-2">{t('recommendations')}</div>
                      <div className="border border-gray-200 dark:border-gray-800 rounded p-4 bg-gray-50/50 dark:bg-cat-dark/20">
                        <ul className="list-disc pl-4 space-y-2 text-gray-700 dark:text-gray-300">
                          {selectedReport.recommendations.map((rec, i) => {
                            // Standard translations mapping
                            let displayRec = rec;
                            if (rec.toLowerCase().includes('intake manifold')) displayRec = t('recInspectManifold');
                            else if (rec.toLowerCase().includes('turbocharger')) displayRec = t('recCheckHose');
                            else if (rec.toLowerCase().includes('intercooler')) displayRec = t('recVerifyPiping');
                            else if (rec.toLowerCase().includes('exhaust manifold')) displayRec = t('recInspectExhaust');
                            else if (rec.toLowerCase().includes('smoke test') || rec.toLowerCase().includes('leak testing')) displayRec = t('recPressureTest');

                            return <li key={i} className="text-xs font-sans font-normal leading-[1.8]">{displayRec}</li>;
                          })}
                        </ul>
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-8 pt-10 font-mono text-xs border-t border-gray-100 dark:border-gray-800">
                      <div className="border-t border-gray-300 dark:border-gray-700 pt-2 text-center text-gray-500">
                        <div>{t('technicianSig')}</div>
                        <div className="text-[10px] italic text-gray-400 mt-1 select-none">CONFIRMED VIA ENT-AUTH</div>
                      </div>
                      <div className="border-t border-gray-300 dark:border-gray-700 pt-2 text-center text-gray-500">
                        <div>{t('supervisorSig')}</div>
                        <div className="text-[10px] italic text-gray-400 mt-1 select-none">PENDING DIG-STAMP</div>
                      </div>
                    </div>

                  </div>

                  {/* Actions buttons underneath (Hidden in print) */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 justify-between print:hidden">
                    <button
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-1.5 border border-gray-300 dark:border-gray-700 hover:border-cat-yellow text-gray-700 dark:text-gray-200 px-4 py-2 font-mono font-bold text-xs uppercase cursor-pointer transition-all active:scale-95"
                      id="download-pdf-btn"
                    >
                      <Download className="w-4 h-4" />
                      {t('downloadPdf')}
                    </button>
                    
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 bg-cat-yellow text-cat-black hover:bg-cat-black hover:text-white dark:hover:bg-white dark:hover:text-cat-black font-mono font-bold text-xs uppercase px-6 py-2 shadow border border-cat-yellow cursor-pointer transition-all active:scale-95"
                      id="print-report-btn"
                    >
                      <Printer className="w-4 h-4" />
                      {t('printReport')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  Select a test run from the log history to review the diagnostic sheet.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
