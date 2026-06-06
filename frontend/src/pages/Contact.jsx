import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function Contact() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // Simulate sending ticket
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-cat-dark transition-colors duration-300" style={FONT} id="contact-page-wrapper">
      <div className="h-1 w-full bg-cat-yellow" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14 lg:py-16">
        {/* Page Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cat-yellow">
            {t('navContact')}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-cat-black dark:text-white leading-[0.95]">
            {t('contactTitle')}
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            {t('contactSubtitle')}
          </p>
        </div>

        {/* Content */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: Minimal form */}
          <div className="lg:col-span-7">
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-cat-charcoal">
              <div className="px-7 py-6 border-b border-gray-200 dark:border-gray-800">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cat-yellow">
                  Submit Form
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Provide your details and a short description of your query. A technical representative will respond.
                </p>
              </div>

              <div className="px-7 py-7">
                {submitted && (
                  <div className="mb-6 border border-brand-success/30 bg-brand-success/10 text-brand-success px-4 py-3 text-sm flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{t('formSubmitted')}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-transparent text-cat-black dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-cat-yellow"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-transparent text-cat-black dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-cat-yellow"
                      placeholder="name@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                      {t('message')}
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-transparent text-cat-black dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-cat-yellow resize-none leading-relaxed"
                      placeholder="Describe your query..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-cat-yellow text-cat-black px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] border border-cat-yellow hover:bg-transparent hover:text-cat-yellow transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {t('sendMessage')}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Queries contact section */}
          <div className="lg:col-span-5">
            <div className="border border-gray-200 dark:border-gray-800 bg-cat-gray-light dark:bg-cat-charcoal">
              <div className="px-7 py-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-cat-black dark:text-white">
                  For Queries — Contact
                </h2>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Reach the diagnostics support team for platform access, report issues, or engineering questions.
                </p>
              </div>

              <div className="px-7 py-7 space-y-5">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-cat-yellow mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                      {t('phone')}
                    </p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">+1 (309) 675-1000</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-cat-yellow mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                      {t('supportEmail')}
                    </p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">diagnostics.support@cat.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-cat-yellow mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                      {t('office')}
                    </p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      Peoria Technical Center (HQ)
                      <br />
                      100 Northeast Adams Street, Peoria, IL 61629
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
                    Response Standard
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Typical response within 1 business day for access and troubleshooting queries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
