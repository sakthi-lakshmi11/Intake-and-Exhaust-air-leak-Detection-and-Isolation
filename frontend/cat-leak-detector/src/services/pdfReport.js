import { jsPDF } from 'jspdf';
import { getLeakDisplay } from './leakDisplay';
import { getDetectedPath } from './leakPath';

/* ═══════════════════════════════════════════════════════════════════════════
   COLOUR PALETTE  — Caterpillar yellow / black / white
═══════════════════════════════════════════════════════════════════════════ */
const CAT_YELLOW = [255, 205, 17];   // #FFCD11  primary brand accent
const CAT_BLACK = [17, 17, 17];   // #111111  primary dark
const GRAY_DARK = [60, 60, 60];
const GRAY_MID = [120, 120, 120];
const GRAY_LIGHT = [220, 220, 220];
const GRAY_BG = [252, 248, 220];  // very light yellow tint for alt rows
const WHITE = [255, 255, 255];
const GREEN = [22, 163, 74];
const GREEN_LIGHT = [220, 252, 231];
const ORANGE = [234, 88, 12];
const RED = [220, 38, 38];
const RED_LIGHT = [254, 202, 202];

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE GEOMETRY
═══════════════════════════════════════════════════════════════════════════ */
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;


/* ═══════════════════════════════════════════════════════════════════════════
   LOW-LEVEL HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const sf = (doc, rgb) => doc.setFillColor(...rgb);
const sd = (doc, rgb) => doc.setDrawColor(...rgb);
const st = (doc, rgb) => doc.setTextColor(...rgb);

function cleanValue(value, fallback = 'Not provided in input') {
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

function labelForValue(value, map) {
  if (!value) return 'Not provided in input';
  const found = map.find((item) => item.value === value || item.label === value);
  return found?.label || value;
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function drawCell(doc, x, y, w, h, shade, borderColor = GRAY_LIGHT) {
  if (shade) { sf(doc, GRAY_BG); doc.rect(x, y, w, h, 'F'); }
  sd(doc, borderColor); doc.setLineWidth(0.2);
  doc.rect(x, y, w, h, 'S');
}

function drawWrappedCellText(doc, text, x, y, w, h, options = {}) {
  const {
    color = GRAY_DARK,
    font = 'helvetica',
    style = 'normal',
    size = 7.2,
    align = 'left',
    lineHeight = 3.4,
    padX = 2,
  } = options;
  const lines = doc.splitTextToSize(String(text), Math.max(w - padX * 2, 8));
  const textHeight = Math.min(lines.length * lineHeight, h - 2);
  const startY = align === 'middle' ? y + (h - textHeight) / 2 + 2.5 : y + 3;
  st(doc, color);
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.text(lines, x + padX, startY);
}

function sensorValueFrom(inputs, report, keys) {
  const sourceObjects = [inputs || {}, report || {}];
  for (const source of sourceObjects) {
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
  }
  return '—';
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function resolveFaultSensor(report, prediction, leakLocation) {
  const raw = firstValue(
    report?.faultSourceSensor,
    report?.faultSensor,
    report?.sourceSensor,
    report?.problematicSensor,
    report?.detectedSensor,
    report?.sensorFault,
    report?.sensorStatus?.faultSource,
  );

  const leakText = normalizeText([
    raw,
    prediction,
    leakLocation,
    report?.detectedPath,
    report?.leakPath,
    report?.leak_section,
  ].filter(Boolean).join(' '));

  if (!leakText) return '';
  if (leakText.includes('maf')) return 'MAF Sensor';
  if (leakText.includes('map') || leakText.includes('intake manifold')) return 'MAP Sensor';
  if (leakText.includes('boost') || leakText.includes('compressor') || leakText.includes('charge air cooler')) return 'Boost Pressure Sensor';
  if (leakText.includes('intake air temperature') || leakText.includes('iat')) return 'Intake Air Temperature Sensor';
  if (leakText.includes('exhaust pressure') || leakText.includes('exhaust back pressure') || leakText.includes('ebp')) return 'Exhaust Pressure Sensor';
  if (leakText.includes('exhaust temperature') || leakText.includes('exhaust gas temperature') || leakText.includes('egt')) return 'Exhaust Temperature Sensor';
  if (leakText.includes('turbo speed') || leakText.includes('turbo rpm')) return 'Turbo Speed Sensor';
  if (leakText.includes('ambient') || leakText.includes('baro')) return 'Ambient Pressure Sensor';
  if (leakText.includes('turbo') || leakText.includes('turbine')) return 'Turbo Speed Sensor';
  return '';
}

function resolveSensorStatus(sensorName, report, faultSensor, isGo) {
  const statuses = report?.sensorStatuses || report?.sensorStatus || {};
  const rawStatus = statuses[sensorName] || statuses[sensorName.replace(/ Sensor$/, '')] || statuses[sensorName.toLowerCase()];
  const status = String(rawStatus || '').toUpperCase();
  if (['ABNORMAL', 'WARNING', 'FAULT', 'LEAK'].includes(status)) return status === 'FAULT' ? 'ABNORMAL' : status;
  if (faultSensor === sensorName) return isGo ? 'WARNING' : 'ABNORMAL';
  return 'NORMAL';
}

function sensorUnitFor(sensorName) {
  if (sensorName.includes('Temperature')) return '°C';
  if (sensorName.includes('Turbo Speed')) return '%';
  if (sensorName.includes('MAF')) return 'kg/h';
  return 'bar';
}

/* ── Section bar — CAT yellow accent on black ── */
function sectionBar(doc, y, num, label) {
  const labelText = label.toUpperCase();
  st(doc, WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const lines = doc.splitTextToSize(labelText, CONTENT_W - 26);
  const barH = Math.max(9, 4 + lines.length * 3.8);

  sf(doc, CAT_BLACK); doc.rect(MARGIN, y, CONTENT_W, barH, 'F');
  sf(doc, CAT_YELLOW); doc.rect(MARGIN, y, 3, barH, 'F');

  st(doc, CAT_YELLOW); doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
  doc.text(num, MARGIN + 7, y + barH / 2 + 2.5);

  st(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
  lines.forEach((line, i) => doc.text(line, MARGIN + 19, y + 6.3 + i * 3.8));
  return y + barH;
}

/* ── Key-value row with wrapped values ── */
function kvRow(doc, y, label, value, shade, valueColor) {
  const labelW = 68;
  const valueW = CONTENT_W - labelW;
  const lines = doc.splitTextToSize(String(value), valueW - 6);
  const ROW_H = Math.max(8, 3.8 + lines.length * 3.6);
  drawCell(doc, MARGIN, y, CONTENT_W, ROW_H, shade);
  drawWrappedCellText(doc, label, MARGIN, y, labelW, ROW_H, {
    color: GRAY_DARK,
    style: 'normal',
    size: 7.2,
  });
  drawWrappedCellText(doc, value, MARGIN + labelW, y, valueW, ROW_H, {
    color: valueColor || CAT_BLACK,
    style: 'bold',
    size: 7.2,
    align: 'middle',
  });
  return y + ROW_H;
}

/* ── 4-column wrapped sensor table row ── */
function sensorRow(doc, y, cols, shade, widths) {
  const xs = widths.reduce((acc, w, i) => {
    acc.push((acc[i - 1] || MARGIN) + (i ? widths[i - 1] : 0));
    return acc;
  }, []);
  xs[0] = MARGIN;
  for (let i = 1; i < widths.length; i++) xs[i] = xs[i - 1] + widths[i - 1];

  const lineSets = cols.map((text, i) => doc.splitTextToSize(String(text), Math.max(widths[i] - 4, 8)));
  const ROW_H = Math.max(8, 3 + Math.max(...lineSets.map((lines) => lines.length * 3.4)));

  drawCell(doc, MARGIN, y, CONTENT_W, ROW_H, shade);

  lineSets.forEach((lines, i) => {
    const isStatus = i === 3;
    const status = lines[0]?.toUpperCase();
    const color = isStatus
      ? status === 'ABNORMAL' || status === 'WARNING' ? RED : GREEN
      : GRAY_DARK;
    drawWrappedCellText(doc, lines.join('\n'), xs[i], y, widths[i], ROW_H, {
      color,
      style: isStatus ? 'bold' : 'normal',
      size: isStatus ? 7.2 : 6.8,
      align: 'middle',
    });
  });
  return y + ROW_H;
}

/* ── Column header row with wrapped labels ── */
function tableHeader(doc, y, headers, widths) {
  const ROW_H = 8;
  sf(doc, CAT_YELLOW); sd(doc, CAT_BLACK);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'FD');
  let x = MARGIN;
  headers.forEach((h, i) => {
    drawWrappedCellText(doc, h, x, y, widths[i], ROW_H, {
      color: CAT_BLACK,
      style: 'bold',
      size: 7.2,
      align: 'middle',
    });
    x += widths[i];
  });
  return y + ROW_H;
}

/* ── Status verdict box (GO / NON-GO) ── */
function verdictBox(doc, y, isGo, leakLocation) {
  const bg = isGo ? GREEN_LIGHT : RED_LIGHT;
  const border = isGo ? GREEN : RED;
  const label = isGo ? 'GO — SYSTEM CLEAR' : 'NON-GO — LEAK DETECTED';
  const detail = isGo
    ? 'No significant intake or exhaust air leak detected. All parameters within acceptable operating limits.'
    : `Potential air leak detected in engine air pathway. Immediate maintenance action required. Location: ${leakLocation}`;

  sf(doc, bg); sd(doc, border); doc.setLineWidth(1);
  doc.roundedRect(MARGIN, y, CONTENT_W, 24, 2, 2, 'FD');

  st(doc, border); doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text(label, MARGIN + 5, y + 9);

  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  const lines = doc.splitTextToSize(detail, CONTENT_W - 10);
  doc.text(lines, MARGIN + 5, y + 16);
  return y + 28;
}

/* ── Bullet line ── */
function checkLine(doc, y, text, color) {
  const c = color || GREEN;
  sf(doc, c); doc.circle(MARGIN + 3, y + 1.8, 1.5, 'F');
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2);
  const lines = doc.splitTextToSize(text, CONTENT_W - 12);
  doc.text(lines, MARGIN + 8, y + 3);
  return y + lines.length * 4.4 + 2;
}

