import { jsPDF } from 'jspdf';
import { getLeakDisplay } from './leakDisplay';
import { getDetectedPath } from './leakPath';

/* ═══════════════════════════════════════════════════════════════
   COLOUR PALETTE
═══════════════════════════════════════════════════════════════ */
const CAT_YELLOW     = [255, 205, 17];
const CAT_BLACK      = [17, 17, 17];
const GRAY_DARK      = [60, 60, 60];
const GRAY_LIGHT     = [220, 220, 220];
const GRAY_BG        = [252, 248, 220];
const WHITE          = [255, 255, 255];
const GREEN          = [22, 163, 74];
const GREEN_LIGHT    = [220, 252, 231];
const ORANGE         = [234, 88, 12];
const RED            = [220, 38, 38];
const RED_LIGHT      = [254, 202, 202];
const BLUE_LINK      = [37, 99, 235];

/* ═══════════════════════════════════════════════════════════════
   PAGE GEOMETRY
═══════════════════════════════════════════════════════════════ */
const PAGE_W    = 210;
const PAGE_H    = 297;
const MARGIN    = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

/* ═══════════════════════════════════════════════════════════════
   LOW-LEVEL HELPERS
═══════════════════════════════════════════════════════════════ */
const sf = (doc, rgb) => doc.setFillColor(...rgb);
const sd = (doc, rgb) => doc.setDrawColor(...rgb);
const st = (doc, rgb) => doc.setTextColor(...rgb);

function cleanValue(value, fallback = '—') {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text && !['-', '—', 'N/A', 'NA', 'None', 'null', 'undefined'].includes(text)
    ? text
    : fallback;
}

function formatNumber(value) {
  if (value === undefined || value === null || value === '') return '—';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/\.?0+$/, '');
}

function txt(doc, text, x, y, opts = {}) {
  const {
    color = GRAY_DARK, font = 'helvetica', style = 'normal',
    size = 8, align = 'left', maxWidth,
  } = opts;
  st(doc, color);
  doc.setFont(font, style);
  doc.setFontSize(size);
  const args = [String(text), x, y];
  const options = {};
  if (align !== 'left') options.align = align;
  if (maxWidth) options.maxWidth = maxWidth;
  doc.text(...args, Object.keys(options).length ? options : undefined);
}

function checkPage(doc, y, needed, timestamp) {
  if (y + needed > PAGE_H - 18) {
    drawPageFooter(doc, doc.internal.getNumberOfPages(), timestamp);
    doc.addPage();
    return MARGIN + 2;
  }
  return y;
}

/* ═══════════════════════════════════════════════════════════════
   PAGE HEADER  (matches image: logo left, title centre, info right)
═══════════════════════════════════════════════════════════════ */
function drawPageHeader(doc, reportId, timestamp, engineModel) {
  // White background strip
  sf(doc, WHITE); doc.rect(0, 0, PAGE_W, 38, 'F');

  // ── NovaCrafters Logo (left)
  const logoX = MARGIN;
  const logoY = 6;
  sf(doc, CAT_BLACK); sd(doc, CAT_BLACK); doc.setLineWidth(0);
  doc.roundedRect(logoX, logoY, 46, 12, 1, 1, 'F');
  // Yellow chevron
  sf(doc, CAT_YELLOW);
  doc.lines([[3, -8], [6, 0], [-3, 8], [-3, 0]], logoX + 5, logoY + 11);
  doc.fill();
  // Wordmark
  txt(doc, 'NOVACRAFTERS', logoX + 12, logoY + 7.5,
    { color: WHITE, style: 'bold', size: 6.5 });
  // Yellow underline
  sf(doc, CAT_YELLOW); doc.rect(logoX + 12, logoY + 9.5, 30, 0.8, 'F');

  // ── Title (centre)
  txt(doc, 'AUTOMATED INTAKE AND EXHAUST', PAGE_W / 2, 11,
    { color: CAT_BLACK, style: 'bold', size: 11, align: 'center' });
  txt(doc, 'AIR LEAK DIAGNOSTIC REPORT', PAGE_W / 2, 18,
    { color: CAT_BLACK, style: 'bold', size: 11, align: 'center' });

  // ── Subtitle tagline
  txt(doc, 'NovaCrafters Engine Diagnostics Platform  |  Confidential Service Document',
    PAGE_W / 2, 24.5,
    { color: BLUE_LINK, style: 'normal', size: 6.5, align: 'center' });

  // ── Report info (top-right)
  const rx = PAGE_W - MARGIN;
  txt(doc, `Report ID: ${reportId || '—'}`, rx, 8, { color: GRAY_DARK, style: 'normal', size: 6.8, align: 'right' });
  txt(doc, `Date: ${timestamp || '—'}`, rx, 13, { color: GRAY_DARK, style: 'normal', size: 6.8, align: 'right' });
  txt(doc, `Engine: Caterpillar ${engineModel || '—'}`, rx, 18, { color: GRAY_DARK, style: 'normal', size: 6.8, align: 'right' });

  // ── Thick yellow separator line
  sf(doc, CAT_YELLOW); doc.rect(0, 31, PAGE_W, 2.5, 'F');

  return 38;
}

