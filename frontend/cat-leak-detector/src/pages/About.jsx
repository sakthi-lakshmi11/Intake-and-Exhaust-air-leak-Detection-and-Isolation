import {
  ArrowRight,
  SlidersHorizontal,
  Cpu,
  ScanSearch,
  ShieldCheck,
  FileText,
  Wrench,
  Gauge,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import engineHero from '../assets/engine-hero.jpg';
import excavatorHero from '../assets/cat-excavator-hero.jpg';
import quarryOps from '../assets/heavy-equipment-quarry.jpg';
import engineDetail from '../assets/engine-detail.jpg';

const FONT = { fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" };

const Section = ({ id, eyebrow, title, children, tone = 'white' }) => {
  const tones = {
    white: 'bg-white dark:bg-cat-dark',
    light: 'bg-cat-gray-light dark:bg-cat-charcoal',
    black: 'bg-cat-black text-white',
  };

  return (
    <section id={id} className={`${tones[tone]} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cat-yellow mb-2">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-cat-black dark:text-white leading-tight">
              {title}
            </h2>
          ) : null}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
};

export default function About() {
  const { t } = useLanguage();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-cat-dark transition-colors duration-300" style={FONT}>
      <div className="h-1 w-full bg-cat-yellow" />

      {/* SECTION 1 — HERO */}
      <section className="bg-white dark:bg-cat-dark">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left: Image */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="absolute inset-x-0 top-0 h-1 bg-cat-yellow" />
                <img
                  src={excavatorHero}
                  alt="Caterpillar heavy machinery on site"
                  className="w-full h-[280px] sm:h-[360px] lg:h-[520px] object-cover"
                  loading="eager"
                />
              </div>
            </div>

            {/* Right: Copy */}
            <div className="lg:col-span-6 flex">
              <div className="w-full flex flex-col justify-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cat-yellow mb-3">
                  {t('aboutBadge')}
                </p>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-cat-black dark:text-white leading-[0.95]">
                  <span className="block">INTAKE AND EXHAUST</span>
                  <span className="block">AIR LEAK DETECTION</span>
                </h1>

                <p className="mt-5 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Industrial Engine Diagnostic Platform
                </p>

                <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                  An intelligent diagnostic system developed to identify intake and exhaust air leaks in Caterpillar C7 and
                  C15 diesel engines using machine learning and operational parameter analysis.
                </p>

                <div className="mt-8">
                  <button
                    onClick={() => scrollTo('why-this-matters')}
                    className="inline-flex items-center gap-2 rounded-none bg-cat-yellow text-cat-black px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] border border-cat-yellow hover:bg-transparent hover:text-cat-yellow transition-colors cursor-pointer"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHY THIS PROJECT MATTERS */}
      <Section
        id="why-this-matters"
        eyebrow="Context"
        title="WHY THIS PROJECT MATTERS"
        tone="light"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
              Undetected intake and exhaust air leaks can negatively affect engine performance, increase fuel consumption,
              reduce operational efficiency, and lead to expensive maintenance activities.
            </p>
            <p className="mt-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
              This platform assists operators and maintenance engineers by providing fast, reliable, and data-driven leak
              detection.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="absolute inset-x-0 top-0 h-1 bg-cat-yellow" />
              <img
                src={quarryOps}
                alt="Heavy equipment operations in an industrial quarry"
                className="w-full h-[260px] sm:h-[340px] lg:h-[420px] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 3 — PROJECT OBJECTIVES */}
      <Section
        id="project-objectives"
        eyebrow="Project"
        title="PROJECT OBJECTIVES"
        tone="white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              k: '01',
              title: 'OBJECTIVE 1',
              desc: 'Detect intake air leaks before they affect engine efficiency.',
            },
            {
              k: '02',
              title: 'OBJECTIVE 2',
              desc: 'Identify exhaust air leaks that may impact performance and emissions.',
            },
            {
              k: '03',
              title: 'OBJECTIVE 3',
              desc: 'Support maintenance teams with diagnostic insights and recommendations.',
            },
          ].map((o) => (
            <div key={o.k} className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="flex items-baseline justify-between">
                <p className="text-[12px] font-bold tracking-[0.22em] text-cat-yellow">{o.k}</p>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800 mx-4" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold uppercase tracking-[0.14em] text-cat-black dark:text-white">
                {o.title}
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 4 — HOW THE SYSTEM WORKS */}
      <Section
        id="how-it-works"
        eyebrow="Workflow"
        title="HOW THE SYSTEM WORKS"
        tone="light"
      >
        <div className="border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-5">
            {[
              { n: 'STEP 1', label: 'Input Engine Parameters', icon: <SlidersHorizontal className="w-5 h-5" /> },
              { n: 'STEP 2', label: 'Run Machine Learning Analysis', icon: <Cpu className="w-5 h-5" /> },
              { n: 'STEP 3', label: 'Detect Leak Condition', icon: <ScanSearch className="w-5 h-5" /> },
              { n: 'STEP 4', label: 'Generate Recommendations', icon: <Wrench className="w-5 h-5" /> },
              { n: 'STEP 5', label: 'Generate Diagnostic Report', icon: <FileText className="w-5 h-5" /> },
            ].map((s, idx) => (
              <div
                key={s.n}
                className={`px-6 py-7 sm:py-8 flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 ${
                  idx > 0 ? 'border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-800' : ''
                }`}
              >
                <div className="shrink-0 w-10 h-10 border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-cat-dark/40 flex items-center justify-center text-gray-700 dark:text-gray-200">
                  {s.icon}
                </div>
                <div className="sm:text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cat-yellow">{s.n}</p>
                  <p className="mt-1 text-sm font-semibold text-cat-black dark:text-white leading-snug">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SECTION 5 — SUPPORTED ENGINES */}
      <Section
        id="supported-engines"
        eyebrow="Compatibility"
        title="SUPPORTED ENGINES"
        tone="white"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {[
            {
              title: 'CATERPILLAR C7',
              apps: 'Medium-Duty Equipment',
              desc: 'Engine supported for intake and exhaust leak analysis.',
              imgSrc: engineHero,
              imgAlt: 'Diesel engine assembly',
            },
            {
              title: 'CATERPILLAR C15',
              apps: 'Heavy-Duty Equipment',
              desc: 'Engine supported for intake and exhaust leak analysis.',
              imgSrc: engineDetail,
              imgAlt: 'Industrial diesel engine components',
            },
          ].map((p) => (
            <div key={p.title} className="border border-gray-200 dark:border-gray-800">
              <div className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-cat-yellow" />
                <img src={p.imgSrc} alt={p.imgAlt} className="w-full h-[220px] sm:h-[260px] object-cover" loading="lazy" />
              </div>
              <div className="px-7 py-8">
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-cat-black dark:text-white">
                  {p.title}
                </h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2">
                    <Gauge className="w-4 h-4 text-gray-600 dark:text-gray-300 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">
                        Applications
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-200">{p.apps}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <ShieldCheck className="w-4 h-4 text-gray-600 dark:text-gray-300 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">
                        Support
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-200">{p.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 6 — KEY FEATURES */}
      <Section
        id="key-features"
        eyebrow="Capabilities"
        title="KEY FEATURES"
        tone="light"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'Leak Detection', icon: <ScanSearch className="w-5 h-5" /> },
            { title: 'Confidence Scoring', icon: <ShieldCheck className="w-5 h-5" /> },
            { title: 'Leak Location Identification', icon: <MapPin className="w-5 h-5" /> },
            { title: 'Diagnostic Report Generation', icon: <FileText className="w-5 h-5" /> },
          ].map((f) => (
            <div key={f.title} className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="w-10 h-10 border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-cat-dark/40 flex items-center justify-center text-gray-700 dark:text-gray-200">
                {f.icon}
              </div>
              <h3 className="mt-4 text-sm font-extrabold uppercase tracking-[0.12em] text-cat-black dark:text-white">
                {f.title}
              </h3>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 7 — TECHNOLOGY OVERVIEW */}
      <Section
        id="technology-overview"
        eyebrow="Engineering"
        title="TECHNOLOGY OVERVIEW"
        tone="white"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Machine learning models analyze engine operating parameters including:
            </p>
            <ul className="mt-6 space-y-3">
              {['Engine RPM', 'Fuel Rate', 'Fuel Injection Time', 'Fuel Injection Pressure'].map((x) => (
                <li key={x} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cat-yellow mt-2 shrink-0" />
                  <span className="leading-relaxed">{x}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              The system evaluates operating conditions and determines the likelihood of intake or exhaust air leaks.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-gray-200 dark:border-gray-800 p-7">
              <p className="text-[12.5px] font-bold uppercase tracking-[0.22em] text-cat-yellow">Design Focus</p>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Clean, minimal industrial UI—optimized for readability, operator confidence, and engineering review.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 8 — CLOSING BANNER */}
      <Section id="closing-banner" eyebrow="" title="" tone="black">
        <div className="max-w-5xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
            ENGINE HEALTH MATTERS
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-gray-200 leading-relaxed">
            Accurate Diagnostics.
            <br />
            Better Maintenance Decisions.
            <br />
            Reduced Downtime.
          </p>

          <div className="mt-10 h-px bg-cat-yellow/70 w-40" />
        </div>
      </Section>
    </div>
  );
}
