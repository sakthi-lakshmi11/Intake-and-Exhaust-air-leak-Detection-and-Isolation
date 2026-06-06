import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle, ChevronDown, BookOpen, Wrench, Monitor, Ticket } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const SectionHead = ({ icon, label }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="text-gray-600 dark:text-gray-400">{icon}</div>
    <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-700 dark:text-gray-300">{label}</h2>
  </div>
);

export default function Support() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [qName, setQName] = useState('');
  const [qEmail, setQEmail] = useState('');
  const [qText, setQText] = useState('');
  const [qSubmitted, setQSubmitted] = useState(false);

  const faqs = [
    { q: t('faq1'), a: t('faq1Ans') },
    { q: t('faq2'), a: t('faq2Ans') },
    { q: t('faq3'), a: t('faq3Ans') },
    {
      q: 'Which engine models are supported?',
      a: 'This platform supports Caterpillar C7 and C15 diesel engines for intake and exhaust air leak analysis.',
    },
    {
      q: 'Which parameters are required to run an analysis?',
      a: 'Enter operating parameters such as engine RPM, fuel rate, fuel injection time, and fuel injection pressure. Additional sensor inputs can improve diagnostic confidence.',
    },
    {
      q: 'What does the confidence score represent?',
      a: 'The confidence score indicates how strongly the model supports the predicted leak condition based on the provided operating parameters.',
    },
    {
      q: 'Can I export results for maintenance records?',
      a: 'Yes. Use the report workflow to generate a structured diagnostic report that can be saved and shared with maintenance teams.',
    },
    {
      q: 'Is this system connected to a live engine?',
      a: 'This application can be integrated with live telemetry sources, but it can also be used with manually entered parameters for diagnostic evaluation.',
    },
  ];

  const errorCodes = [
    {
      code: 'ERR-C004',
      issue: t('errC004Issue'),
      cause: t('errC004Cause'),
      action: t('errC004Action'),
    },
    {
      code: 'ERR-S912',
      issue: t('errS912Issue'),
      cause: t('errS912Cause'),
      action: t('errS912Action'),
    },
    {
      code: 'ERR-P015',
      issue: t('errP015Issue'),
      cause: t('errP015Cause'),
      action: t('errP015Action'),
    },
  ];

  const sysReqs = [
    { label: t('sysReqBrowser'),   value: 'Chrome 110+, Firefox 110+, Edge 110+' },
    { label: t('sysReqOS'),        value: 'Windows 10/11, macOS 12+, Ubuntu 20+' },
    { label: t('sysReqRAM'),       value: '4 GB minimum, 8 GB recommended' },
    { label: t('sysReqNetwork'),   value: 'Internet connection for API calls' },
    { label: t('sysReqResolution'),value: '1280 × 720 minimum' },
  ];

  const submitQuestion = (e) => {
    e.preventDefault();
    if (!qName || !qEmail || !qText) return;
    setQSubmitted(true);
    setQName('');
    setQEmail('');
    setQText('');
    setShowQuestionForm(false);
    setTimeout(() => setQSubmitted(false), 4500);
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-cat-dark transition-colors duration-300"
      style={FONT}
    >
      <div className="h-1 w-full bg-cat-yellow" />

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cat-yellow mb-1">
            {t('supportBadge')}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">
            {t('supportTitle')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('supportSubtitle')}
          </p>
        </div>

        {/* User Guide */}
        <div className="bg-gray-50 dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <SectionHead icon={<BookOpen className="w-4.5 h-4.5" />} label={t('userGuideTitle')} />
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
            {t('userGuideText')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '01', title: t('guideStep1Title'), desc: t('guideStep1Desc') },
              { step: '02', title: t('guideStep2Title'), desc: t('guideStep2Desc') },
              { step: '03', title: t('guideStep3Title'), desc: t('guideStep3Desc') },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white dark:bg-cat-dark border border-gray-200 dark:border-gray-800 p-4">
                <div className="text-[11px] font-bold text-cat-yellow tracking-widest mb-1">{step}</div>
                <div className="text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-gray-200 mb-1">{title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="text-gray-600 dark:text-gray-400">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-700 dark:text-gray-300">
                {t('faqs')}
              </h2>
            </div>
            <button
              onClick={() => setShowQuestionForm((v) => !v)}
              className="shrink-0 bg-cat-yellow text-cat-black font-bold text-[11px] uppercase tracking-widest px-4 py-2 hover:bg-yellow-400 transition-colors cursor-pointer"
            >
              Add your question
            </button>
          </div>

          {qSubmitted && (
            <div className="mb-4 border border-brand-success/30 bg-brand-success/10 text-brand-success px-4 py-3 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Question submitted. Our team will respond.</span>
            </div>
          )}

          {showQuestionForm && (
            <div className="mb-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-cat-dark p-4">
              <form onSubmit={submitQuestion} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    value={qName}
                    onChange={(e) => setQName(e.target.value)}
                    className="mt-2 block w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-cat-yellow"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={qEmail}
                    onChange={(e) => setQEmail(e.target.value)}
                    className="mt-2 block w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-cat-yellow"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    className="w-full bg-cat-black text-white font-bold text-[11px] uppercase tracking-widest px-4 py-2.5 hover:bg-black/85 transition-colors cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
                <div className="sm:col-span-12">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                    Your question
                  </label>
                  <textarea
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    rows={4}
                    className="mt-2 block w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-cat-yellow resize-none leading-relaxed"
                    placeholder="Write your question..."
                    required
                  />
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-cat-dark">
                  <button
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 ml-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-gray-50 dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <SectionHead icon={<Wrench className="w-4.5 h-4.5" />} label={t('troubleshooting')} />
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 dark:bg-cat-dark border-b border-gray-200 dark:border-gray-800">
                <tr>
                  {['CODE', t('thIssue'), t('thCause'), t('thAction')].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-[10px] text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-cat-dark">
                {errorCodes.map((row) => (
                  <tr key={row.code} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400 tracking-wide whitespace-nowrap">{row.code}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{row.issue}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.cause}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 leading-relaxed">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Requirements */}
        <div className="bg-gray-50 dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <SectionHead icon={<Monitor className="w-4.5 h-4.5" />} label={t('sysReqTitle')} />
          <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-cat-dark">
            {sysReqs.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Raise Ticket */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white dark:bg-cat-charcoal">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400 shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-1">
                {t('raiseTicketTitle')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                {t('raiseTicketDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Support ticket raised. A technical representative will contact you shortly.')}
            className="shrink-0 bg-cat-yellow text-cat-black font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-yellow-400 transition-colors cursor-pointer active:scale-95"
          >
            {t('contactSupportBtn')}
          </button>
        </div>

      </div>
    </div>
  );
}