/* ═══════════════════════════════════════════════════════════════
   PAGE FOOTER
═══════════════════════════════════════════════════════════════ */
function drawPageFooter(doc, pageNum, timestamp) {
  const y = PAGE_H - 11;
  sf(doc, CAT_BLACK); doc.rect(0, y - 2, PAGE_W, 13, 'F');
  sf(doc, CAT_YELLOW); doc.rect(0, y - 2, PAGE_W, 1.2, 'F');
  txt(doc, `NovaCrafters  |  Intake & Exhaust Air Leak Detection  |  v2.0  |  Generated: ${timestamp}`,
    MARGIN, y + 4, { color: WHITE, size: 6.2, maxWidth: PAGE_W - MARGIN * 2 - 30 });
  txt(doc, `Page ${pageNum}`, PAGE_W - MARGIN, y + 4,
    { color: CAT_YELLOW, style: 'bold', size: 7, align: 'right' });
}

/* ═══════════════════════════════════════════════════════════════
   SECTION BAR  (black bar with yellow accent)
═══════════════════════════════════════════════════════════════ */
function sectionBar(doc, y, num, label) {
  const BAR_H = 10;
  sf(doc, CAT_BLACK); doc.rect(MARGIN, y, CONTENT_W, BAR_H, 'F');
  sf(doc, CAT_YELLOW); doc.rect(MARGIN, y, 3.5, BAR_H, 'F');
  txt(doc, num, MARGIN + 8, y + 6.8, { color: CAT_YELLOW, style: 'bold', size: 7 });
  txt(doc, label.toUpperCase(), MARGIN + 20, y + 6.8, { color: WHITE, style: 'bold', size: 7.5 });
  return y + BAR_H;
}

/* ═══════════════════════════════════════════════════════════════
   VERDICT BOX  (GO green / NON-GO red)
═══════════════════════════════════════════════════════════════ */
function verdictBox(doc, y, isGo, leakLocation) {
  const bg     = isGo ? GREEN_LIGHT : RED_LIGHT;
  const border = isGo ? GREEN       : RED;
  const label  = isGo ? 'GO — SYSTEM CLEAR' : 'NON-GO — LEAK DETECTED';
  const detail = isGo
    ? 'No significant intake or exhaust air leak detected. All parameters within acceptable operating limits.'
    : `Potential air leak detected in engine air pathway. Immediate maintenance action required. Location: ${leakLocation}`;

  sf(doc, bg); sd(doc, border); doc.setLineWidth(1.2);
  doc.roundedRect(MARGIN, y, CONTENT_W, 22, 2, 2, 'FD');

  txt(doc, label, MARGIN + 5, y + 9, { color: border, style: 'bold', size: 13 });
  const detailLines = doc.splitTextToSize(detail, CONTENT_W - 12);
  txt(doc, detailLines.join('\n'), MARGIN + 5, y + 15.5, { color: GRAY_DARK, size: 7.5 });
  return y + 26;
}

