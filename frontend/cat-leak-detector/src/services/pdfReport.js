import { jsPDF } from 'jspdf';
import { getLeakDisplay } from './leakDisplay';

/* ═══════════════════════════════════════════════════════════════════════════
   COLOUR PALETTE  — Caterpillar yellow / black / white
═══════════════════════════════════════════════════════════════════════════ */
const CAT_YELLOW  = [255, 205, 17];   // #FFCD11  primary brand accent
const CAT_BLACK   = [17,  17,  17];   // #111111  primary dark
const NAVY        = [17,  17,  17];   // same as black — accent bars use yellow instead
const GRAY_DARK   = [60,  60,  60];
const GRAY_MID    = [120, 120, 120];
const GRAY_LIGHT  = [220, 220, 220];
const GRAY_BG     = [252, 248, 220];  // very light yellow tint for alt rows
const WHITE       = [255, 255, 255];
const GREEN       = [22,  163, 74];
const GREEN_LIGHT = [220, 252, 231];
const ORANGE      = [234, 88,  12];
const ORANGE_LT   = [254, 215, 170];
const RED         = [220, 38,  38];
const RED_LIGHT   = [254, 202, 202];

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE GEOMETRY
═══════════════════════════════════════════════════════════════════════════ */
const PAGE_W    = 210;
const PAGE_H    = 297;
const MARGIN    = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

/* ═══════════════════════════════════════════════════════════════════════════
   LOW-LEVEL HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const sf  = (doc, rgb) => doc.setFillColor(...rgb);
const sd  = (doc, rgb) => doc.setDrawColor(...rgb);
const st  = (doc, rgb) => doc.setTextColor(...rgb);

function hRule(doc, y, color = GRAY_LIGHT, w = 0.3) {
  sd(doc, color); doc.setLineWidth(w);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

/* ── Section bar — CAT yellow accent on black ── */
function sectionBar(doc, y, num, label) {
  // Black fill bar
  sf(doc, CAT_BLACK); doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
  // Left yellow accent stripe
  sf(doc, CAT_YELLOW); doc.rect(MARGIN, y, 3, 8, 'F');
  // Section number in yellow
  st(doc, CAT_YELLOW); doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
  doc.text(num, MARGIN + 7, y + 5.5);
  // Section label in white
  st(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
  doc.text(label.toUpperCase(), MARGIN + 19, y + 5.5);
  return y + 8;
}

/* ── Alternating-row key-value table row (2-col) ── */
function kvRow(doc, y, label, value, shade, valueColor) {
  const ROW_H = 7;
  if (shade) { sf(doc, GRAY_BG); doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'F'); }
  sd(doc, GRAY_LIGHT); doc.setLineWidth(0.2);
  doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'S');
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text(String(label), MARGIN + 3, y + 4.8);
  st(doc, valueColor || CAT_BLACK); doc.setFont('helvetica', 'bold');
  doc.text(String(value), MARGIN + 90, y + 4.8);
  return y + ROW_H;
}

/* ── 5-column sensor table row (name | value | unit | range | status) ── */
function sensorRow(doc, y, cols, shade) {
  const ROW_H  = 7;
  const widths = [52, 28, 22, 40, 30];   // column widths, total = CONTENT_W ≈ 182
  const xs     = widths.reduce((acc, w, i) => { acc.push((acc[i - 1] || MARGIN) + (i ? widths[i - 1] : 0)); return acc; }, []);
  xs[0] = MARGIN;
  for (let i = 1; i < widths.length; i++) xs[i] = xs[i - 1] + widths[i - 1];

  if (shade) { sf(doc, GRAY_BG); doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'F'); }
  sd(doc, GRAY_LIGHT); doc.setLineWidth(0.2);
  doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'S');

  const statusColors = { NORMAL: GREEN, WARNING: ORANGE, ABNORMAL: RED };
  cols.forEach((text, i) => {
    const isStatus = i === 4;
    const color = isStatus ? (statusColors[text] || GRAY_DARK) : GRAY_DARK;
    st(doc, color);
    doc.setFont('helvetica', isStatus ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.text(String(text), xs[i] + 2, y + 4.8);
  });
  return y + ROW_H;
}

/* ── Column header row (shared between sensor + nominal tables) ── */
function tableHeader(doc, y, headers, widths) {
  const ROW_H = 7;
  // Yellow fill header — CAT brand
  sf(doc, CAT_YELLOW); sd(doc, CAT_BLACK);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'FD');
  let x = MARGIN;
  headers.forEach((h) => {
    st(doc, CAT_BLACK); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text(h.toUpperCase(), x + 2, y + 4.8);
    x += widths[headers.indexOf(h)];
  });
  return y + ROW_H;
}

