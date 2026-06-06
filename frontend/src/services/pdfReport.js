import { jsPDF } from 'jspdf';

/* ── Constants ── */
const CAT_YELLOW = [255, 205, 17];   // #FFCD11
const CAT_BLACK  = [17, 17, 17];     // #111111
const GRAY_DARK  = [80, 80, 80];
const GRAY_MID   = [120, 120, 120];
const GRAY_LIGHT = [230, 230, 230];
const WHITE      = [255, 255, 255];
const GREEN      = [22, 163, 74];
const RED        = [220, 38, 38];

const PAGE_W      = 210;  // A4 width  mm
const PAGE_H      = 297;  // A4 height mm
const MARGIN      = 18;
const CONTENT_W   = PAGE_W - MARGIN * 2;

/* ── Helper: set fill + draw color from rgb array ── */
function setFill(doc, rgb)   { doc.setFillColor(...rgb); }
function setDraw(doc, rgb)   { doc.setDrawColor(...rgb); }
function setTextColor(doc, rgb) { doc.setTextColor(...rgb); }

/* ── Helper: draw horizontal rule ── */
function hRule(doc, y, color = GRAY_LIGHT, thickness = 0.4) {
  setDraw(doc, color);
  doc.setLineWidth(thickness);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

/* ── Helper: yellow section bar ── */
function sectionBar(doc, y, label) {
  setFill(doc, CAT_YELLOW);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  setTextColor(doc, CAT_BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(label.toUpperCase(), MARGIN + 3, y + 4.8);
  return y + 7;
}

/* ── Helper: key-value row inside a table ── */
function tableRow(doc, y, label, value, shade) {
  if (shade) {
    setFill(doc, [248, 248, 248]);
    doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  }
  setDraw(doc, GRAY_LIGHT);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'S');

  setTextColor(doc, GRAY_DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(String(label), MARGIN + 3, y + 4.8);

  setTextColor(doc, CAT_BLACK);
  doc.setFont('helvetica', 'bold');
  doc.text(String(value), MARGIN + 80, y + 4.8);

  return y + 7;
}

/* ── Helper: status badge box ── */
function statusBox(doc, y, isGo, prediction, location) {
  const color  = isGo ? GREEN : RED;
  const label  = isGo ? 'GO — SYSTEM CLEAR' : 'NON-GO — LEAK DETECTED';
  const detail = isGo
    ? 'No significant intake or exhaust air leak detected. Parameters within acceptable limits.'
    : `Potential air leak detected. Location: ${location}`;

  setFill(doc, color.map(c => Math.min(255, c + 210)));   // very light tint
  setDraw(doc, color);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, y, CONTENT_W, 20, 2, 2, 'FD');

  setTextColor(doc, color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(label, MARGIN + 4, y + 8);

  setTextColor(doc, GRAY_DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(detail, MARGIN + 4, y + 15);

  return y + 24;
}

/* ── Helper: bullet recommendation ── */
function bulletLine(doc, y, text) {
  setFill(doc, CAT_YELLOW);
  doc.circle(MARGIN + 2.5, y + 1.5, 1.2, 'F');

  setTextColor(doc, CAT_BLACK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const lines = doc.splitTextToSize(text, CONTENT_W - 12);
  doc.text(lines, MARGIN + 6, y + 3);
  return y + lines.length * 5 + 2;
}

/* ── Helper: wrapped paragraph text ── */
function para(doc, y, text, size = 9) {
  setTextColor(doc, GRAY_DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(text, CONTENT_W);
  doc.text(lines, MARGIN, y);
  return y + lines.length * (size * 0.45);
}

/* ── Simple CAT logo mark (triangle + text) ── */
function drawLogo(doc, x, y) {
  // Yellow triangle
  setFill(doc, CAT_YELLOW);
  doc.triangle(x, y + 8, x + 7, y + 8, x + 3.5, y, 'F');
  // CAT text
  setTextColor(doc, CAT_BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CAT', x + 10, y + 7);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setTextColor(doc, GRAY_DARK);
  doc.text('CATERPILLAR INC.', x + 10, y + 12);
}

/* ── Page footer ── */
function footer(doc, pageNum) {
  const y = PAGE_H - 10;
  hRule(doc, y - 3, GRAY_LIGHT, 0.3);

  setTextColor(doc, GRAY_MID);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('INTAKE AND EXHAUST AIR LEAK DETECTION SYSTEM  |  Version 1.0  |  Confidential Engineering Report  |  Generated Automatically', MARGIN, y);
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, y, { align: 'right' });
}

/* ═══════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════ */
export function generateDiagnosticPDF(report, currentUser) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setFont('helvetica');

  const {
    id, timestamp, prediction, status, confidence,
    riskLevel, recommendations, inputs, engineModel,
    technician
  } = report;

  const isGo        = status === 'GO';
  const hasIntakeLeak  = !isGo && (prediction === 'Intake Leak'  || prediction === 'Combined Leak');
  const hasExhaustLeak = !isGo && (prediction === 'Exhaust Leak' || prediction === 'Combined Leak');
  const operator    = technician || currentUser?.fullName || 'N/A';
  const engine      = `Caterpillar ${engineModel || inputs?.engineModel || '—'}`;
  const leakLocationMap = {
    'No Leak':       'No leak location identified',
    'Intake Leak':   'Turbocharger Intake Pipe / Intake Manifold',
    'Exhaust Leak':  'Exhaust Manifold Joint / Turbine Outlet',
    'Combined Leak': 'Intake Manifold + Exhaust Manifold',
  };
  const leakLocation = leakLocationMap[prediction] || '—';

  let y = MARGIN;

  /* ── HEADER ── */
  // Logo
  drawLogo(doc, MARGIN, y);

  // Report ID + Date top-right
  setTextColor(doc, GRAY_MID);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Report ID: ${id}`, PAGE_W - MARGIN, y + 4, { align: 'right' });
  doc.text(`Date: ${timestamp}`, PAGE_W - MARGIN, y + 9, { align: 'right' });

  y += 18;

  // Main title
  setTextColor(doc, CAT_BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('INTAKE AND EXHAUST AIR LEAK DETECTION', PAGE_W / 2, y, { align: 'center' });

  y += 7;
  setTextColor(doc, GRAY_DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Automated Engine Diagnostic Report', PAGE_W / 2, y, { align: 'center' });

  // Yellow divider
  y += 5;
  setFill(doc, CAT_YELLOW);
  doc.rect(MARGIN, y, CONTENT_W, 1.5, 'F');
  y += 6;

  /* ── EXECUTIVE SUMMARY ── */
  y = sectionBar(doc, y, '01 — Analysis Summary');
  y += 4;

  const summaryRows = [
    ['Engine Model',       engine],
    ['Operator',           operator],
    ['Analysis Timestamp', timestamp],
    ['System Status',      `${status} — ${isGo ? 'SYSTEM CLEAR' : 'MAINTENANCE REQUIRED'}`],
    ['Confidence Score',   `${confidence}%`],
    ['Risk Level',         riskLevel],
  ];
  summaryRows.forEach(([k, v], i) => { y = tableRow(doc, y, k, v, i % 2 === 0); });
  y += 6;

  /* ── RESULT SUMMARY TABLE ── */
  y = sectionBar(doc, y, '02 — Input Parameters & Results');
  y += 4;

  const paramRows = [
    ['Engine Model',             engine],
    ['Engine RPM',               `${inputs?.rpm} RPM`],
    ['Fuel Rate',                `${inputs?.fuelRate} L/hr`],
    ['Fuel Injection Time',      `${inputs?.fuelInjectionTime} ms`],
    ['Fuel Injection Pressure',  `${inputs?.injectionPressure} bar`],
    ['Leak Classification',      prediction],
    ['Risk Level',               riskLevel],
    ['Confidence Score',         `${confidence}%`],
  ];
  paramRows.forEach(([k, v], i) => { y = tableRow(doc, y, k, v, i % 2 === 0); });
  y += 6;

  /* ── LEAK DETECTION RESULT ── */
  y = sectionBar(doc, y, '03 — Leak Detection Analysis');
  y += 4;
  y = statusBox(doc, y, isGo, prediction, leakLocation);
  y += 4;

  if (!isGo) {
    // Severity badge
    setTextColor(doc, GRAY_DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Detected Location:', MARGIN, y);
    setTextColor(doc, CAT_BLACK);
    doc.text(leakLocation, MARGIN + 35, y);
    y += 6;

    doc.setFontSize(8.5);
    setTextColor(doc, GRAY_DARK);
    doc.text('Severity Level:', MARGIN, y);

    const sevColor = riskLevel === 'Critical' ? RED : riskLevel === 'High' ? [234, 88, 12] : riskLevel === 'Medium' ? [161, 98, 7] : GREEN;
    setFill(doc, sevColor.map(c => Math.min(255, c + 170)));
    setDraw(doc, sevColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN + 30, y - 4, 22, 6, 1, 1, 'FD');
    setTextColor(doc, sevColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(riskLevel.toUpperCase(), MARGIN + 35, y + 0.5);
    y += 8;
  }

  y += 2;

  /* ── ENGINE VISUALIZATION ── */
  y = sectionBar(doc, y, '04 — Engine Inspection View');
  y += 4;

  const cx   = PAGE_W / 2;
  const ey   = y;
  const eW   = 60;  // engine block half-width
  const isC15 = (engineModel || '').includes('C15');

  // Grid background
  setFill(doc, [245, 245, 245]);
  setDraw(doc, [220, 220, 220]);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, ey, CONTENT_W, 58, 'FD');

  // Air filter (far left)
  setFill(doc, [230, 230, 230]);
  setDraw(doc, [50, 50, 50]);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN + 2, ey + 12, 10, 22, 1, 1, 'FD');
  setTextColor(doc, [100, 100, 100]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  doc.text('AIR', MARGIN + 4, ey + 19, { align: 'center' });
  doc.text('FILT', MARGIN + 4, ey + 23, { align: 'center' });

  // Turbocharger compressor (left)
  setFill(doc, [220, 220, 220]);
  setDraw(doc, [50, 50, 50]);
  doc.setLineWidth(0.9);
  doc.circle(MARGIN + 22, ey + 23, 11, 'FD');
  setFill(doc, [190, 190, 190]);
  doc.circle(MARGIN + 22, ey + 23, 7, 'FD');
  setFill(doc, [160, 160, 160]);
  doc.circle(MARGIN + 22, ey + 23, 3.5, 'FD');
  setTextColor(doc, [40, 40, 40]);
  doc.setFontSize(4);
  doc.text('TURBO', MARGIN + 22, ey + 24.5, { align: 'center' });

  // Engine block (centre)
  setFill(doc, [215, 215, 215]);
  setDraw(doc, [30, 30, 30]);
  doc.setLineWidth(1.2);
  doc.rect(cx - eW, ey + 8, eW * 2, 38, 'FD');
  // Cylinder head
  setFill(doc, [195, 195, 195]);
  doc.setLineWidth(0.9);
  doc.rect(cx - eW + 3, ey + 2, (eW * 2) - 6, 8, 'FD');
  // Cylinder bores
  const nCyl = isC15 ? 6 : 6;
  const cylSpacing = ((eW * 2) - 16) / nCyl;
  for (let i = 0; i < nCyl; i++) {
    setFill(doc, [180, 180, 180]);
    doc.setLineWidth(0.6);
    doc.roundedRect(cx - eW + 7 + i * cylSpacing, ey + 3, cylSpacing - 3, 6, 0.5, 0.5, 'FD');
  }
  // Engine label
  setTextColor(doc, [30, 30, 30]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('ENGINE BLOCK', cx, ey + 28, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text(`CAT ${engineModel}`, cx, ey + 34, { align: 'center' });

  // Intake manifold (left side of block)
  setFill(doc, hasIntakeLeak ? [252, 165, 165] : [200, 200, 200]);
  setDraw(doc, hasIntakeLeak ? RED : [60, 60, 60]);
  doc.setLineWidth(hasIntakeLeak ? 1.0 : 0.7);
  doc.rect(cx - eW - 4, ey + 12, 4, 26, 'FD');
  setTextColor(doc, [80, 80, 80]);
  doc.setFontSize(4);
  doc.text('INT.', cx - eW - 2, ey + 20, { align: 'center' });
  doc.text('MAN.', cx - eW - 2, ey + 24, { align: 'center' });

  // Exhaust manifold (right side of block)
  setFill(doc, hasExhaustLeak ? [252, 165, 165] : [200, 200, 200]);
  setDraw(doc, hasExhaustLeak ? RED : [60, 60, 60]);
  doc.setLineWidth(hasExhaustLeak ? 1.0 : 0.7);
  doc.rect(cx + eW, ey + 12, 4, 26, 'FD');
  setTextColor(doc, [80, 80, 80]);
  doc.setFontSize(4);
  doc.text('EXH.', cx + eW + 2, ey + 20, { align: 'center' });
  doc.text('MAN.', cx + eW + 2, ey + 24, { align: 'center' });

  // CAC (below engine, left)
  setFill(doc, [235, 235, 235]);
  setDraw(doc, [60, 60, 60]);
  doc.setLineWidth(0.7);
  doc.rect(cx - eW, ey + 50, 42, 8, 'FD');
  setTextColor(doc, [80, 80, 80]);
  doc.setFontSize(4);
  doc.text('CHARGE AIR COOLER', cx - eW + 21, ey + 55.5, { align: 'center' });

  // Turbine housing (right)
  setFill(doc, [220, 220, 220]);
  setDraw(doc, [50, 50, 50]);
  doc.setLineWidth(0.9);
  doc.circle(cx + eW + 24, ey + 23, 10, 'FD');
  setFill(doc, [190, 190, 190]);
  doc.circle(cx + eW + 24, ey + 23, 6, 'FD');
  setFill(doc, [160, 160, 160]);
  doc.circle(cx + eW + 24, ey + 23, 3, 'FD');
  setTextColor(doc, [40, 40, 40]);
  doc.setFontSize(4);
  doc.text('TURB.', cx + eW + 24, ey + 24.5, { align: 'center' });

  // Exhaust outlet pipe
  setFill(doc, hasExhaustLeak ? [252, 165, 165] : [200, 200, 200]);
  setDraw(doc, hasExhaustLeak ? RED : [60, 60, 60]);
  doc.setLineWidth(hasExhaustLeak ? 1.0 : 0.8);
  doc.rect(cx + eW + 34, ey + 20, 20, 6, 'FD');
  setTextColor(doc, [80, 80, 80]);
  doc.setFontSize(4);
  doc.text('EXHAUST OUT', cx + eW + 44, ey + 24, { align: 'center' });

  // Leak markers
  if (!isGo && prediction.includes('Intake')) {
    setFill(doc, RED);
    doc.circle(cx - eW - 5, ey + 25, 3.5, 'F');
    setTextColor(doc, RED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('⚠ INTAKE LEAK', cx - eW + 5, ey + 62);
  }
  if (!isGo && prediction.includes('Exhaust')) {
    setFill(doc, RED);
    doc.circle(cx + eW + 5, ey + 25, 3.5, 'F');
    setTextColor(doc, RED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('⚠ EXHAUST LEAK', cx + eW - 10, ey + 62);
  }
  if (isGo) {
    setTextColor(doc, GREEN);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('✓ NO LEAK DETECTED — ALL SYSTEMS NOMINAL', cx, ey + 62, { align: 'center' });
  }

  y += 68;

  /* ── check if we need a new page ── */
  const checkPage = (currentY, needed = 40) => {
    if (currentY + needed > PAGE_H - 20) {
      footer(doc, doc.internal.getNumberOfPages());
      doc.addPage();
      return MARGIN;
    }
    return currentY;
  };

  y = checkPage(y, 60);

  /* ── RECOMMENDATIONS ── */
  y = sectionBar(doc, y, '05 — Maintenance Recommendations');
  y += 5;

  recommendations.forEach((rec) => {
    y = checkPage(y, 14);
    y = bulletLine(doc, y, rec);
  });

  y += 4;
  y = checkPage(y, 35);

  /* ── REPAIR GUIDANCE ── */
  y = sectionBar(doc, y, '06 — Repair Guidance');
  y += 5;

  setFill(doc, [250, 250, 250]);
  setDraw(doc, GRAY_LIGHT);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, CONTENT_W, 22, 2, 2, 'FD');

  setTextColor(doc, CAT_BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Video Reference Available', MARGIN + 4, y + 7);

  setTextColor(doc, GRAY_DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Repair Guide: Connect MP4 / YouTube link via the platform Repair Guidance panel.', MARGIN + 4, y + 13);
  doc.text('Maintenance Procedure: Refer to Caterpillar Service Manual for engine-specific repair steps.', MARGIN + 4, y + 18.5);

  y += 28;
  y = checkPage(y, 30);

  /* ── SIGNATURE BLOCK ── */
  y = sectionBar(doc, y, '07 — Certification');
  y += 8;

  hRule(doc, y + 10, GRAY_MID, 0.3);
  hRule(doc, y + 10, GRAY_MID, 0.3);
  doc.line(PAGE_W / 2 + 5, y + 10, PAGE_W - MARGIN, y + 10);

  setTextColor(doc, GRAY_DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Technician Signature', MARGIN, y + 14);
  doc.text('Supervisor Approval', PAGE_W / 2 + 5, y + 14);

  setTextColor(doc, GRAY_MID);
  doc.setFontSize(7);
  doc.text('CONFIRMED VIA ENTERPRISE AUTH', MARGIN, y + 18);
  doc.text('PENDING DIGITAL STAMP', PAGE_W / 2 + 5, y + 18);

  /* ── FOOTER all pages ── */
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    footer(doc, i);
  }

  /* ── SAVE ── */
  doc.save(`CAT-${id}-Diagnostic-Report.pdf`);
}