/* ═══════════════════════════════════════════════════════════════
   KV ROW  (label | bold value, alternating shade)
═══════════════════════════════════════════════════════════════ */
function kvRow(doc, x, y, w, label, value, shade, valueColor) {
  const labelW  = w * 0.46;
  const valueX  = x + labelW;
  const valueW  = w - labelW - 2;
  const valLines = doc.splitTextToSize(String(value), valueW - 3);
  const ROW_H   = Math.max(8, 3.8 + valLines.length * 3.4);

  if (shade) { sf(doc, GRAY_BG); } else { sf(doc, WHITE); }
  sd(doc, GRAY_LIGHT); doc.setLineWidth(0.2);
  doc.rect(x, y, w, ROW_H, 'FD');

  const labelY = y + ROW_H / 2 + 1.5;
  txt(doc, label, x + 2, labelY, { color: GRAY_DARK, size: 7 });
  
  const startY = y + (ROW_H - (valLines.length - 1) * 3.4) / 2 + 1.5;
  txt(doc, valLines.join('\n'), valueX + 2, startY, { color: valueColor || CAT_BLACK, style: 'bold', size: 7 });
  
  return ROW_H;
}

/* ═══════════════════════════════════════════════════════════════
   TABLE HEADER ROW
═══════════════════════════════════════════════════════════════ */
function tableHeader(doc, y, headers, widths) {
  const ROW_H = 8.5;
  sf(doc, CAT_YELLOW); sd(doc, CAT_BLACK); doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'FD');
  let x = MARGIN;
  headers.forEach((h, i) => {
    txt(doc, h, x + 2, y + 5.5, { color: CAT_BLACK, style: 'bold', size: 7 });
    x += widths[i];
  });
  return y + ROW_H;
}

/* ═══════════════════════════════════════════════════════════════
   SENSOR TABLE ROW  (3 cols: name | measured | unit)
   colorType: 'GREEN' or 'RED' controls measured colour
═══════════════════════════════════════════════════════════════ */
function sensorTableRow(doc, y, cols, shade, widths) {
  // cols = [name, measured, unit, _normalRange, colorType]
  const [name, measured, unit, , colorType] = cols;
  const displayCols = [name, measured, unit];
  const ROW_H = 7.5;

  if (shade) { sf(doc, GRAY_BG); } else { sf(doc, WHITE); }
  sd(doc, GRAY_LIGHT); doc.setLineWidth(0.2);
  doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'F');
  sd(doc, GRAY_LIGHT);
  doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'S');

  let x = MARGIN;
  displayCols.forEach((cell, i) => {
    let color = GRAY_DARK;
    let style = 'normal';
    const size = 7;

    if (i === 1) {
      // MEASURED column — colour green (healthy) or red (leak sensor)
      color = colorType === 'RED' ? RED : GREEN;
      style = 'bold';
    }

    txt(doc, String(cell), x + 2, y + 4.8, { color, style, size });
    x += widths[i];
  });

  return y + ROW_H;
}

