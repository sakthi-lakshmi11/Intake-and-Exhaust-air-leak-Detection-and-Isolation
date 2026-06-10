import React from 'react';

/**
 * EngineDiagram — Service Manual Style SVG
 * engineModel : 'C7' | 'C15'
 * prediction  : 'No Leak' | 'Intake Leak' | 'Exhaust Leak' | 'Combined Leak'
 * isGo        : boolean
 */
export default function EngineDiagram({ engineModel = 'C7', prediction = 'No Leak', isGo = true }) {
  const hasIntake  = !isGo && (prediction === 'Intake Leak'  || prediction === 'Combined Leak');
  const hasExhaust = !isGo && (prediction === 'Exhaust Leak' || prediction === 'Combined Leak');
  const isC15      = engineModel === 'C15';

  /* ── Canvas ── */
  const W = 800, H = 510;

  /* ── Palette ── */
  const BG  = '#FFFFFF';
  const GR  = '#F0F0F0'; // grid
  const S   = '#1A1A1A'; // stroke
  const F0  = '#F4F4F4'; // lightest fill
  const F1  = '#E2E2E2'; // light fill
  const F2  = '#C8C8C8'; // mid fill
  const F3  = '#AAAAAA'; // dark fill
  const YL  = '#FFCD11'; // CAT yellow
  const RD  = '#DC2626'; // red
  const GN  = '#16A34A'; // green
  const LB  = '#333333'; // label dark
  const DM  = '#888888'; // dim

  /* ── Layout constants ── */
  const TITLE_H = 36;  // taller title bar so two lines fit cleanly
  const PAD     = 14;

  // Engine block — centred horizontally
  const BLK_W   = isC15 ? 310 : 265;
  const BLK_H   = isC15 ? 130 : 112;
  const BLK_X   = (W - BLK_W) / 2;          // ≈ 245 C7, 245 C15
  const BLK_Y   = TITLE_H + 100;             // 130
  const BLK_CX  = BLK_X + BLK_W / 2;
  const BLK_R   = BLK_X + BLK_W;

  // Cylinder head
  const HD_H    = 20;
  const HD_Y    = BLK_Y - HD_H;
  const CYL_N   = isC15 ? 6 : 6;
  const CYL_W   = isC15 ? 40 : 34;
  const CYL_SP  = (BLK_W - 16) / CYL_N;

  // Oil pan
  const OP_Y    = BLK_Y + BLK_H;

  // Intake manifold — left edge of block
  const IM_W    = 16;
  const IM_H    = BLK_H - 28;
  const IM_X    = BLK_X - IM_W;
  const IM_Y    = BLK_Y + 14;
  const IM_MX   = IM_X + IM_W / 2; // midpoint X
  const IM_MY   = IM_Y + IM_H / 2; // midpoint Y

  // Exhaust manifold — right edge of block
  const EM_W    = 16;
  const EM_H    = BLK_H - 28;
  const EM_X    = BLK_R;
  const EM_Y    = BLK_Y + 14;
  const EM_MX   = EM_X + EM_W / 2;
  const EM_MY   = EM_Y + EM_H / 2;

  // Turbocharger (compressor) — left
  const TC_R    = isC15 ? 46 : 40;
  const TC_X    = BLK_X - IM_W - 90;         // left of intake manifold
  const TC_Y    = BLK_Y + BLK_H / 2;

  // Turbine — right
  const TN_R    = isC15 ? 42 : 36;
  const TN_X    = BLK_R + EM_W + 90;
  const TN_Y    = BLK_Y + BLK_H / 2;

  // Air filter — far left
  const AF_W    = 32;
  const AF_H    = isC15 ? 68 : 58;
  const AF_X    = PAD + 2;
  const AF_Y    = TC_Y - AF_H / 2;

  // CAC — below block
  const CAC_W   = BLK_W * 0.65;
  const CAC_H   = 30;
  const CAC_X   = BLK_X;
  const CAC_Y   = OP_Y + 34;

  // Exhaust outlet — far right
  const EO_X    = TN_X + TN_R + 8;
  const EO_Y    = TN_Y - 7;
  const EO_W    = W - EO_X - 60;
  const EO_H    = 14;

  /* ── Pipe stroke widths ── */
  const PW_NORMAL = 3;
  const PW_LEAK   = 3.5;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      style={{ fontFamily: "'Inter','Segoe UI',Arial,sans-serif", background: BG, display: 'block', maxWidth: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Fine grid */}
        <pattern id="sg2" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M8 0H0V8" fill="none" stroke={GR} strokeWidth="0.3"/>
        </pattern>
        <pattern id="bg2" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="url(#sg2)"/>
          <path d="M40 0H0V40" fill="none" stroke="#E8E8E8" strokeWidth="0.6"/>
        </pattern>
        {/* Arrows */}
        <marker id="aS" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0,6 2.5,0 5" fill={S}/>
        </marker>
        <marker id="aR" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0,6 2.5,0 5" fill={RD}/>
        </marker>
        <marker id="aDm" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0,5 2,0 4" fill={DM}/>
        </marker>
      </defs>

      {/* ── Grid ── */}
      <rect width={W} height={H} fill="url(#bg2)"/>

      {/* ── Title bar ── */}
      <rect x="0" y="0" width={W} height={TITLE_H} fill={S}/>
      {/* Line 1: model + system name */}
      <text x="16" y="14" fontSize="9" fontWeight="700" fill={YL} letterSpacing="0.8">
        CAT {engineModel} · INTAKE &amp; EXHAUST AIR SYSTEM · DIAGNOSTIC SCHEMATIC
      </text>
      {/* Line 2: document ref */}
      <text x="16" y="26" fontSize="6.5" fill="#999">
        REF: CAT-{engineModel}-DIAG-001 | REV A | FOR SERVICE USE ONLY
      </text>

      {/* ═══════════════════════════════
          PIPES (drawn first = under components)
      ═══════════════════════════════ */}

      {/* Air filter outlet → turbo compressor inlet (horizontal) */}
      <rect
        x={AF_X + AF_W} y={TC_Y - 6}
        width={TC_X - TC_R - (AF_X + AF_W)} height={12}
        rx="1" fill={hasIntake ? '#FECACA' : F2}
        stroke={hasIntake ? RD : S} strokeWidth={hasIntake ? 2 : 1.4}/>

      {/* Turbo compressor outlet → CAC inlet (vertical down) */}
      <rect
        x={TC_X - 6} y={TC_Y + TC_R}
        width={12} height={CAC_Y - (TC_Y + TC_R)}
        rx="1" fill={hasIntake ? '#FECACA' : F2}
        stroke={hasIntake ? RD : S} strokeWidth={hasIntake ? 2 : 1.4}/>

      {/* CAC outlet → intake manifold (elbow path) */}
      <path
        d={`M${CAC_X + CAC_W} ${CAC_Y + CAC_H/2}
            L${IM_X + IM_W + 6} ${CAC_Y + CAC_H/2}
            L${IM_X + IM_W + 6} ${IM_MY}`}
        fill="none"
        stroke={hasIntake ? RD : S}
        strokeWidth={hasIntake ? PW_LEAK : PW_NORMAL}
        strokeLinejoin="round" strokeLinecap="round"/>

      {/* Exhaust manifold → turbine inlet (horizontal) */}
      <rect
        x={EM_X + EM_W} y={EM_MY - 6}
        width={TN_X - TN_R - (EM_X + EM_W)} height={12}
        rx="1" fill={hasExhaust ? '#FECACA' : F2}
        stroke={hasExhaust ? RD : S} strokeWidth={hasExhaust ? 2 : 1.4}/>
      {/* Heat wrap marks on exhaust pipe */}
      {[0,1,2,3,4,5].map(i => {
        const hx = EM_X + EM_W + 12 + i * 11;
        if (hx + 7 >= TN_X - TN_R) return null;
        return <line key={i}
          x1={hx} y1={EM_MY - 8} x2={hx + 7} y2={EM_MY + 8}
          stroke={hasExhaust ? '#F87171' : F3} strokeWidth="1.2" opacity="0.65"/>;
      })}

      {/* Turbine outlet → exhaust outlet pipe (horizontal) */}
      <rect
        x={TN_X + TN_R} y={TN_Y - 7}
        width={EO_W + 8} height={EO_H}
        rx="1" fill={hasExhaust ? '#FECACA' : F2}
        stroke={hasExhaust ? RD : S} strokeWidth={hasExhaust ? 2 : 1.4}/>
      {/* Flanges */}
      {[TN_X + TN_R + 8, TN_X + TN_R + EO_W - 4].map((fx, i) => (
        <rect key={i} x={fx} y={TN_Y - 11} width="5" height={EO_H + 8}
          rx="1" fill={F3} stroke={S} strokeWidth="0.9"/>
      ))}

      {/* ═══════════════════════════════
          AIR FILTER HOUSING
      ═══════════════════════════════ */}
      <rect x={AF_X} y={AF_Y} width={AF_W} height={AF_H} rx="3"
        fill={F0} stroke={S} strokeWidth="1.7"/>
      {[0,1,2,3,4].map(i => (
        <line key={i}
          x1={AF_X + 5} y1={AF_Y + 10 + i*9}
          x2={AF_X + AF_W - 5} y2={AF_Y + 10 + i*9}
          stroke={F3} strokeWidth="1.1"/>
      ))}
      <rect x={AF_X - 3} y={AF_Y - 5} width={AF_W + 6} height="7" rx="2"
        fill={F2} stroke={S} strokeWidth="1.2"/>
      <rect x={AF_X - 3} y={AF_Y + AF_H - 2} width={AF_W + 6} height="7" rx="2"
        fill={F2} stroke={S} strokeWidth="1.2"/>
      {/* Callout — above air filter, starts below title bar */}
      <line x1={AF_X + AF_W/2} y1={AF_Y - 5} x2={AF_X + AF_W/2} y2={TITLE_H + 8}
        stroke={DM} strokeWidth="0.7" strokeDasharray="3,2"/>
      <text x={AF_X + AF_W/2} y={TITLE_H + 15} fontSize="7" fontWeight="600" fill={LB} textAnchor="middle">AIR FILTER</text>
      <text x={AF_X + AF_W/2} y={TITLE_H + 24} fontSize="6" fill={DM} textAnchor="middle">HOUSING</text>

      {/* ═══════════════════════════════
          TURBOCHARGER — COMPRESSOR
      ═══════════════════════════════ */}
      {/* Outer housing */}
      <circle cx={TC_X} cy={TC_Y} r={TC_R} fill={F1} stroke={S} strokeWidth="2.1"/>
      {/* Volute */}
      <circle cx={TC_X} cy={TC_Y} r={TC_R - 7} fill={F2} stroke={S} strokeWidth="1.4"/>
      {/* Bearing journal */}
      <circle cx={TC_X} cy={TC_Y} r={TC_R - 18} fill={F0} stroke={S} strokeWidth="1.1"/>
      {/* Shaft hub */}
      <circle cx={TC_X} cy={TC_Y} r="5" fill={F3} stroke={S} strokeWidth="1"/>
      {/* Impeller blades */}
      {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
        const r = deg * Math.PI / 180;
        return <line key={i}
          x1={TC_X + Math.cos(r)*6} y1={TC_Y + Math.sin(r)*6}
          x2={TC_X + Math.cos(r)*(TC_R-20)} y2={TC_Y + Math.sin(r)*(TC_R-20)}
          stroke={S} strokeWidth="1.1" opacity="0.4"/>;
      })}
      {/* Label */}
      <text x={TC_X} y={TC_Y + 3} fontSize="7.5" fontWeight="700" fill={S} textAnchor="middle">TURBO</text>
      <text x={TC_X} y={TC_Y + 13} fontSize="5.5" fill={DM} textAnchor="middle">COMP.</text>
      {/* Callout — above turbo compressor */}
      <line x1={TC_X} y1={TC_Y - TC_R} x2={TC_X} y2={TITLE_H + 8}
        stroke={DM} strokeWidth="0.7" strokeDasharray="3,2"/>
      <text x={TC_X} y={TITLE_H + 15} fontSize="7" fontWeight="600" fill={LB} textAnchor="middle">TURBOCHARGER</text>
      <text x={TC_X} y={TITLE_H + 24} fontSize="6" fill={DM} textAnchor="middle">Compressor Housing</text>

      {/* ═══════════════════════════════
          CHARGE AIR COOLER
      ═══════════════════════════════ */}
      <rect x={CAC_X} y={CAC_Y} width={CAC_W} height={CAC_H} rx="2"
        fill={F0} stroke={S} strokeWidth="1.7"/>
      {/* Fins */}
      {Array.from({length: 16}).map((_, i) => (
        <line key={i}
          x1={CAC_X + 10 + i*(CAC_W-20)/15} y1={CAC_Y + 4}
          x2={CAC_X + 10 + i*(CAC_W-20)/15} y2={CAC_Y + CAC_H - 4}
          stroke={F3} strokeWidth="0.9"/>
      ))}
      {/* End tanks */}
      <rect x={CAC_X} y={CAC_Y} width="10" height={CAC_H} rx="1" fill={F2} stroke={S} strokeWidth="1.2"/>
      <rect x={CAC_X + CAC_W - 10} y={CAC_Y} width="10" height={CAC_H} rx="1" fill={F2} stroke={S} strokeWidth="1.2"/>
      {/* Callout — below */}
      <line x1={CAC_X + CAC_W/2} y1={CAC_Y + CAC_H}
        x2={CAC_X + CAC_W/2} y2={CAC_Y + CAC_H + 16}
        stroke={DM} strokeWidth="0.7" strokeDasharray="3,2"/>
      <text x={CAC_X + CAC_W/2} y={CAC_Y + CAC_H + 24} fontSize="7" fontWeight="600" fill={LB} textAnchor="middle">
        CHARGE AIR COOLER (CAC)
      </text>
      <text x={CAC_X + CAC_W/2} y={CAC_Y + CAC_H + 33} fontSize="6" fill={DM} textAnchor="middle">
        Intake Air Temperature Reduction
      </text>

      {/* ═══════════════════════════════
          ENGINE BLOCK
      ═══════════════════════════════ */}
      {/* Main body */}
      <rect x={BLK_X} y={BLK_Y} width={BLK_W} height={BLK_H} rx="3"
        fill={F1} stroke={S} strokeWidth="2.4"/>
      {/* Internal ribs */}
      {[1,2,3].map(i => (
        <line key={i} x1={BLK_X + 4} y1={BLK_Y + i*(BLK_H/4)} x2={BLK_R - 4} y2={BLK_Y + i*(BLK_H/4)}
          stroke="#D0D0D0" strokeWidth="0.6" strokeDasharray="5,4"/>
      ))}
      {/* Cylinder head */}
      <rect x={BLK_X + 4} y={HD_Y} width={BLK_W - 8} height={HD_H} rx="2"
        fill={F2} stroke={S} strokeWidth="1.8"/>
      {/* Head bolts */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <circle key={i} cx={BLK_X + 14 + i*((BLK_W - 28)/7)} cy={HD_Y + HD_H/2} r="2.8"
          fill={F3} stroke={S} strokeWidth="0.8"/>
      ))}
      {/* Cylinder bores */}
      {Array.from({length: CYL_N}).map((_, i) => {
        const cx2 = BLK_X + 8 + i*CYL_SP + CYL_SP/2 - CYL_W/2;
        return (
          <g key={i}>
            <rect x={cx2} y={HD_Y + 3} width={CYL_W} height={HD_H - 4} rx="2"
              fill={F0} stroke={S} strokeWidth="1"/>
            <line x1={cx2 + CYL_W/2} y1={HD_Y + 4} x2={cx2 + CYL_W/2} y2={HD_Y + HD_H - 2}
              stroke={DM} strokeWidth="0.7"/>
          </g>
        );
      })}
      {/* Oil pan */}
      <rect x={BLK_X + 6} y={OP_Y} width={BLK_W - 12} height="18" rx="2"
        fill={F2} stroke={S} strokeWidth="1.5"/>
      <rect x={BLK_X + 14} y={OP_Y + 18} width={BLK_W - 28} height="8" rx="1"
        fill={F3} stroke={S} strokeWidth="1.2"/>
      {/* Engine labels */}
      <text x={BLK_CX} y={BLK_Y + BLK_H/2 - 7} fontSize="12" fontWeight="700" fill={S}
        textAnchor="middle" letterSpacing="0.5">ENGINE BLOCK</text>
      <text x={BLK_CX} y={BLK_Y + BLK_H/2 + 9} fontSize="8.5" fontWeight="600" fill={DM}
        textAnchor="middle">{engineModel}</text>
      <text x={BLK_CX} y={BLK_Y + BLK_H/2 + 21} fontSize="7" fill={DM} textAnchor="middle">
        {isC15 ? '15.2L In-Line 6 Turbocharged Diesel' : '7.2L In-Line 6 Turbocharged Diesel'}
      </text>

      {/* ═══════════════════════════════
          INTAKE MANIFOLD
      ═══════════════════════════════ */}
      <rect x={IM_X} y={IM_Y} width={IM_W} height={IM_H} rx="2"
        fill={hasIntake ? '#FEE2E2' : F2}
        stroke={hasIntake ? RD : S}
        strokeWidth={hasIntake ? 2.2 : 1.6}/>
      {/* Runner ports */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={BLK_X - 3} y={IM_Y + 6 + i*((IM_H-12)/5)} width="3" height="5"
          rx="0" fill={F3} stroke={S} strokeWidth="0.6"/>
      ))}
      {/* Callout left — INTAKE MANIFOLD, sits just below title bar */}
      <line x1={IM_X} y1={IM_MY} x2={IM_X - 22} y2={IM_MY} stroke={DM} strokeWidth="0.7" strokeDasharray="3,2"/>
      <line x1={IM_X - 22} y1={IM_MY} x2={IM_X - 22} y2={TITLE_H + 8} stroke={DM} strokeWidth="0.7" strokeDasharray="3,2"/>
      <text x={IM_X - 22} y={TITLE_H + 15} fontSize="7" fontWeight="600" fill={LB} textAnchor="middle">INTAKE</text>
      <text x={IM_X - 22} y={TITLE_H + 24} fontSize="7" fontWeight="600" fill={LB} textAnchor="middle">MANIFOLD</text>

      {/* ═══════════════════════════════
          EXHAUST MANIFOLD
      ═══════════════════════════════ */}
      <rect x={EM_X} y={EM_Y} width={EM_W} height={EM_H} rx="2"
        fill={hasExhaust ? '#FEE2E2' : F2}
        stroke={hasExhaust ? RD : S}
        strokeWidth={hasExhaust ? 2.2 : 1.6}/>
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={BLK_R} y={EM_Y + 6 + i*((EM_H-12)/5)} width="3" height="5"
          rx="0" fill={F3} stroke={S} strokeWidth="0.6"/>
      ))}
      {/* Callout right — EXHAUST MANIFOLD */}
      <line x1={EM_X + EM_W} y1={EM_MY} x2={EM_X + EM_W + 22} y2={EM_MY}
        stroke={DM} strokeWidth="0.7" strokeDasharray="3,2"/>
      <line x1={EM_X + EM_W + 22} y1={EM_MY} x2={EM_X + EM_W + 22} y2={TITLE_H + 8}
        stroke={DM} strokeWidth="0.7" strokeDasharray="3,2"/>
      <text x={EM_X + EM_W + 22} y={TITLE_H + 15} fontSize="7" fontWeight="600" fill={LB} textAnchor="middle">EXHAUST</text>
      <text x={EM_X + EM_W + 22} y={TITLE_H + 24} fontSize="7" fontWeight="600" fill={LB} textAnchor="middle">MANIFOLD</text>

      {/* ═══════════════════════════════
          TURBINE HOUSING
      ═══════════════════════════════ */}
      <circle cx={TN_X} cy={TN_Y} r={TN_R} fill={F1} stroke={S} strokeWidth="2.1"/>
      <circle cx={TN_X} cy={TN_Y} r={TN_R - 7} fill={F2} stroke={S} strokeWidth="1.4"/>
      <circle cx={TN_X} cy={TN_Y} r={TN_R - 17} fill={F0} stroke={S} strokeWidth="1.1"/>
      <circle cx={TN_X} cy={TN_Y} r="5" fill={F3} stroke={S} strokeWidth="1"/>
      {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
        const r = deg * Math.PI / 180;
        return <line key={i}
          x1={TN_X + Math.cos(r)*6} y1={TN_Y + Math.sin(r)*6}
          x2={TN_X + Math.cos(r)*(TN_R-19)} y2={TN_Y + Math.sin(r)*(TN_R-19)}
          stroke={S} strokeWidth="1.1" opacity="0.4"/>;
      })}
      <text x={TN_X} y={TN_Y + 3} fontSize="7" fontWeight="700" fill={S} textAnchor="middle">TURBINE</text>
      <text x={TN_X} y={TN_Y + 13} fontSize="5.5" fill={DM} textAnchor="middle">HOUSING</text>
      {/* Callout — above turbine housing */}
      <line x1={TN_X} y1={TN_Y - TN_R} x2={TN_X} y2={TITLE_H + 8}
        stroke={DM} strokeWidth="0.7" strokeDasharray="3,2"/>
      <text x={TN_X} y={TITLE_H + 15} fontSize="7" fontWeight="600" fill={LB} textAnchor="middle">TURBINE</text>
      <text x={TN_X} y={TITLE_H + 24} fontSize="6" fill={DM} textAnchor="middle">Exhaust-Driven</text>

      {/* Turbo–Turbine shaft (dashed centre line) */}
      <line x1={TC_X + TC_R} y1={TC_Y} x2={TN_X - TN_R} y2={TN_Y}
        stroke={F3} strokeWidth="2" strokeDasharray="7,4"/>

      {/* ═══════════════════════════════
          EXHAUST OUTLET
      ═══════════════════════════════ */}
      {/* End cap */}
      <rect x={EO_X + EO_W} y={TN_Y - 10} width="10" height={EO_H + 6}
        rx="2" fill={F3} stroke={S} strokeWidth="1.2"/>
      {/* Arrow */}
      <line x1={EO_X + EO_W + 10} y1={TN_Y} x2={EO_X + EO_W + 26} y2={TN_Y}
        stroke={S} strokeWidth="2" markerEnd="url(#aS)"/>
      <text x={EO_X + EO_W + 30} y={TN_Y - 4} fontSize="7" fontWeight="600" fill={LB}>EXHAUST</text>
      <text x={EO_X + EO_W + 30} y={TN_Y + 7} fontSize="7" fontWeight="600" fill={LB}>OUTLET</text>

      {/* ═══════════════════════════════
          FLOW ARROWS (subtle)
      ═══════════════════════════════ */}
      {/* AF → turbo */}
      <line x1={AF_X + AF_W + 8} y1={TC_Y} x2={TC_X - TC_R - 6} y2={TC_Y}
        stroke={DM} strokeWidth="1" strokeDasharray="5,3" markerEnd="url(#aDm)" opacity="0.5"/>
      {/* CAC → IM elbow midpoint */}
      <line x1={CAC_X + CAC_W/2} y1={CAC_Y} x2={CAC_X + CAC_W/2} y2={CAC_Y - 8}
        stroke={DM} strokeWidth="1" strokeDasharray="5,3" markerEnd="url(#aDm)" opacity="0.4"/>

      {/* ═══════════════════════════════
          INTAKE LEAK MARKER
      ═══════════════════════════════ */}
      {hasIntake && (
        <g>
          {/* Dot on intake manifold */}
          <circle cx={IM_MX} cy={IM_MY} r="6" fill={RD} opacity="0.9"/>
          <circle cx={IM_MX} cy={IM_MY} r="6" fill="none" stroke={RD} strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="8;15;8" dur="1.3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.3s" repeatCount="indefinite"/>
          </circle>
          {/* Yellow dashed ring */}
          <circle cx={IM_MX} cy={IM_MY} r="20" fill="none" stroke={YL}
            strokeWidth="2" strokeDasharray="5,3"/>
          {/* Callout box — bottom left */}
          <line x1={IM_MX} y1={IM_MY + 20} x2={IM_MX} y2={H - 92}
            stroke={RD} strokeWidth="1.3" markerEnd="url(#aR)"/>
          <rect x={PAD} y={H - 90} width="148" height="46" rx="3"
            fill="#FEF2F2" stroke={RD} strokeWidth="1.3"/>
          <rect x={PAD} y={H - 90} width="148" height="11" rx="3" fill={YL}/>
          <text x={PAD + 74} y={H - 82} fontSize="7.5" fontWeight="700" fill={S} textAnchor="middle">⚠ LEAK DETECTED</text>
          <text x={PAD + 74} y={H - 65} fontSize="8" fontWeight="700" fill={RD} textAnchor="middle">Intake Manifold Leak</text>
          <text x={PAD + 74} y={H - 54} fontSize="6.5" fill={LB} textAnchor="middle">Charge Air Cooler Pipe /</text>
          <text x={PAD + 74} y={H - 44} fontSize="6.5" fill={LB} textAnchor="middle">Manifold Connection</text>
        </g>
      )}

      {/* ═══════════════════════════════
          EXHAUST LEAK MARKER
      ═══════════════════════════════ */}
      {hasExhaust && (
        <g>
          <circle cx={EM_MX + EM_W/2} cy={EM_MY} r="6" fill={RD} opacity="0.9"/>
          <circle cx={EM_MX + EM_W/2} cy={EM_MY} r="6" fill="none" stroke={RD} strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="8;15;8" dur="1.3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.3s" repeatCount="indefinite"/>
          </circle>
          <circle cx={EM_MX + EM_W/2} cy={EM_MY} r="20" fill="none" stroke={YL}
            strokeWidth="2" strokeDasharray="5,3"/>
          {/* Callout box — bottom right */}
          <line x1={EM_MX + EM_W/2} y1={EM_MY + 20} x2={EM_MX + EM_W/2} y2={H - 92}
            stroke={RD} strokeWidth="1.3" markerEnd="url(#aR)"/>
          <rect x={W - PAD - 148} y={H - 90} width="148" height="46" rx="3"
            fill="#FEF2F2" stroke={RD} strokeWidth="1.3"/>
          <rect x={W - PAD - 148} y={H - 90} width="148" height="11" rx="3" fill={YL}/>
          <text x={W - PAD - 74} y={H - 82} fontSize="7.5" fontWeight="700" fill={S} textAnchor="middle">⚠ LEAK DETECTED</text>
          <text x={W - PAD - 74} y={H - 65} fontSize="8" fontWeight="700" fill={RD} textAnchor="middle">Exhaust Manifold Leak</text>
          <text x={W - PAD - 74} y={H - 54} fontSize="6.5" fill={LB} textAnchor="middle">Turbine Inlet Connection /</text>
          <text x={W - PAD - 74} y={H - 44} fontSize="6.5" fill={LB} textAnchor="middle">Manifold Joint</text>
        </g>
      )}

      {/* NO LEAK BANNER — centred, above title block zone */}
      {isGo && (
        <g>
          <rect x={BLK_CX - 155} y={H - 52} width="310" height="24" rx="4"
            fill="#F0FDF4" stroke={GN} strokeWidth="1.3"/>
          <text x={BLK_CX} y={H - 35} fontSize="9" fontWeight="700" fill={GN} textAnchor="middle">
            ✓  NO LEAK LOCATION IDENTIFIED — SYSTEM CLEAR
          </text>
        </g>
      )}

      {/* OUTER FRAME */}
      <rect x="1" y="1" width={W-2} height={H-2}
        fill="none" stroke="#BBBBBB" strokeWidth="1.5"/>

      {/* TITLE BLOCK — bottom-right, non-overlapping with callout boxes */}
      <rect x={W-182} y={H-58} width="180" height="56" fill={BG} stroke="#BBBBBB" strokeWidth="0.8"/>
      <line x1={W-182} y1={H-38} x2={W-2} y2={H-38} stroke="#BBBBBB" strokeWidth="0.7"/>
      <line x1={W-182} y1={H-20} x2={W-2} y2={H-20} stroke="#BBBBBB" strokeWidth="0.7"/>
      <line x1={W-92}  y1={H-58} x2={W-92}  y2={H-2}  stroke="#BBBBBB" strokeWidth="0.7"/>
      <text x={W-91} y={H-47} fontSize="6.5" fontWeight="700" fill={S} textAnchor="middle">INTAKE &amp; EXHAUST AIR LEAK</text>
      <text x={W-91} y={H-37} fontSize="6.5" fontWeight="700" fill={S} textAnchor="middle">DETECTION SYSTEM</text>
      <text x={W-91} y={H-25} fontSize="6"   fill={DM} textAnchor="middle">{engineModel} | Diagnostic Schematic</text>
      <text x={W-91} y={H-9}  fontSize="5.5" fill={DM} textAnchor="middle">FOR SERVICE USE ONLY</text>
    </svg>
  );
}