/* ── Status verdict box (GO / NON-GO) ── */
function verdictBox(doc, y, isGo, leakLocation) {
  const bg     = isGo ? GREEN_LIGHT : RED_LIGHT;
  const border = isGo ? GREEN : RED;
  const label  = isGo ? 'GO — SYSTEM CLEAR' : 'NON-GO — LEAK DETECTED';
  const detail = isGo
    ? 'No significant intake or exhaust air leak detected. All parameters within acceptable operating limits.'
    : `Potential air leak detected in engine air pathway. Immediate maintenance action required. Location: ${leakLocation}`;

  sf(doc, bg); sd(doc, border); doc.setLineWidth(1);
  doc.roundedRect(MARGIN, y, CONTENT_W, 22, 2, 2, 'FD');

  st(doc, border); doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text(label, MARGIN + 5, y + 9);

  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  const lines = doc.splitTextToSize(detail, CONTENT_W - 10);
  doc.text(lines, MARGIN + 5, y + 16);
  return y + 26;
}

/* ── Checkmark bullet line ── */
function checkLine(doc, y, text, color) {
  const c = color || GREEN;
  sf(doc, c); doc.circle(MARGIN + 3, y + 1.8, 1.5, 'F');
  st(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5);
  doc.text('✓', MARGIN + 1.5, y + 2.5);
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
  const lines = doc.splitTextToSize(text, CONTENT_W - 12);
  doc.text(lines, MARGIN + 8, y + 3);
  return y + lines.length * 5.5 + 1.5;
}

/* ── NovaCrafters logo — compact CAT-style: black plate, yellow triangle, white wordmark ── */
function drawNCLogo(doc, x, y) {
  // Compact black plate: 44mm wide × 10mm tall
  sf(doc, CAT_BLACK); sd(doc, CAT_BLACK); doc.setLineWidth(0);
  doc.roundedRect(x, y, 44, 10, 1, 1, 'F');
  // Small yellow triangle (CAT-inspired, proportionally scaled)
  sf(doc, CAT_YELLOW);
  doc.triangle(x + 2, y + 9, x + 7, y + 9, x + 4.5, y + 2, 'F');
  // Thin yellow underline bar
  sf(doc, CAT_YELLOW); doc.rect(x + 10, y + 8.2, 32, 1, 'F');
  // White wordmark — font size reduced to fit inside 44mm plate
  st(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
  doc.text('NOVACRAFTERS', x + 10, y + 6.8);
}

/* ── Page footer — CAT yellow/black theme ── */
function pageFooter(doc, pageNum, timestamp) {
  const y = PAGE_H - 10;
  // Full-width black strip
  sf(doc, CAT_BLACK); doc.rect(0, y - 3, PAGE_W, 13, 'F');
  // Yellow top accent
  sf(doc, CAT_YELLOW); doc.rect(0, y - 3, PAGE_W, 1.5, 'F');
  // Left: system info in white
  st(doc, WHITE); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
  doc.text(
    `NovaCrafters  |  Intake & Exhaust Air Leak Diagnostic System  |  v2.0  |  Generated: ${timestamp}`,
    MARGIN, y + 3
  );
  // Right: page number in yellow
  st(doc, CAT_YELLOW); doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, y + 3, { align: 'right' });
}