/* ═══════════════════════════════════════════════════════════════
   C15 SENSOR DEFINITIONS
   Each entry: { name, label, unit, normalRange, leakSections[] }
═══════════════════════════════════════════════════════════════ */
const C15_SENSORS = [
  {
    name: 'Filter_DeltaP',
    label: 'Filter DeltaP',
    unit: 'kPa',
    normalRange: '0.5–3.5',
    leakSections: ['Air Filter to MAF Sensor'],
  },
  {
    name: 'Turbo_Inlet_Pressure',
    label: 'Turbo Inlet Pressure',
    unit: 'kPa',
    normalRange: '95–105',
    leakSections: ['MAF Sensor to Turbocharger Compressor Inlet'],
  },
  {
    name: 'Turbo_Speed',
    label: 'Turbo Speed',
    unit: 'RPM',
    normalRange: '20000–120000',
    leakSections: ['MAF Sensor to Turbocharger Compressor Inlet'],
  },
  {
    name: 'Compressor_Outlet_Pressure',
    label: 'Compressor Outlet Pressure',
    unit: 'kPa',
    normalRange: '120–250',
    leakSections: ['Compressor Outlet to Charge Air Cooler'],
  },
  {
    name: 'Compressor_Outlet_Temperature',
    label: 'Compressor Outlet Temp',
    unit: '°C',
    normalRange: '100–200',
    leakSections: ['Compressor Outlet to Charge Air Cooler'],
  },
  {
    name: 'MAP',
    label: 'MAP',
    unit: 'kPa',
    normalRange: '100–220',
    leakSections: ['Charge Air Cooler (CAC) to Intake Manifold'],
  },
  {
    name: 'MAT',
    label: 'MAT',
    unit: '°C',
    normalRange: '20–60',
    leakSections: ['Charge Air Cooler (CAC) to Intake Manifold'],
  },
  {
    name: 'Turbine_Inlet_Pressure',
    label: 'Turbine Inlet Pressure',
    unit: 'kPa',
    normalRange: '100–350',
    leakSections: ['Cylinder to Turbocharger Turbine Inlet'],
  },
  {
    name: 'DOC_Inlet_EGT',
    label: 'DOC Inlet EGT',
    unit: '°C',
    normalRange: '200–600',
    leakSections: ['Diesel Oxidation Catalyst'],
  },
  {
    name: 'DOC_Outlet_EGT',
    label: 'DOC Outlet EGT',
    unit: '°C',
    normalRange: '200–620',
    leakSections: ['Diesel Oxidation Catalyst'],
  },
  {
    name: 'DPF_DeltaP',
    label: 'DPF DeltaP',
    unit: 'kPa',
    normalRange: '0–10',
    leakSections: ['Diesel Particulate Filter'],
  },
  {
    name: 'DPF_EGT',
    label: 'DPF EGT',
    unit: '°C',
    normalRange: '200–650',
    leakSections: ['Diesel Particulate Filter'],
  },
  {
    name: 'NOx',
    label: 'NOx',
    unit: 'ppm',
    normalRange: '0–500',
    leakSections: ['Selective Catalytic Reduction'],
  },
];

function buildC15SensorRows(inputs, report, isGo) {
  const leakSection = report.leak_section || '';
  return C15_SENSORS.map(s => {
    const rawVal = inputs?.[s.name] ?? report?.[s.name];
    const measured = formatNumber(rawVal);
    const isLeakSensor = !isGo && s.leakSections.includes(leakSection);
    const colorType = isLeakSensor ? 'RED' : 'GREEN';
    return [s.label, measured, s.unit, s.normalRange, colorType];
  });
}

/* ═══════════════════════════════════════════════════════════════
   RECOMMENDATIONS BULLET LINE
═══════════════════════════════════════════════════════════════ */
function checkLine(doc, y, text, color) {
  const c = color || GREEN;
  sf(doc, c); doc.circle(MARGIN + 3, y + 1.8, 1.5, 'F');
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2);
  const lines = doc.splitTextToSize(text, CONTENT_W - 12);
  doc.text(lines, MARGIN + 8, y + 3);
  return y + lines.length * 4.4 + 2;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */
export function generateDiagnosticPDF(report, currentUser, options = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setFont('helvetica');

  /* ── Destructure report ── */
  const {
    id,
    timestamp,
    status    = report.go_nogo   || 'GO',
    confidence = 0,
    recommendations = [],
    inputs     = {},
    engineModel,
    engineFamily,
    engineFamilyLabel,
    engineVersion,
    engineVersionLabel,
    variant,
    manufacturingYear,
    manufacturingYears,
    engineConfig,
    turboConfig,
    technician,
  } = report;

  const prediction  = report.leak_section || report.prediction || 'No Leak';
  const riskLevel   = report.riskLevel   || report.severity    || 'Low';
  const safeRisk    = riskLevel || 'Low';
  const isGo        = status === 'GO' || prediction === 'No Leak' || prediction === 'Healthy';
  const leakDisplay = getLeakDisplay(prediction, riskLevel);
  const operator    = technician || currentUser?.fullName || 'N/A';
  const leakSection = report.leak_section || (isGo ? '—' : prediction);
  const leakLocation = isGo
    ? 'No leak location identified'
    : cleanValue(report.leakLocation || report.detectedLocation || report.leak_section || prediction);
  const sevColor = safeRisk === 'Critical' ? RED
    : safeRisk === 'High'     ? ORANGE
    : safeRisk === 'Medium'   ? [161, 98, 7]
    : GREEN;

  /* ════════════════════════════════════════════════════════════
     PAGE 1 HEADER
  ════════════════════════════════════════════════════════════ */
  let y = drawPageHeader(doc, id, timestamp, engineModel);
  y += 4;

  /* ════════════════════════════════════════════════════════════
     SECTION 01 — ANALYSIS SUMMARY
  ════════════════════════════════════════════════════════════ */
  y = sectionBar(doc, y, '01', 'Analysis Summary');
  y += 4;

  // Verdict box
  y = verdictBox(doc, y, isGo, leakSection);
  y += 4;

  // 2-column summary grid
  const col1W = (CONTENT_W - 2) / 2;
  const col2X = MARGIN + col1W + 2;
  const col2W = CONTENT_W - col1W - 2;

  const displayLeakSection = isGo ? 'No Leak' : leakSection;
  const displayDetectedPath = (() => {
    if (isGo) return 'Healthy';
    const ls = (leakSection || '').toLowerCase();
    if (ls.includes('intake') || ls.includes('compressor') || ls.includes('air filter') || ls.includes('maf') || ls.includes('charge air')) {
      return 'Intake Path';
    }
    if (ls.includes('exhaust') || ls.includes('turbine') || ls.includes('doc') || ls.includes('dpf') || ls.includes('scr') || ls.includes('diesel') || ls.includes('catalytic')) {
      return 'Exhaust Path';
    }
    return 'Unknown Path';
  })();

  const leftRows = [
    ['Diagnosis Result', isGo ? 'SYSTEM CLEAR' : 'LEAK DETECTED', false, CAT_BLACK],
    ['System Status',    status,                                   true,  CAT_BLACK],
    ['Leak Section',     displayLeakSection,                       false, isGo ? GREEN : ORANGE],
    ['Confidence Score', `${confidence}%`,                        true,  CAT_BLACK],
  ];

  const rightRows = [
    ['Risk Level',        leakDisplay.isNil ? 'No risk' : safeRisk, false, sevColor],
    ['Detected Path',     displayDetectedPath,                      true,  isGo ? GREEN : ORANGE],
    ['Analysis Time',     timestamp || '—',                         false, CAT_BLACK],
    ['Technician',        operator,                                 true,  CAT_BLACK],
  ];

  let lY = y; let rY = y;
  leftRows.forEach(([label, value, shade, vColor]) => {
    lY += kvRow(doc, MARGIN, lY, col1W, label, value, shade, vColor);
  });
  rightRows.forEach(([label, value, shade, vColor]) => {
    rY += kvRow(doc, col2X, rY, col2W, label, value, shade, vColor);
  });
  y = Math.max(lY, rY) + 5;

  /* ════════════════════════════════════════════════════════════
     SECTION 02 — ENGINE IDENTIFICATION
  ════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 60, timestamp);
  y = sectionBar(doc, y, '02', 'Engine Identification');
  y += 3;

  const engineFamilyDisplay = engineFamilyLabel ||
    (engineModel === 'C15' ? 'Caterpillar C15' : engineModel === 'C7' ? 'Caterpillar C7' : engineFamily || engineModel || '—');

  const engRows = [
    ['Engine Family',           engineFamilyDisplay],
    ['Engine Version / Variant', cleanValue(engineVersionLabel || inputs?.engineVersionLabel || engineVersion || inputs?.engineVersion || variant, '—')],
    ['Manufacturing Year(s)',    cleanValue(manufacturingYears || inputs?.manufacturingYears || manufacturingYear || inputs?.manufacturingYear, '—')],
    ['Engine Configuration',     cleanValue(engineConfig  || inputs?.engineConfig,  '—')],
    ['Turbo Configuration',      cleanValue(turboConfig   || inputs?.turboConfig,   '—')],
  ];
  engRows.forEach(([label, value], i) => {
    y += kvRow(doc, MARGIN, y, CONTENT_W, label, value, i % 2 === 0, CAT_BLACK);
  });
  y += 5;

  /* ════════════════════════════════════════════════════════════
     SECTION 03 — SENSOR DATA ANALYSIS (3-SECOND CAPTURE WINDOW)
  ════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 30, timestamp);
  y = sectionBar(doc, y, '03', 'Sensor Data Analysis  (3-Second Capture Window)');
  y += 4;

  // Italic subtitle
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
  doc.text(
    'Sensor readings captured during the 3-second diagnostic window. Values compared against model-calibrated nominal ranges.',
    MARGIN, y,
  );
  y += 6;

  // 3-column widths: SENSOR PARAMETER | MEASURED | UNIT
  const colWidths3 = [110, 40, 32];

  if (engineModel === 'C15') {
    /* ── C15: 13 custom sensors, 3 columns only ── */
    y = tableHeader(doc, y, ['SENSOR PARAMETER', 'MEASURED', 'UNIT'], colWidths3);

    const c15Rows = buildC15SensorRows(inputs, report, isGo);
    c15Rows.forEach((row, idx) => {
      y = checkPage(doc, y, 8, timestamp);
      y = sensorTableRow(doc, y, row, idx % 2 === 0, colWidths3);
    });
    y += 5;
  } else {
    /* ── Other engines: generic 3-col sensor table ── */
    y = tableHeader(doc, y, ['SENSOR PARAMETER', 'MEASURED', 'UNIT'], colWidths3);
    const genericSensors = [
      { label: 'Engine RPM',              key: 'rpm',                     unit: 'RPM'  },
      { label: 'Fuel Rate',               key: 'fuel_rate',               unit: 'L/hr' },
      { label: 'Fuel Injection Time',     key: 'fuel_injection_time',     unit: 'ms'   },
      { label: 'Fuel Injection Pressure', key: 'fuel_injection_pressure',  unit: 'bar'  },
    ];
    genericSensors.forEach(({ label, key, unit }, idx) => {
      const val = formatNumber(inputs?.[key]);
      y = checkPage(doc, y, 8, timestamp);
      y = sensorTableRow(doc, y, [label, val, unit, '—', 'GREEN'], idx % 2 === 0, colWidths3);
    });
    y += 5;
  }

  // Recommendations section removed as per user request

  /* ════════════════════════════════════════════════════════════
     SECTION 04 — SIGNATURE BLOCK
  ════════════════════════════════════════════════════════════ */
  y = checkPage(doc, y, 30, timestamp);
  y = sectionBar(doc, y, '04', 'Authorisation & Sign-Off');
  y += 10;

  const sigW = (CONTENT_W - 10) / 2;
  // Technician
  sd(doc, GRAY_LIGHT); doc.setLineWidth(0.4);
  doc.line(MARGIN, y, MARGIN + sigW, y);
  txt(doc, 'Technician Signature', MARGIN + sigW / 2, y + 5, { color: GRAY_DARK, size: 7, align: 'center' });
  txt(doc, 'CONFIRMED VIA ENT-AUTH', MARGIN + sigW / 2, y + 9, { color: [180, 180, 180], style: 'italic', size: 6, align: 'center' });
  // Supervisor
  const s2X = MARGIN + sigW + 10;
  doc.line(s2X, y, s2X + sigW, y);
  txt(doc, 'Supervisor Signature', s2X + sigW / 2, y + 5, { color: GRAY_DARK, size: 7, align: 'center' });
  txt(doc, 'PENDING DIG-STAMP', s2X + sigW / 2, y + 9, { color: [180, 180, 180], style: 'italic', size: 6, align: 'center' });

  /* ════════════════════════════════════════════════════════════
     FOOTER — every page
  ════════════════════════════════════════════════════════════ */
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(doc, `${i} of ${totalPages}`, timestamp);
  }

  /* ── Save ── */
  const filename = `NC-DIAGNOSTIC-${id || 'REPORT'}.pdf`;
  doc.save(filename);
  const blob = doc.output('blob', { type: 'application/pdf' });
  if (options.onPdfReady) options.onPdfReady(blob, filename);
  return blob;
}