/* ── NovaCrafters logo — compact CAT-style: black plate, yellow triangle, white wordmark ── */
function drawNCLogo(doc, x, y) {
  sf(doc, CAT_BLACK); sd(doc, CAT_BLACK); doc.setLineWidth(0);
  doc.roundedRect(x, y, 44, 10, 1, 1, 'F');

  sf(doc, CAT_YELLOW);
  doc.lines([[2.5, -7], [5, 0], [-2.5, 7], [-2.5, 0]], x + 4.5, y + 9);
  doc.fill();

  sf(doc, CAT_YELLOW); doc.rect(x + 10, y + 8.2, 32, 1, 'F');
  st(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
  doc.text('NOVACRAFTERS', x + 10, y + 6.8);
}

/* ── Page footer — CAT yellow/black theme ── */
function pageFooter(doc, pageNum, timestamp) {
  const y = PAGE_H - 11;
  sf(doc, CAT_BLACK); doc.rect(0, y - 3, PAGE_W, 14, 'F');
  sf(doc, CAT_YELLOW); doc.rect(0, y - 3, PAGE_W, 1.5, 'F');

  st(doc, WHITE); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
  const footerText = `NovaCrafters | Intake & Exhaust Air Leak Detection | v2.0 | Generated: ${timestamp}`;
  doc.text(footerText, MARGIN, y + 3, { maxWidth: PAGE_W - MARGIN * 2 - 34 });

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
   SENSOR DATA  — primary diagnostic sensors only
═══════════════════════════════════════════════════════════════════════════ */
const ENGINE_FAMILY_LABELS = [
  { value: 'C7', label: 'Caterpillar C7' },
  { value: 'C15', label: 'Caterpillar C15' },
];

const ENGINE_VERSION_LABELS = [
  { value: 'c7_acert', label: 'C7 ACERT' },
  { value: 'c7_acert_t4i', label: 'C7 ACERT Tier 4 Interim' },
  { value: 'c7_acert_t4f', label: 'C7 ACERT Tier 4 Final' },
  { value: 'c7_acert_2020', label: 'C7 ACERT (2020 Series)' },
  { value: 'c15_acert', label: 'C15 ACERT' },
  { value: 'c15_acert_t4i', label: 'C15 ACERT Tier 4 Interim' },
  { value: 'c15_acert_t4f', label: 'C15 ACERT Tier 4 Final' },
  { value: 'c15_acert_2020', label: 'C15 ACERT (2020 Series)' },
];

const ENGINE_CONFIG_LABELS = [
  { value: 'turbocharged', label: 'Turbocharged Diesel Engine' },
  { value: 'industrial', label: 'Industrial Diesel Engine' },
  { value: 'generator', label: 'Generator Diesel Engine' },
  { value: 'heavyduty', label: 'Heavy Duty Industrial Engine' },
];

const TURBO_CONFIG_LABELS = [
  { value: 'ta', label: 'TA (Turbocharged Aftercooled)' },
  { value: 'ataac', label: 'ATAAC (Air-To-Air Aftercooled)' },
  { value: 'standard', label: 'Standard Configuration' },
  { value: 'highoutput', label: 'High Output Configuration' },
];

const SENSOR_DEFINITIONS = [
  {
    name: 'MAP Sensor',
    keys: ['map', 'mapSensor', 'mapSensorValue', 'mapPressure', 'intakeManifoldPressure', 'intake_manifold_pressure'],
  },
  {
    name: 'MAF Sensor',
    keys: ['maf', 'mafSensor', 'mafSensorValue', 'airFlow', 'airFlowMaf', 'massAirFlow', 'mass_air_flow'],
  },
  {
    name: 'Boost Pressure Sensor',
    keys: ['boost', 'boostPressure', 'boostPressureSensor', 'boostSensor'],
  },
  {
    name: 'Intake Air Temperature Sensor',
    keys: ['iat', 'intakeAirTemperature', 'intakeAirTemperatureSensor', 'iatSensor', 'intakeTemp', 'intake_air_temperature'],
  },
  {
    name: 'Exhaust Pressure Sensor',
    keys: ['exhaustPressure', 'exhaustBackPressure', 'ebp', 'exhaustPressureSensor', 'ebpSensor', 'exhaust_pressure'],
  },
  {
    name: 'Exhaust Temperature Sensor',
    keys: ['egt', 'exhaustGasTemperature', 'exhaustTemperature', 'exhaustTemperatureSensor', 'egtSensor', 'exhaust_temperature'],
  },
  {
    name: 'Turbo Speed Sensor',
    keys: ['turboSpeed', 'turboSpeedSensor', 'turboRpm', 'turbo_speed'],
  },
  {
    name: 'Ambient Pressure Sensor',
    keys: ['ambientPressure', 'ambientPressureSensor', 'baroPressure', 'barometricPressure', 'ambient', 'ambient_pressure'],
  },
];

function buildSensorRows(report, inputs, prediction, status) {
  const faultSensor = resolveFaultSensor(report, prediction, report.leakLocation || report.detectedLocation || report.detectedPath);
  const isGo = status === 'GO' || prediction === 'No Leak' || prediction === 'Healthy';

  return SENSOR_DEFINITIONS.map((sensor) => {
    const value = sensorValueFrom(inputs, report, sensor.keys);
    const status = resolveSensorStatus(sensor.name, report, faultSensor, isGo);
    return [
      sensor.name,
      formatNumber(value),
      sensorUnitFor(sensor.name),
      status,
    ];
  });
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
  const hasIntake = !isGo && (prediction === 'Intake Leak' || prediction === 'Combined Leak');
  const hasExhaust = !isGo && (prediction === 'Exhaust Leak' || prediction === 'Combined Leak');

  const DIAG_H = 88;  // taller panel so all labels + status text fit without clipping
  const cx = PAGE_W / 2;
  const eW = 48;  // slightly narrower engine block to leave room for manifold labels

  // ── Background grid panel
  sf(doc, [242, 242, 242]); sd(doc, GRAY_LIGHT); doc.setLineWidth(0.2);
  doc.rect(MARGIN, y, CONTENT_W, DIAG_H, 'FD');

  // ── Helper: zone colour
  const zoneColor = (leaking) => leaking ? RED : (isGo ? GREEN : [180, 180, 180]);
  const zoneBg = (leaking) => leaking ? RED_LIGHT : (isGo ? GREEN_LIGHT : [220, 220, 220]);

  // ── Air filter
  sf(doc, [210, 210, 210]); sd(doc, [80, 80, 80]); doc.setLineWidth(0.7);
  doc.roundedRect(MARGIN + 2, y + 20, 11, 24, 1, 1, 'FD');
  st(doc, [80, 80, 80]); doc.setFont('helvetica', 'bold'); doc.setFontSize(4.5);
  doc.text('AIR', MARGIN + 7.5, y + 30, { align: 'center' });
  doc.text('FILT', MARGIN + 7.5, y + 35, { align: 'center' });

  // ── Turbocharger compressor (left, intake side)
  const tcColor = zoneColor(hasIntake);
  const tcBg = zoneBg(hasIntake);
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
  const ttBg = zoneBg(hasExhaust);
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
  const statusColor = isGo ? GREEN : RED;
  const statusLabel = isGo
    ? 'NO LEAK DETECTED  —  ALL SYSTEMS NOMINAL'
    : `${prediction.toUpperCase()}  DETECTED  —  MAINTENANCE REQUIRED`;
  st(doc, statusColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
  doc.text(statusLabel, cx, y + DIAG_H - 14, { align: 'center' });

  // ── Colour key — last line inside panel
  const keyY = y + DIAG_H - 7;
  sf(doc, GREEN); doc.circle(MARGIN + 4, keyY, 1.8, 'F');
  st(doc, GRAY_DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5);
  doc.text('NORMAL', MARGIN + 8, keyY + 1);
  sf(doc, ORANGE); doc.circle(MARGIN + 30, keyY, 1.8, 'F');
  doc.text('WARNING', MARGIN + 34, keyY + 1);
  sf(doc, RED); doc.circle(MARGIN + 58, keyY, 1.8, 'F');
  doc.text('LEAK / ABNORMAL', MARGIN + 62, keyY + 1);

  return y + DIAG_H + 4;
}

/* ════════════════════════════════════════════════════════�// Removed corrupted summary grid and diagram code
'!', cx + eW + 14, y + 35, { align: 'center' });
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
export function generateDiagnosticPDF(report, currentUser, options = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setFont('helvetica');

  /* ── Destructure report ── */
const {
  id,
  timestamp,
  prediction = report.leak_section || 'No Leak',
  status = report.go_nogo || 'GO',
  confidence = 0,
  riskLevel = report.riskLevel || report.severity || 'Low',
  recommendations = [],
  inputs = {},
  engineModel,
  engineFamily,
  engineFamilyLabel,
  engineVersion,
  engineVersionLabel,
  variant,
  manufacturingYear,
  manufacturingYears,
  technician,
} = report;

const safeRisk = riskLevel || 'Low';
const isGo = status === 'GO' || prediction === 'No Leak' || prediction === 'Healthy';
const leakDisplay = getLeakDisplay(prediction, riskLevel);
const operator = technician || currentUser?.fullName || 'N/A';
const engineFamilyValue = engineFamily || inputs?.engineFamily || engineModel || 'Not provided in input';
const engine = cleanValue(engineFamilyLabel || inputs?.engineFamilyLabel || engineFamilyValue);
const detectedLeakPath = isGo
  ? 'No leak path identified'
  : getDetectedPath(report.leakLocation || report.detectedLocation || report.leak_section || prediction);
const leakLocation = cleanValue(
  isGo ? undefined : report.leakLocation || report.detectedLocation || report.detectedPath || report.leakSection,
  isGo ? 'No leak location identified' : detectedLeakPath
);
const detectedLeakLocation = cleanValue(
  isGo ? undefined : report.detectedLocation || report.leakLocation,
  isGo ? 'No leak location identified' : leakLocation
);
const dynamicRecs = getRecommendations(prediction, isGo);

/* ── Colour helpers ── */
const sevColor = safeRisk === 'Critical' ? RED
  : safeRisk === 'High' ? ORANGE
    : safeRisk === 'Medium' ? [161, 98, 7]
      : GREEN;

let y = MARGIN;

/* ── PAGE HEADER — white bg, CAT yellow/black/white theme ── */
sf(doc, WHITE); doc.rect(0, 0, PAGE_W, 36, 'F');

/* ═══════════════════════════════════════════════════════════════════
   SECTION 01 — ANALYSIS SUMMARY
═══════════════════════════════════════════════════════════════════ */
y = sectionBar(doc, y, '01', 'Analysis Summary');
y += 3;

// Verdict box
y = verdictBox(doc, y, isGo, leakLocation);
y += 3;

// Summary grid — wrapped cells prevent detected path truncation
const col1W = CONTENT_W / 2 - 1;
const col2X = MARGIN + col1W + 2;
const summaryLeft = [
  ['Diagnosis Result', isGo ? 'SYSTEM CLEAR' : 'LEAK DETECTED'],
  ['System Status', `${status}`],
  ['Leak Status', leakDisplay.leakLabel],
  ['Confidence Score', `${confidence}%`],
  ['Detected Path', detectedLeakPath],
];
const summaryRight = [
  ['Risk Level', leakDisplay.isNil ? 'No risk' : safeRisk],
  ['Detected Location', leakDisplay.isNil ? 'No leak location identified' : leakLocation],
  ['Analysis Time', timestamp],
  ['Technician', operator],
];

const summaryCell = (x, y, w, label, value, shade, valueColor) => {
  const valueStart = x + Math.min(72, w * 0.42);
  const valueW = w - (valueStart - x) - 2;
  const valueLines = doc.splitTextToSize(String(value), Math.max(valueW - 4, 10));
  const rowH = Math.max(8, 3.6 + valueLines.length * 3.4);
  drawCell(doc, x, y, w, rowH, shade);
  drawWrappedCellText(doc, label, x, y, valueStart - x, rowH, {
    color: GRAY_DARK,
    style: 'normal',
    size: 7,
    align: 'middle',
  });
  drawWrappedCellText(doc, value, valueStart, y, valueW, rowH, {
    color: valueColor,
    style: 'bold',
    size: 7,
  });
  return rowH;
};
// Render summary left column
let leftEndY = y;
summaryLeft.forEach(([k, v], i) => {
  const isRisk = k === 'Risk Level';
  const vColor = isRisk ? sevColor : CAT_BLACK;
  leftEndY += summaryCell(MARGIN, leftEndY, col1W, k, v, i % 2 === 0, vColor);
});
// Render summary right column
let rightEndY = y;
summaryRight.forEach(([k, v], i) => {
  const isRisk = k === 'Risk Level';
  const vColor = isRisk ? sevColor : CAT_BLACK;
  const col2W = CONTENT_W - col1W - 2;
  rightEndY += summaryCell(col2X, rightEndY, col2W, k, v, i % 2 === 0, vColor);
});
y = Math.max(leftEndY, rightEndY);
y += 3;

// SECTION 05 — LEAK LOCATION VISUALIZATION
y = drawEngineDiagram(doc, y, isGo, prediction, engineModel);
y += 5;

// SECTION 06 — SENSOR ANALYSIS
y = checkPage(doc, y, 30, timestamp);
y = sectionBar(doc, y, '06', 'Sensor Analysis');
y += 3;
const sensorHeaders = ['Sensor', 'Value', 'Units', 'Status'];
const sensorColWidths = [80, 30, 30, 30];
y = tableHeader(doc, y, sensorHeaders, sensorColWidths);
const sensorRows = buildSensorRows(report, inputs, prediction, status);
sensorRows.forEach((row, idx) => {
  y = sensorRow(doc, y, row, idx % 2 === 0, sensorColWidths);
});
y += 3;

// SECTION 07 — RECOMMENDATIONS
y = checkPage(doc, y, 60, timestamp);
y = sectionBar(doc, y, '07', 'Recommendations');
y += 3;
// Combine dynamic and static recommendations
const allRecs = [...(dynamicRecs || []), ...(recommendations || [])];
allRecs.forEach(rec => {
  const color = rec.toUpperCase().includes('GO') ? GREEN : RED;
  y = checkLine(doc, y, rec, color);
});
y += 5;
















/* ═══════════════════════════════════════════════════════════════════
   FOOTER — every page
═══════════════════════════════════════════════════════════════════ */
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  pageFooter(doc, `${i} of ${totalPages}`, timestamp);
}

/* ── Save ── */
const filename = `NC-DIAGNOSTIC-${id}.pdf`;
const blob = doc.output('blob', { type: 'application/pdf' });
doc.save(filename);
if (options.onPdfReady) options.onPdfReady(blob, filename);
return blob;
}