/* ── Page overflow guard ── */
function checkPage(doc, y, needed, timestamp) {
  if (y + needed > PAGE_H - 16) {
    pageFooter(doc, doc.internal.getNumberOfPages(), timestamp);
    doc.addPage();
    return MARGIN + 4;
  }
  return y;
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOMINAL SENSOR RANGES  — reference data used throughout the report
═══════════════════════════════════════════════════════════════════════════ */
const NOMINAL_RANGES = [
  { sensor: 'Engine RPM',              min: 600,  max: 2500, unit: 'RPM',  c7: '600–1800',  c15: '600–2100' },
  { sensor: 'Fuel Rate',               min: 1,    max: 120,  unit: 'L/hr', c7: '1–30',      c15: '1–80'     },
  { sensor: 'Fuel Injection Time',     min: 0.5,  max: 5.0,  unit: 'ms',   c7: '0.5–2.8',   c15: '0.5–3.5'  },
  { sensor: 'Fuel Injection Pressure', min: 200,  max: 2000, unit: 'bar',  c7: '600–1400',  c15: '900–1800' },
  { sensor: 'Boost Pressure',          min: 0.8,  max: 3.0,  unit: 'bar',  c7: '1.0–2.4',   c15: '1.2–2.8'  },
  { sensor: 'Intake Manifold Pressure',min: 0.9,  max: 3.5,  unit: 'bar',  c7: '1.0–2.5',   c15: '1.2–3.0'  },
  { sensor: 'Exhaust Back Pressure',   min: 0.05, max: 0.5,  unit: 'bar',  c7: '0.05–0.30', c15: '0.05–0.40'},
  { sensor: 'Air Flow (MAF)',          min: 100,  max: 800,  unit: 'kg/h', c7: '150–450',   c15: '250–700'  },
  { sensor: 'Intake Air Temperature',  min: -10,  max: 60,   unit: '°C',   c7: '20–55',     c15: '20–55'    },
  { sensor: 'Exhaust Gas Temperature', min: 300,  max: 750,  unit: '°C',   c7: '350–620',   c15: '380–680'  },
];

/* ─── Classify a sensor reading against its nominal min/max ─── */
function classifySensor(value, min, max) {
  const v   = parseFloat(value);
  const lo  = min * 0.85;   // 15% below min = WARNING
  const hi  = max * 1.15;   // 15% above max = WARNING
  if (isNaN(v))              return 'N/A';
  if (v < lo || v > hi)      return 'ABNORMAL';
  if (v < min || v > max)    return 'WARNING';
  return 'NORMAL';
}

/* ─── Build sensor data rows from inputs ─── */
function buildSensorRows(inputs, isC15) {
  const rpm = parseFloat(inputs?.rpm);
  const rpmRange = isC15 ? { min: 600, max: 2100 } : { min: 600, max: 1800 };
  const fr  = parseFloat(inputs?.fuelRate);
  const frRange  = isC15 ? { min: 1, max: 80 }    : { min: 1, max: 30 };
  const fit = parseFloat(inputs?.fuelInjectionTime);
  const fitRange = isC15 ? { min: 0.5, max: 3.5 } : { min: 0.5, max: 2.8 };
  const ip  = parseFloat(inputs?.injectionPressure);
  const ipRange  = isC15 ? { min: 900, max: 1800 } : { min: 600, max: 1400 };

  return [
    ['Engine RPM',              isNaN(rpm) ? '—' : rpm, 'RPM',  isC15 ? '600–2100'  : '600–1800',  isNaN(rpm) ? '—' : classifySensor(rpm, rpmRange.min, rpmRange.max)],
    ['Fuel Rate',               isNaN(fr)  ? '—' : fr,  'L/hr', isC15 ? '1–80'      : '1–30',      isNaN(fr)  ? '—' : classifySensor(fr,  frRange.min,  frRange.max)],
    ['Fuel Injection Time',     isNaN(fit) ? '—' : fit, 'ms',   isC15 ? '0.5–3.5ms' : '0.5–2.8ms', isNaN(fit) ? '—' : classifySensor(fit, fitRange.min, fitRange.max)],
    ['Fuel Injection Pressure', isNaN(ip)  ? '—' : ip,  'bar',  isC15 ? '900–1800'  : '600–1400',  isNaN(ip)  ? '—' : classifySensor(ip,  ipRange.min,  ipRange.max)],
    ['Boost Pressure',          'N/A', 'bar',  isC15 ? '1.2–2.8'  : '1.0–2.4',  'N/A'],
    ['Intake Manifold Pressure','N/A', 'bar',  isC15 ? '1.2–3.0'  : '1.0–2.5',  'N/A'],
    ['Exhaust Back Pressure',   'N/A', 'bar',  isC15 ? '0.05–0.40': '0.05–0.30', 'N/A'],
    ['Air Flow (MAF)',           'N/A', 'kg/h', isC15 ? '250–700'  : '150–450',   'N/A'],
    ['Exhaust Gas Temperature',  'N/A', '°C',   isC15 ? '380–680'  : '350–620',   'N/A'],
  ];
}

/* ─── Dynamic recommendations by prediction ─── */
function getRecommendations(prediction, isGo) {
  if (isGo) return [
    'System operating within normal limits. No corrective action required.',
    'Continue scheduled preventive maintenance as per CAT service intervals.',
    'Monitor engine performance parameters during next 50-hour inspection.',
    'Verify boost sensor and fuel trim calibration during next scheduled service.',
    'Log this report for compliance and maintenance history records.',
  ];
  if (prediction === 'Intake Leak') return [
    'IMMEDIATE: Inspect intake manifold gaskets and seal integrity.',
    'Check all turbocharger inlet flexible hose clamps for looseness or cracking.',
    'Inspect charge-air cooler header welds and piping connections for micro-leaks.',
    'Verify MAP sensor seals and all intake piping connections are secure.',
    'Perform high-pressure smoke test on intake circuit to locate micro-leak points.',
    'Replace any deteriorated rubber hoses or failed gaskets before restart.',
    'Re-test system after repair to confirm leak elimination.',
  ];
  if (prediction === 'Exhaust Leak') return [
    'IMMEDIATE: Inspect exhaust manifold for cracks, carbon deposits, and blown gaskets.',
    'Check turbine inlet and outlet flange seals and verify correct torque on all fasteners.',
    'Perform visual inspection on all exhaust slip-joints and v-band clamps.',
    'Check exhaust manifold studs for stretching or thread damage.',
    'Inspect EGR connections and exhaust back-pressure sensor ports if equipped.',
    'Allow engine to cool completely before performing physical inspection.',
    'Re-test after repair and verify exhaust gas temperature returns to nominal range.',
  ];
  if (prediction === 'Combined Leak') return [
    'CRITICAL: Both intake and exhaust pathways show abnormal signatures.',
    'IMMEDIATE: Remove engine from service until full inspection is completed.',
    'Perform complete intake circuit pressure test (smoke test recommended).',
    'Inspect all exhaust manifold gaskets, studs, and flanges for failure.',
    'Check turbocharger compressor and turbine sides for seal degradation.',
    'Inspect intercooler piping, charge-air cooler, and all associated clamps.',
    'Schedule immediate service with a certified CAT dealer technician.',
    'Do not restart engine until root cause is identified and repaired.',
  ];
  return [
    'Inspect all air system components as indicated by the diagnostic results.',
    'Refer to the Caterpillar Service Information System (SIS) for detailed procedures.',
    'Contact your authorised CAT dealer for assistance.',
  ];
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENGINE DIAGRAM  — vector, colour-coded zones
═══════════════════════════════════════════════════════════════════════════ */
function drawEngineDiagram(doc, y, isGo, prediction, engineModel) {
  const hasIntake  = !isGo && (prediction === 'Intake Leak'  || prediction === 'Combined Leak');
  const hasExhaust = !isGo && (prediction === 'Exhaust Leak' || prediction === 'Combined Leak');

  const DIAG_H = 88;  // taller panel so all labels + status text fit without clipping
  const cx     = PAGE_W / 2;
  const eW     = 48;  // slightly narrower engine block to leave room for manifold labels

  // ── Background grid panel
  sf(doc, [242, 242, 242]); sd(doc, GRAY_LIGHT); doc.setLineWidth(0.2);
  doc.rect(MARGIN, y, CONTENT_W, DIAG_H, 'FD');

  // ── Helper: zone colour
  const zoneColor = (leaking) => leaking ? RED : (isGo ? GREEN : [180, 180, 180]);
  const zoneBg    = (leaking) => leaking ? RED_LIGHT : (isGo ? GREEN_LIGHT : [220, 220, 220]);

  // ── Air filter
  sf(doc, [210, 210, 210]); sd(doc, [80, 80, 80]); doc.setLineWidth(0.7);
  doc.roundedRect(MARGIN + 2, y + 20, 11, 24, 1, 1, 'FD');
  st(doc, [80, 80, 80]); doc.setFont('helvetica', 'bold'); doc.setFontSize(4.5);
  doc.text('AIR', MARGIN + 7.5, y + 30, { align: 'center' });
  doc.text('FILT', MARGIN + 7.5, y + 35, { align: 'center' });

  // ── Turbocharger compressor (left, intake side)
  const tcColor = zoneColor(hasIntake);
  const tcBg    = zoneBg(hasIntake);
  sf(doc, tcBg); sd(doc, tcColor); doc.setLineWidth(hasIntake ? 1.2 : 0.8);
  doc.circle(MARGIN + 24, y + 32, 12, 'FD');
  sf(doc, isGo ? [180, 230, 180] : (hasIntake ? RED_LIGHT : [190, 190, 190]));
  doc.circle(MARGIN + 24, y + 32, 7.5, 'F');
  sf(doc, isGo ? [120, 200, 120] : (hasIntake ? [220, 80, 80] : [160, 160, 160]));
  doc.circle(MARGIN + 24, y + 32, 3.5, 'F');
  st(doc, tcColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(4.5);
  doc.text('TURBO', MARGIN + 24, y + 47, { align: 'center' });
  doc.text('COMP.', MARGIN + 24, y + 51, { align: 'center' });

  // ── Intake manifold connector pipe
  const intakeColor = zoneColor(hasIntake);
  sf(doc, zoneBg(hasIntake)); sd(doc, intakeColor);
  doc.setLineWidth(hasIntake ? 1.4 : 0.6);
  doc.rect(cx - eW - 9, y + 26, 9, 14, 'FD');
  st(doc, intakeColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(4);
  doc.text('INT.', cx - eW - 4.5, y + 31, { align: 'center' });
  doc.text('MAN.', cx - eW - 4.5, y + 36, { align: 'center' });
  // Leak marker on intake
  if (hasIntake) {
    sf(doc, RED); doc.circle(cx - eW - 10, y + 33, 4, 'F');
    st(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(6);
    doc.text('!', cx - eW - 10, y + 35, { align: 'center' });
  }

  // ── Engine block
  sf(doc, [200, 200, 200]); sd(doc, [40, 40, 40]); doc.setLineWidth(1.2);
  doc.rect(cx - eW, y + 14, eW * 2, 46, 'FD');
  // Cylinder head
  sf(doc, [185, 185, 185]); doc.setLineWidth(0.8);
  doc.rect(cx - eW + 4, y + 6, eW * 2 - 8, 10, 'FD');
  // Cylinder bores
  const nCyl = 6;
  const cylW = (eW * 2 - 20) / nCyl;
  for (let i = 0; i < nCyl; i++) {
    sf(doc, [165, 165, 165]); doc.setLineWidth(0.5);
    doc.roundedRect(cx - eW + 9 + i * cylW, y + 7, cylW - 2, 7, 0.5, 0.5, 'FD');
  }
  // Engine label
  st(doc, [40, 40, 40]); doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
  doc.text('ENGINE BLOCK', cx, y + 38, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5);
  doc.text(`${engineModel || ''}`, cx, y + 44, { align: 'center' });

  // ── Exhaust manifold connector pipe
  const exhaustColor = zoneColor(hasExhaust);
  sf(doc, zoneBg(hasExhaust)); sd(doc, exhaustColor);
  doc.setLineWidth(hasExhaust ? 1.4 : 0.6);
  doc.rect(cx + eW, y + 26, 9, 14, 'FD');
  st(doc, exhaustColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(4);
  doc.text('EXH.', cx + eW + 4.5, y + 31, { align: 'center' });
  doc.text('MAN.', cx + eW + 4.5, y + 36, { align: 'center' });
  // Leak marker on exhaust
  if (hasExhaust) {
    sf(doc, RED); doc.circle(cx + eW + 14, y + 33, 4, 'F');
    st(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(6);
    doc.text('!', cx + eW + 14, y + 35, { align: 'center' });
  }

  // ── Turbine housing (right, exhaust side)
  const ttColor = zoneColor(hasExhaust);
  const ttBg    = zoneBg(hasExhaust);
  sf(doc, ttBg); sd(doc, ttColor); doc.setLineWidth(hasExhaust ? 1.2 : 0.8);
  doc.circle(cx + eW + 25, y + 32, 12, 'FD');
  sf(doc, hasExhaust ? RED_LIGHT : (isGo ? [180, 230, 180] : [190, 190, 190]));
  doc.circle(cx + eW + 25, y + 32, 7.5, 'F');
  sf(doc, hasExhaust ? [220, 80, 80] : (isGo ? [120, 200, 120] : [160, 160, 160]));
  doc.circle(cx + eW + 25, y + 32, 3.5, 'F');
  st(doc, ttColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(4.5);
  doc.text('TURBO', cx + eW + 25, y + 47, { align: 'center' });
  doc.text('TURB.', cx + eW + 25, y + 51, { align: 'center' });

  // ── Charge air cooler (below engine, intake side)
  sf(doc, [225, 225, 225]); sd(doc, [80, 80, 80]); doc.setLineWidth(0.5);
  doc.rect(cx - eW, y + 63, 46, 7, 'FD');
  st(doc, [80, 80, 80]); doc.setFont('helvetica', 'normal'); doc.setFontSize(4);
  doc.text('CHARGE AIR COOLER', cx - eW + 23, y + 67.5, { align: 'center' });

  // ── Exhaust outlet pipe
  sf(doc, zoneBg(hasExhaust)); sd(doc, exhaustColor);
  doc.setLineWidth(hasExhaust ? 1.0 : 0.5);
  doc.rect(cx + eW + 37, y + 28, 18, 7, 'FD');
  st(doc, GRAY_DARK); doc.setFontSize(4);
  doc.text('EXHAUST OUT', cx + eW + 46, y + 33, { align: 'center' });

  // ── Status label — inside safe zone, above colour key
  const statusColor  = isGo ? GREEN : RED;
  const statusLabel  = isGo
    ? 'NO LEAK DETECTED  —  ALL SYSTEMS NOMINAL'
    : `${prediction.toUpperCase()}  DETECTED  —  MAINTENANCE REQUIRED`;
  st(doc, statusColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
  doc.text(statusLabel, cx, y + DIAG_H - 14, { align: 'center' });

  // ── Colour key — last line inside panel
  const keyY = y + DIAG_H - 7;
  sf(doc, GREEN);  doc.circle(MARGIN + 4,  keyY, 1.8, 'F');
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5);
  doc.text('NORMAL',   MARGIN + 8,  keyY + 1);
  sf(doc, ORANGE); doc.circle(MARGIN + 30, keyY, 1.8, 'F');
  doc.text('WARNING',  MARGIN + 34, keyY + 1);
  sf(doc, RED);    doc.circle(MARGIN + 58, keyY, 1.8, 'F');
  doc.text('LEAK / ABNORMAL', MARGIN + 62, keyY + 1);

  return y + DIAG_H + 4;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════ */
export function generateDiagnosticPDF(report, currentUser) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setFont('helvetica');

  /* ── Destructure report ── */
  const {
    id,
    timestamp,
    prediction  = report.leak_section || 'No Leak',
    status      = report.go_nogo      || 'GO',
    confidence  = 0,
    riskLevel   = report.riskLevel || report.severity || 'Low',
    recommendations = [],
    inputs      = {},
    engineModel,
    technician,
    engineVersionLabel = '',
    manufacturingYears = '',
  } = report;

  const safeRisk   = riskLevel || 'Low';
  const isGo       = status === 'GO' || prediction === 'No Leak';
  const isC15      = (engineModel || '').includes('C15');
  const leakDisplay = getLeakDisplay(prediction, riskLevel);
  const hasIntake   = !isGo && (prediction === 'Intake Leak'  || prediction === 'Combined Leak');
  const hasExhaust  = !isGo && (prediction === 'Exhaust Leak' || prediction === 'Combined Leak');
  const operator    = technician || currentUser?.fullName || 'N/A';
  const engine      = `Caterpillar ${engineModel || '—'}`;
  const leakLocationMap = {
    'No Leak':       'No leak location identified',
    'Intake Leak':   'Turbocharger Intake Pipe / Intake Manifold',
    'Exhaust Leak':  'Exhaust Manifold Joint / Turbine Outlet',
    'Combined Leak': 'Intake Manifold + Exhaust Manifold',
  };
  const leakLocation = leakLocationMap[prediction] || '—';
  const dynamicRecs  = getRecommendations(prediction, isGo);

  /* ── Colour helpers ── */
  const sevColor = safeRisk === 'Critical' ? RED
    : safeRisk === 'High'   ? ORANGE
    : safeRisk === 'Medium' ? [161, 98, 7]
    : GREEN;

  let y = MARGIN;

  /* ── PAGE HEADER — white bg, CAT yellow/black/white theme ── */
  sf(doc, WHITE); doc.rect(0, 0, PAGE_W, 36, 'F');
  // Black bar across top
  sf(doc, CAT_BLACK); doc.rect(0, 0, PAGE_W, 2.5, 'F');
  // Yellow accent line below header
  sf(doc, CAT_YELLOW); doc.rect(0, 33, PAGE_W, 2.5, 'F');

  // NovaCrafters logo — top-left, vertically centred in header (header is 0–33mm)
  drawNCLogo(doc, MARGIN, 12);

  // Report title — black bold centred
  st(doc, CAT_BLACK); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text('AUTOMATED INTAKE AND EXHAUST', PAGE_W / 2, 12, { align: 'center' });
  doc.text('AIR LEAK DIAGNOSTIC REPORT', PAGE_W / 2, 19, { align: 'center' });
  // Subtitle in dark grey
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.text('NovaCrafters Engine Diagnostics Platform  |  Confidential Service Document', PAGE_W / 2, 25, { align: 'center' });

  // Report meta — right-aligned in dark grey
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.text(`Report ID: ${id}`, PAGE_W - MARGIN, 10, { align: 'right' });
  doc.text(`Date: ${timestamp}`, PAGE_W - MARGIN, 15, { align: 'right' });
  doc.text(`Engine: ${engine}`, PAGE_W - MARGIN, 20, { align: 'right' });

  y = 40;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 01 — ANALYSIS SUMMARY
  ═══════════════════════════════════════════════════════════════════ */
  y = sectionBar(doc, y, '01', 'Analysis Summary');
  y += 3;

  // Verdict box
  y = verdictBox(doc, y, isGo, leakLocation);
  y += 3;

  // Summary KV grid — 2 columns
  const col1W = CONTENT_W / 2 - 1;
  const col2X = MARGIN + col1W + 2;
  const summaryLeft = [
    ['Diagnosis Result',   isGo ? 'SYSTEM CLEAR' : 'LEAK DETECTED'],
    ['System Status',      `${status}`],
    ['Leak Status',        leakDisplay.leakLabel],
    ['Confidence Score',   `${confidence}%`],
  ];
  const summaryRight = [
    ['Risk Level',         leakDisplay.isNil ? '—' : safeRisk],
    ['Detected Location',  leakDisplay.isNil ? '—' : leakLocation],
    ['Analysis Time',      timestamp],
    ['Technician',         operator],
  ];

  const startY = y;
  const ROW_H  = 7;
  summaryLeft.forEach(([k, v], i) => {
    const ry = startY + i * ROW_H;
    if (i % 2 === 0) { sf(doc, GRAY_BG); doc.rect(MARGIN, ry, col1W, ROW_H, 'F'); }
    sd(doc, GRAY_LIGHT); doc.setLineWidth(0.2); doc.rect(MARGIN, ry, col1W, ROW_H, 'S');
    st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    doc.text(k, MARGIN + 2, ry + 4.8);
    // Value colour: Leak Status green if GO
    const isLeakStatus = k === 'Leak Status';
    const vColor = isLeakStatus && isGo ? GREEN
      : isLeakStatus && !isGo ? RED
      : CAT_BLACK;
    st(doc, vColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text(String(v), MARGIN + col1W * 0.5 + 2, ry + 4.8);
  });
  summaryRight.forEach(([k, v], i) => {
    const ry = startY + i * ROW_H;
    if (i % 2 === 0) { sf(doc, GRAY_BG); doc.rect(col2X, ry, col1W, ROW_H, 'F'); }
    sd(doc, GRAY_LIGHT); doc.setLineWidth(0.2); doc.rect(col2X, ry, col1W, ROW_H, 'S');
    st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    doc.text(k, col2X + 2, ry + 4.8);
    const isRisk = k === 'Risk Level';
    const vColor = isRisk && !leakDisplay.isNil ? sevColor : CAT_BLACK;
    st(doc, vColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text(String(v), col2X + col1W * 0.5 + 2, ry + 4.8);
  });
  y = startY + summaryLeft.length * ROW_H + 5;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 02 — ENGINE IDENTIFICATION
  ═══════════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 40, timestamp);
  y = sectionBar(doc, y, '02', 'Engine Identification');
  y += 3;

  const engineRows = [
    ['Engine Family',          engine],
    ['Engine Version / Variant', engineVersionLabel || '—'],
    ['Manufacturing Year(s)',  manufacturingYears  || '—'],
    ['Engine Configuration',   inputs?.engineConfig || '—'],
    ['Turbo Configuration',    inputs?.turboConfig  || '—'],
  ];
  engineRows.forEach(([k, v], i) => { y = kvRow(doc, y, k, v, i % 2 === 0); });
  y += 5;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 03 — SENSOR DATA ANALYSIS
  ═══════════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 90, timestamp);
  y = sectionBar(doc, y, '03', 'Sensor Data Analysis  (3-Second Capture Window)');
  y += 3;

  // Intro note
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
  doc.text(
    'Sensor readings captured during the 3-second diagnostic window. Values compared against model-calibrated nominal ranges.',
    MARGIN, y + 3
  );
  y += 8;

  // Table header rows: use yellow fill
  y = tableHeader(doc, y, ['SENSOR PARAMETER', 'MEASURED', 'UNIT', 'NORMAL RANGE', 'STATUS'],
    [52, 28, 22, 40, 30]);

  const sensorRows = buildSensorRows(inputs, isC15);
  sensorRows.forEach((row, i) => { y = sensorRow(doc, y, row, i % 2 === 0); });

  // Legend
  y += 3;
  const legendItems = [
    { label: 'NORMAL',   color: GREEN  },
    { label: 'WARNING',  color: ORANGE },
    { label: 'ABNORMAL', color: RED    },
    { label: 'N/A — Not measured in this session', color: GRAY_MID },
  ];
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
  doc.text('STATUS KEY:', MARGIN, y + 3);
  let lx = MARGIN + 24;
  legendItems.forEach(({ label, color }) => {
    sf(doc, color); doc.roundedRect(lx, y, 3, 3, 0.5, 0.5, 'F');
    st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
    doc.text(label, lx + 5, y + 2.8);
    lx += doc.getTextWidth(label) + 12;
  });
  y += 8;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 04 — NOMINAL OPERATING SENSOR RANGES
  ═══════════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 85, timestamp);
  y = sectionBar(doc, y, '04', 'Nominal Operating Sensor Ranges');
  y += 3;

  st(doc, GRAY_DARK); doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
  doc.text(
    `Reference values used by the ML diagnostic model for ${isC15 ? 'C15' : 'C7'} engine family.`,
    MARGIN, y + 3
  );
  y += 8;

  // Nominal ranges header: 3 columns with yellow
  y = tableHeader(doc, y, ['SENSOR PARAMETER', `NORMAL RANGE  (${isC15 ? 'C15' : 'C7'})`, 'UNIT'],
    [90, 62, 30]);

  NOMINAL_RANGES.forEach(({ sensor, unit, c7, c15 }, i) => {
    const range = isC15 ? c15 : c7;
    const ROW_H = 7;
    if (i % 2 === 0) { sf(doc, GRAY_BG); doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'F'); }
    sd(doc, GRAY_LIGHT); doc.setLineWidth(0.2); doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'S');
    st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(sensor, MARGIN + 2, y + 4.8);
    st(doc, CAT_BLACK); doc.setFont('helvetica', 'bold');
    doc.text(range, MARGIN + 92, y + 4.8);
    st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal');
    doc.text(unit, MARGIN + 154, y + 4.8);
    y += ROW_H;
  });
  y += 5;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 05 — LEAK DETECTION ANALYSIS
  ═══════════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 55, timestamp);
  y = sectionBar(doc, y, '05', 'Leak Detection Analysis');
  y += 3;

  const leakRows = [
    ['Leak Status',            leakDisplay.leakLabel],
    ['Leak Severity',          leakDisplay.isNil ? '—' : safeRisk],
    ['Leak Percentage',        isGo ? '0%' : `> 0%  (${safeRisk} threshold exceeded)`],
    ['Detected Section',       leakDisplay.sectionDisplay],
    ['Detected Location',      leakDisplay.isNil ? 'No leak location identified' : leakLocation],
    ['Root Cause Summary',     isGo
      ? 'All air pathway readings within calibrated nominal thresholds. No anomaly detected.'
      : `ML model detected statistically significant anomaly consistent with ${prediction}. ` +
        `Primary indicators: abnormal pressure differential and/or mass air flow deviation.`],
  ];
  leakRows.forEach(([k, v], i) => {
    const isLeakStatus = k === 'Leak Status';
    const isSeverity   = k === 'Leak Severity';
    const vColor = isLeakStatus && isGo  ? GREEN
      : isLeakStatus && !isGo ? RED
      : isSeverity   && !leakDisplay.isNil ? sevColor
      : CAT_BLACK;
    y = kvRow(doc, y, k, v, i % 2 === 0, vColor);
  });
  y += 5;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 06 — LEAK LOCATION VISUALIZATION
  ═══════════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 85, timestamp);
  y = sectionBar(doc, y, '06', 'Leak Location Visualization — Engine Air Pathway Schematic');
  y += 3;

  st(doc, GRAY_DARK); doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
  doc.text(
    `${engineModel || ''} air pathway diagram. Leak zones highlighted in RED. Healthy zones in GREEN.`,
    MARGIN, y + 3
  );
  y += 7;
  y = drawEngineDiagram(doc, y, isGo, prediction, engineModel);
  y += 3;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 07 — RECOMMENDED ACTIONS
  ═══════════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 55, timestamp);
  y = sectionBar(doc, y, '07', `Recommended Actions  — ${isGo ? 'Routine Maintenance' : prediction + ' Response'}`);
  y += 4;

  // Heading label
  sf(doc, isGo ? GREEN_LIGHT : RED_LIGHT);
  sd(doc, isGo ? GREEN : RED); doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, CONTENT_W, 8, 1, 1, 'FD');
  st(doc, isGo ? GREEN : RED); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  doc.text(
    isGo ? '✓  SYSTEM CLEAR — Continue routine maintenance schedule'
          : `⚠  ACTION REQUIRED — ${prediction} identified. Address immediately.`,
    MARGIN + 4, y + 5.5
  );
  y += 12;

  const allRecs = [...dynamicRecs, ...(recommendations || [])];
  const uniqueRecs = [...new Set(allRecs)];
  uniqueRecs.forEach((rec) => {
    y = checkPage(doc, y, 14, timestamp);
    y = checkLine(doc, y, rec, isGo ? GREEN : RED);
  });
  y += 5;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 08 — INPUT PARAMETERS SUMMARY
  ═══════════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 50, timestamp);
  y = sectionBar(doc, y, '08', 'Input Parameters Summary');
  y += 3;

  const paramRows = [
    ['Engine Model',             engine],
    ['Engine RPM',               `${inputs?.rpm ?? '—'} RPM`],
    ['Fuel Rate',                `${inputs?.fuelRate ?? '—'} L/hr`],
    ['Fuel Injection Time',      `${inputs?.fuelInjectionTime ?? '—'} ms`],
    ['Fuel Injection Pressure',  `${inputs?.injectionPressure ?? '—'} bar`],
    ['Leak Classification',      leakDisplay.isNil ? `${leakDisplay.leakLabel}  (${leakDisplay.leakStatus})` : prediction],
    ['Risk Level',               leakDisplay.isNil ? '—' : safeRisk],
    ['Confidence Score',         `${confidence}%`],
  ];
  paramRows.forEach(([k, v], i) => { y = kvRow(doc, y, k, v, i % 2 === 0); });
  y += 5;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 09 — CERTIFICATION & SIGN-OFF
  ═══════════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 45, timestamp);
  y = sectionBar(doc, y, '09', 'Certification & Sign-Off');
  y += 8;

  // Two signature blocks side by side
  const sigW = CONTENT_W / 2 - 4;
  const sig2X = MARGIN + sigW + 8;
  [[MARGIN, 'Technician / Operator', operator, 'CONFIRMED VIA ENTERPRISE AUTH'],
   [sig2X,  'Supervisor / Approver',  '—',      'PENDING DIGITAL STAMP']
  ].forEach(([x, role, name, note]) => {
    // Signature line
    sd(doc, GRAY_DARK); doc.setLineWidth(0.4);
    doc.line(x, y + 12, x + sigW, y + 12);
    st(doc, GRAY_DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text(role, x, y + 16);
    st(doc, CAT_BLACK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(name, x, y + 21);
    st(doc, GRAY_MID); doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5);
    doc.text(note, x, y + 26);
  });
  y += 35;

  /* ═══════════════════════════════════════════════════════════════════
     FOOTER — every page
  ═══════════════════════════════════════════════════════════════════ */
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    pageFooter(doc, `${i} of ${totalPages}`, timestamp);
  }

  /* ── Save ── */
  doc.save(`NC-DIAGNOSTIC-${id}.pdf`);
}
