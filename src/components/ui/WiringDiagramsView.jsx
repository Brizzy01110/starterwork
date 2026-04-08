import { useState } from 'react';

/* ─── Wire/color constants (NEC/NFPA 79 standard colors) ─────────────────── */
const W = {
  l1:      '#e8e8e8',  // Black wire (shown light on dark bg) — L1 / Hot
  l2:      '#ff5555',  // Red — L2
  l3:      '#5599ff',  // Blue — L3
  neutral: '#aaaaaa',  // White/Gray — Neutral
  gnd:     '#44cc55',  // Green — Ground / PE
  dcPos:   '#ff8800',  // Orange — DC+
  dcNeg:   '#888888',  // Gray — DC−
  signal:  '#cc88ff',  // Purple — Encoder / signal
};

/* ─── Motor data ─────────────────────────────────────────────────────────── */
const MOTORS = [
  {
    id: 'mdr',
    name: 'Motor-Driven Rollers',
    short: 'MDR',
    type: 'mdr',
    voltages: ['120VAC', '240VAC'],
    description:
      'Motorized Drive Rollers (MDRs) house an internal brushless DC motor inside the roller tube. ' +
      'AC line power feeds an external 24 VDC power supply; the 24 V output connects to the roller\'s ' +
      'cable connector. Common in zero-pressure accumulation (ZPA) conveyor zones.',
  },
  {
    id: 'acim',
    name: 'AC Induction Motors',
    short: 'ACIM',
    type: 'acim',
    voltages: ['120VAC', '240VAC', '480VAC'],
    description:
      'Squirrel-cage induction motors are the industry workhorse for conveyors, sorters, and general ' +
      'drive applications. Available in single-phase (120 V / 240 V) and three-phase (480 V) ' +
      'configurations. NEMA or IEC frame. Wire direct to motor terminals T1–T3 (or T1–T2 for 1Ø).',
  },
  {
    id: 'pancake',
    name: 'Pancake Motor',
    short: 'Axial Flux',
    type: 'pancake',
    voltages: ['120VAC', '240VAC', '480VAC'],
    description:
      'Low-profile axial-flux (pancake) motors are used where radial height is constrained. ' +
      'Available in single-phase AC and three-phase variants. Common in precision direct-drive and ' +
      'tension-control applications. Wire the same as a standard AC induction motor.',
  },
  {
    id: 'bldc',
    name: 'Brushless DC Motors',
    short: 'BLDC',
    type: 'bldc',
    voltages: ['120VAC', '240VAC'],
    description:
      'Electronically commutated (EC) brushless DC motors require an integrated motor controller or ' +
      'external drive. AC line power connects to the controller; the controller outputs 3-phase ' +
      'variable-frequency drive signals (U / V / W) to the motor windings.',
  },
  {
    id: 'servo-robin',
    name: 'Servo Motor — Robin',
    short: 'Robin',
    type: 'servo',
    model: 'Robin',
    voltages: ['120VAC', '240VAC', '480VAC'],
    description:
      'Robin-series servo motor with integrated rotary encoder. Used for high-accuracy positioning on ' +
      'robotic arms, divert arms, and pick-and-place systems. Always paired with a compatible servo ' +
      'drive/amplifier. Encoder feedback cable runs separately from the power cable.',
  },
  {
    id: 'servo-cardinal',
    name: 'Servo Motor — Cardinal',
    short: 'Cardinal',
    type: 'servo',
    model: 'Cardinal',
    voltages: ['120VAC', '240VAC', '480VAC'],
    description:
      'Cardinal-series servo motor — higher torque and power class than Robin. Suited for heavy-load ' +
      'precision positioning. Requires a servo drive/amplifier with matching encoder interface. ' +
      'Power wiring identical to Robin; only the drive model and cable gauge differ.',
  },
];

/* ─── SVG Motor Illustrations ────────────────────────────────────────────── */

function IllustMDR() {
  return (
    <svg viewBox="0 0 240 100" fill="none" style={{ width: '100%', maxWidth: 240, height: 'auto' }}>
      {/* Roller tube */}
      <rect x="28" y="36" width="172" height="32" rx="16" fill="#1a2133" stroke="#FF9900" strokeWidth="1.5" />
      {/* Knurling */}
      {[50,65,80,95,110,125,140,155,170].map(x => (
        <line key={x} x1={x} y1="36" x2={x} y2="68" stroke="#252e42" strokeWidth="1.2" />
      ))}
      {/* End caps */}
      <ellipse cx="28" cy="52" rx="13" ry="16" fill="#131c2e" stroke="#FF9900" strokeWidth="1.5" />
      <ellipse cx="200" cy="52" rx="13" ry="16" fill="#131c2e" stroke="#FF9900" strokeWidth="1.5" />
      {/* Shafts */}
      <rect x="6" y="48" width="22" height="8" rx="3" fill="#444" stroke="#666" strokeWidth="1" />
      <rect x="200" y="48" width="22" height="8" rx="3" fill="#444" stroke="#666" strokeWidth="1" />
      {/* Internal motor symbol */}
      <circle cx="58" cy="52" r="11" fill="none" stroke="#FF9900" strokeWidth="1.2" strokeDasharray="4 2" />
      <text x="58" y="56" textAnchor="middle" fill="#FF9900" fontSize="9" fontWeight="bold" fontFamily="monospace">M</text>
      {/* Cable connector */}
      <rect x="90" y="26" width="26" height="12" rx="3" fill="#202840" stroke="#888" strokeWidth="1" />
      <line x1="98" y1="26" x2="98" y2="36" stroke={W.dcPos} strokeWidth="1.5" />
      <line x1="103" y1="26" x2="103" y2="36" stroke={W.dcNeg} strokeWidth="1.5" />
      <line x1="108" y1="26" x2="108" y2="36" stroke={W.gnd} strokeWidth="1.5" />
      <text x="103" y="20" textAnchor="middle" fill="#888" fontSize="8" fontFamily="monospace">24 VDC</text>
      <text x="120" y="90" textAnchor="middle" fill="#555" fontSize="9" fontFamily="monospace">MOTORIZED DRIVE ROLLER</text>
    </svg>
  );
}

function IllustACIM() {
  return (
    <svg viewBox="0 0 240 110" fill="none" style={{ width: '100%', maxWidth: 240, height: 'auto' }}>
      {/* Motor body */}
      <rect x="30" y="30" width="140" height="55" rx="6" fill="#1a2133" stroke="#FF9900" strokeWidth="1.5" />
      {/* Cooling fins */}
      {[38,50,62,74,86,98,110,122,134,146,158].map(x => (
        <rect key={x} x={x} y="22" width="6" height="10" rx="1" fill="#252e42" stroke="#3a4560" strokeWidth="0.8" />
      ))}
      {/* End bell right */}
      <rect x="170" y="38" width="28" height="39" rx="14" fill="#131c2e" stroke="#FF9900" strokeWidth="1.5" />
      {/* End bell left */}
      <rect x="14" y="38" width="28" height="39" rx="14" fill="#131c2e" stroke="#FF9900" strokeWidth="1.5" />
      {/* Shaft */}
      <rect x="195" y="51" width="28" height="12" rx="4" fill="#555" stroke="#777" strokeWidth="1" />
      {/* Terminal box */}
      <rect x="65" y="16" width="50" height="20" rx="3" fill="#1e2a3c" stroke="#aaa" strokeWidth="1" />
      <text x="90" y="30" textAnchor="middle" fill="#aaa" fontSize="9" fontFamily="monospace">T-BOX</text>
      {/* Motor M symbol */}
      <circle cx="100" cy="57" r="16" fill="none" stroke="#FF9900" strokeWidth="1.5" />
      <text x="100" y="62" textAnchor="middle" fill="#FF9900" fontSize="13" fontWeight="bold" fontFamily="monospace">M</text>
      {/* Nameplate */}
      <rect x="130" y="50" width="30" height="20" rx="2" fill="#1e2a3c" stroke="#555" strokeWidth="0.8" />
      <text x="145" y="62" textAnchor="middle" fill="#555" fontSize="7" fontFamily="monospace">NEMA</text>
      <text x="120" y="100" textAnchor="middle" fill="#555" fontSize="9" fontFamily="monospace">AC INDUCTION MOTOR</text>
    </svg>
  );
}

function IllustPancake() {
  return (
    <svg viewBox="0 0 240 110" fill="none" style={{ width: '100%', maxWidth: 240, height: 'auto' }}>
      {/* Main disc — front face */}
      <ellipse cx="100" cy="55" rx="70" ry="40" fill="#1a2133" stroke="#FF9900" strokeWidth="1.5" />
      {/* Disc depth/edge */}
      <rect x="100" y="55" width="18" height="40" fill="#131c2e" stroke="#FF9900" strokeWidth="1" />
      <ellipse cx="100" cy="95" rx="70" ry="10" fill="#131c2e" stroke="#FF9900" strokeWidth="1" />
      {/* Stator lines */}
      {[-60,-40,-20,0,20,40,60].map(dx => (
        <line key={dx} x1={100+dx} y1="18" x2={100+dx} y2="55" stroke="#252e42" strokeWidth="1.5" />
      ))}
      {/* Center hub */}
      <circle cx="100" cy="55" r="15" fill="#1e2a3c" stroke="#aaa" strokeWidth="1.2" />
      <circle cx="100" cy="55" r="7" fill="#2a3548" stroke="#777" strokeWidth="1" />
      {/* Shaft */}
      <rect x="165" y="50" width="35" height="10" rx="4" fill="#555" stroke="#777" strokeWidth="1" />
      {/* Motor M */}
      <text x="100" y="60" textAnchor="middle" fill="#FF9900" fontSize="11" fontWeight="bold" fontFamily="monospace">M</text>
      {/* Cable conduit */}
      <rect x="62" y="12" width="22" height="10" rx="2" fill="#202840" stroke="#888" strokeWidth="1" />
      <text x="73" y="8" textAnchor="middle" fill="#888" fontSize="8" fontFamily="monospace">LEADS</text>
      <text x="100" y="104" textAnchor="middle" fill="#555" fontSize="9" fontFamily="monospace">PANCAKE / AXIAL FLUX MOTOR</text>
    </svg>
  );
}

function IllustBLDC() {
  return (
    <svg viewBox="0 0 240 110" fill="none" style={{ width: '100%', maxWidth: 240, height: 'auto' }}>
      {/* Controller box */}
      <rect x="10" y="35" width="65" height="45" rx="4" fill="#1e2a3c" stroke="#5599ff" strokeWidth="1.5" />
      <text x="42" y="55" textAnchor="middle" fill="#5599ff" fontSize="8" fontFamily="monospace">BLDC</text>
      <text x="42" y="66" textAnchor="middle" fill="#5599ff" fontSize="8" fontFamily="monospace">CTRL</text>
      {/* AC input leads to controller */}
      <line x1="0" y1="44" x2="10" y2="44" stroke={W.l1} strokeWidth="1.5" />
      <line x1="0" y1="52" x2="10" y2="52" stroke={W.neutral} strokeWidth="1.5" />
      <line x1="0" y1="60" x2="10" y2="60" stroke={W.gnd} strokeWidth="1.5" />
      <text x="2" y="42" fill="#888" fontSize="7" fontFamily="monospace">AC</text>
      {/* 3-phase output from controller */}
      <line x1="75" y1="44" x2="105" y2="44" stroke={W.l1} strokeWidth="1.5" />
      <line x1="75" y1="52" x2="105" y2="52" stroke={W.l2} strokeWidth="1.5" />
      <line x1="75" y1="60" x2="105" y2="60" stroke={W.l3} strokeWidth="1.5" />
      <text x="88" y="40" textAnchor="middle" fill="#888" fontSize="7" fontFamily="monospace">U/V/W</text>
      {/* Motor body */}
      <rect x="105" y="30" width="80" height="55" rx="8" fill="#1a2133" stroke="#FF9900" strokeWidth="1.5" />
      <rect x="182" y="38" width="22" height="39" rx="11" fill="#131c2e" stroke="#FF9900" strokeWidth="1.5" />
      <rect x="200" y="50" width="28" height="12" rx="4" fill="#555" stroke="#777" strokeWidth="1" />
      <circle cx="145" cy="57" r="16" fill="none" stroke="#FF9900" strokeWidth="1.5" />
      <text x="145" y="62" textAnchor="middle" fill="#FF9900" fontSize="13" fontWeight="bold" fontFamily="monospace">M</text>
      <text x="120" y="100" textAnchor="middle" fill="#555" fontSize="9" fontFamily="monospace">BRUSHLESS DC MOTOR</text>
    </svg>
  );
}

function IllustServo({ model }) {
  return (
    <svg viewBox="0 0 240 110" fill="none" style={{ width: '100%', maxWidth: 240, height: 'auto' }}>
      {/* Motor body */}
      <rect x="40" y="28" width="120" height="58" rx="8" fill="#1a2133" stroke="#FF9900" strokeWidth="1.5" />
      {/* Cooling fins */}
      {[52,64,76,88,100,112,124,136,148].map(x => (
        <rect key={x} x={x} y="20" width="6" height="9" rx="1" fill="#252e42" stroke="#3a4560" strokeWidth="0.8" />
      ))}
      {/* Front end bell */}
      <rect x="160" y="38" width="26" height="38" rx="13" fill="#131c2e" stroke="#FF9900" strokeWidth="1.5" />
      {/* Encoder cap (back) */}
      <rect x="16" y="34" width="30" height="46" rx="10" fill="#1e2a3c" stroke={W.signal} strokeWidth="1.5" />
      <circle cx="31" cy="57" r="10" fill="none" stroke={W.signal} strokeWidth="1" />
      <text x="31" y="61" textAnchor="middle" fill={W.signal} fontSize="7" fontFamily="monospace">ENC</text>
      {/* Shaft */}
      <rect x="183" y="50" width="30" height="12" rx="4" fill="#555" stroke="#777" strokeWidth="1" />
      {/* Motor M */}
      <circle cx="100" cy="57" r="16" fill="none" stroke="#FF9900" strokeWidth="1.5" />
      <text x="100" y="62" textAnchor="middle" fill="#FF9900" fontSize="13" fontWeight="bold" fontFamily="monospace">M</text>
      {/* Signal cable from encoder */}
      <line x1="10" y1="50" x2="0" y2="50" stroke={W.signal} strokeWidth="1.5" strokeDasharray="3 2" />
      <text x="0" y="46" fill={W.signal} fontSize="7" fontFamily="monospace">SIG</text>
      {/* Model badge */}
      <rect x="56" y="48" width="36" height="14" rx="2" fill="#1e2a3c" stroke="#555" strokeWidth="0.8" />
      <text x="74" y="59" textAnchor="middle" fill="#aaa" fontSize="8" fontFamily="monospace">{model}</text>
      <text x="120" y="100" textAnchor="middle" fill="#555" fontSize="9" fontFamily="monospace">SERVO MOTOR — {model.toUpperCase()}</text>
    </svg>
  );
}

/* ─── Wiring Diagram SVGs ────────────────────────────────────────────────── */

/* Shared building blocks */
function Fuse({ x, y, color }) {
  return (
    <g>
      <rect x={x - 8} y={y - 4} width={16} height={8} rx={4} fill="#1e2a3c" stroke={color} strokeWidth={1.2} />
      <line x1={x - 14} y1={y} x2={x - 8} y2={y} stroke={color} strokeWidth={1.5} />
      <line x1={x + 8} y1={y} x2={x + 14} y2={y} stroke={color} strokeWidth={1.5} />
    </g>
  );
}

function MotorSymbol({ cx, cy, label = 'M', size = 26 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={size} fill="#1a2133" stroke="#FF9900" strokeWidth={2} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="#FF9900" fontSize={size * 0.72} fontWeight="bold" fontFamily="monospace">{label}</text>
    </g>
  );
}

function DriveBox({ x, y, w, h, label, color = '#5599ff' }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#1a2235" stroke={color} strokeWidth={1.5} />
      {label.map((line, i) => (
        <text key={i} x={x + w / 2} y={y + 16 + i * 13} textAnchor="middle" fill={color} fontSize={9} fontFamily="monospace">{line}</text>
      ))}
    </g>
  );
}

function PanelBox({ x, y, w, h, title }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#12192a" stroke="#555" strokeWidth={1.5} />
      <rect x={x} y={y} width={w} height={14} rx={4} fill="#1e2a3c" stroke="#555" strokeWidth={1} />
      <rect x={x} y={y + 8} width={w} height={6} fill="#1e2a3c" />
      <text x={x + w / 2} y={y + 10} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">{title}</text>
    </g>
  );
}

function GndSymbol({ x, y }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 8} stroke={W.gnd} strokeWidth={1.5} />
      <line x1={x - 8} y1={y + 8} x2={x + 8} y2={y + 8} stroke={W.gnd} strokeWidth={2} />
      <line x1={x - 5} y1={y + 11} x2={x + 5} y2={y + 11} stroke={W.gnd} strokeWidth={1.5} />
      <line x1={x - 2} y1={y + 14} x2={x + 2} y2={y + 14} stroke={W.gnd} strokeWidth={1} />
    </g>
  );
}

/* ── Wiring: single phase 120VAC direct-to-motor (ACIM/Pancake) ─────────── */
function Diag120VAC_Direct({ motorLabel = 'M', termLabels = ['T1', 'T2'] }) {
  const panelX = 20, fX = 170, mtX = 360, mtY = 120;
  return (
    <svg viewBox="0 0 500 220" fill="none" style={{ width: '100%', height: 'auto' }}>
      {/* Panel */}
      <PanelBox x={panelX} y={30} w={80} h={130} title="PANEL" />
      <text x={panelX + 40} y={68} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">120VAC</text>
      <text x={panelX + 40} y={80} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">1-PHASE</text>
      {/* Breaker symbol */}
      <rect x={panelX + 28} y={88} width={24} height={14} rx={2} fill="#1e2a3c" stroke="#aaa" strokeWidth={1} />
      <line x1={panelX + 40} y1={88} x2={panelX + 40} y2={102} stroke="#aaa" strokeWidth={1} />
      <text x={panelX + 40} y={97} textAnchor="middle" fill="#aaa" fontSize={7} fontFamily="monospace">BKR</text>

      {/* ── L1 / Hot ── */}
      <text x={panelX + 6} y={124} fill={W.l1} fontSize={8} fontFamily="monospace">L1</text>
      <line x1={panelX + 80} y1={120} x2={fX - 14} y2={120} stroke={W.l1} strokeWidth={2} />
      <Fuse x={fX} y={120} color={W.l1} />
      <line x1={fX + 14} y1={120} x2={mtX - 30} y2={120} stroke={W.l1} strokeWidth={2} />
      {/* Terminal T1 */}
      <rect x={mtX - 30} y={113} width={30} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
      <text x={mtX - 15} y={122} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{termLabels[0]}</text>
      <line x1={mtX} y1={120} x2={mtX + 4} y2={120} stroke={W.l1} strokeWidth={2} />

      {/* ── Neutral ── */}
      <text x={panelX + 6} y={154} fill={W.neutral} fontSize={8} fontFamily="monospace">N</text>
      <line x1={panelX + 80} y1={150} x2={fX - 14} y2={150} stroke={W.neutral} strokeWidth={2} />
      <Fuse x={fX} y={150} color={W.neutral} />
      <line x1={fX + 14} y1={150} x2={mtX - 30} y2={150} stroke={W.neutral} strokeWidth={2} />
      {/* Terminal T2 */}
      <rect x={mtX - 30} y={143} width={30} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
      <text x={mtX - 15} y={152} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{termLabels[1]}</text>
      <line x1={mtX} y1={150} x2={mtX + 4} y2={150} stroke={W.neutral} strokeWidth={2} />

      {/* ── GND ── */}
      <text x={panelX + 6} y={172} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={panelX + 80} y1={168} x2={mtX - 26} y2={168} stroke={W.gnd} strokeWidth={2} />
      <GndSymbol x={mtX - 18} y={168} />

      {/* Motor */}
      <MotorSymbol cx={mtX + 34} cy={mtY + 15} />
      {/* Connect wires to motor circle */}
      <line x1={mtX + 4} y1={120} x2={mtX + 8} y2={120} stroke={W.l1} strokeWidth={2} />
      <line x1={mtX + 4} y1={150} x2={mtX + 8} y2={150} stroke={W.neutral} strokeWidth={2} />

      {/* Labels */}
      <text x={fX} y={200} textAnchor="middle" fill="#555" fontSize={8} fontFamily="monospace">FUSE</text>
      <text x={mtX + 34} y={175} textAnchor="middle" fill="#FF9900" fontSize={9} fontFamily="monospace">{motorLabel}</text>
      <text x={250} y={215} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">1-PHASE 120VAC WIRING</text>
    </svg>
  );
}

/* ── 240VAC single-phase direct ─────────────────────────────────────────── */
function Diag240VAC_Direct({ motorLabel = 'M', termLabels = ['T1', 'T2'] }) {
  const panelX = 20, fX = 170, mtX = 360, mtY = 105;
  return (
    <svg viewBox="0 0 500 220" fill="none" style={{ width: '100%', height: 'auto' }}>
      <PanelBox x={panelX} y={30} w={80} h={140} title="PANEL" />
      <text x={panelX + 40} y={68} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">240VAC</text>
      <text x={panelX + 40} y={80} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">1-PHASE</text>
      <rect x={panelX + 28} y={88} width={24} height={14} rx={2} fill="#1e2a3c" stroke="#aaa" strokeWidth={1} />
      <text x={panelX + 40} y={97} textAnchor="middle" fill="#aaa" fontSize={7} fontFamily="monospace">BKR</text>

      {/* L1 */}
      <text x={panelX + 6} y={118} fill={W.l1} fontSize={8} fontFamily="monospace">L1</text>
      <line x1={panelX + 80} y1={114} x2={fX - 14} y2={114} stroke={W.l1} strokeWidth={2} />
      <Fuse x={fX} y={114} color={W.l1} />
      <line x1={fX + 14} y1={114} x2={mtX - 30} y2={114} stroke={W.l1} strokeWidth={2} />
      <rect x={mtX - 30} y={107} width={30} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
      <text x={mtX - 15} y={116} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{termLabels[0]}</text>
      <line x1={mtX} y1={114} x2={mtX + 6} y2={114} stroke={W.l1} strokeWidth={2} />

      {/* L2 */}
      <text x={panelX + 6} y={146} fill={W.l2} fontSize={8} fontFamily="monospace">L2</text>
      <line x1={panelX + 80} y1={142} x2={fX - 14} y2={142} stroke={W.l2} strokeWidth={2} />
      <Fuse x={fX} y={142} color={W.l2} />
      <line x1={fX + 14} y1={142} x2={mtX - 30} y2={142} stroke={W.l2} strokeWidth={2} />
      <rect x={mtX - 30} y={135} width={30} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
      <text x={mtX - 15} y={144} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{termLabels[1]}</text>
      <line x1={mtX} y1={142} x2={mtX + 6} y2={142} stroke={W.l2} strokeWidth={2} />

      {/* GND */}
      <text x={panelX + 6} y={168} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={panelX + 80} y1={164} x2={mtX - 24} y2={164} stroke={W.gnd} strokeWidth={2} />
      <GndSymbol x={mtX - 16} y={164} />

      {/* No neutral note */}
      <text x={panelX + 40} y={156} textAnchor="middle" fill="#555" fontSize={7} fontFamily="monospace">No Neutral</text>

      {/* Motor */}
      <MotorSymbol cx={mtX + 34} cy={mtY + 25} />

      <text x={fX} y={200} textAnchor="middle" fill="#555" fontSize={8} fontFamily="monospace">FUSE</text>
      <text x={mtX + 34} y={170} textAnchor="middle" fill="#FF9900" fontSize={9} fontFamily="monospace">{motorLabel}</text>
      <text x={250} y={215} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">1-PHASE 240VAC WIRING</text>
    </svg>
  );
}

/* ── 480VAC 3-phase direct ──────────────────────────────────────────────── */
function Diag480VAC_Direct({ motorLabel = 'M', termLabels = ['T1', 'T2', 'T3'] }) {
  const panelX = 20, fX = 170, mtX = 355;
  const rows = [
    { y: 100, color: W.l1, tag: 'L1', term: termLabels[0] },
    { y: 126, color: W.l2, tag: 'L2', term: termLabels[1] },
    { y: 152, color: W.l3, tag: 'L3', term: termLabels[2] },
  ];
  return (
    <svg viewBox="0 0 500 225" fill="none" style={{ width: '100%', height: 'auto' }}>
      <PanelBox x={panelX} y={30} w={80} h={160} title="PANEL" />
      <text x={panelX + 40} y={68} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">480VAC</text>
      <text x={panelX + 40} y={80} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">3-PHASE</text>
      <rect x={panelX + 26} y={84} width={28} height={14} rx={2} fill="#1e2a3c" stroke="#aaa" strokeWidth={1} />
      <text x={panelX + 40} y={93} textAnchor="middle" fill="#aaa" fontSize={7} fontFamily="monospace">BKR</text>

      {/* Overload relay */}
      <rect x={fX + 30} y={86} width={36} height={80} rx={3} fill="#1a1e2c" stroke="#ff8800" strokeWidth={1.2} />
      <text x={fX + 48} y={120} textAnchor="middle" fill="#ff8800" fontSize={8} fontFamily="monospace">OL</text>
      <text x={fX + 48} y={132} textAnchor="middle" fill="#ff8800" fontSize={8} fontFamily="monospace">RLY</text>

      {rows.map(({ y, color, tag, term }) => (
        <g key={tag}>
          <text x={panelX + 6} y={y + 4} fill={color} fontSize={8} fontFamily="monospace">{tag}</text>
          <line x1={panelX + 80} y1={y} x2={fX - 14} y2={y} stroke={color} strokeWidth={2} />
          <Fuse x={fX} y={y} color={color} />
          <line x1={fX + 14} y1={y} x2={fX + 30} y2={y} stroke={color} strokeWidth={2} />
          {/* through OL relay */}
          <line x1={fX + 66} y1={y} x2={mtX - 30} y2={y} stroke={color} strokeWidth={2} />
          <rect x={mtX - 30} y={y - 7} width={30} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
          <text x={mtX - 15} y={y + 4} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{term}</text>
          <line x1={mtX} y1={y} x2={mtX + 6} y2={y} stroke={color} strokeWidth={2} />
        </g>
      ))}

      {/* GND */}
      <text x={panelX + 6} y={182} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={panelX + 80} y1={178} x2={mtX - 22} y2={178} stroke={W.gnd} strokeWidth={2} />
      <GndSymbol x={mtX - 14} y={178} />

      {/* Motor */}
      <MotorSymbol cx={mtX + 36} cy={128} />

      <text x={fX + 48} y={175} textAnchor="middle" fill="#ff8800" fontSize={8} fontFamily="monospace">OVL RELAY</text>
      <text x={fX} y={200} textAnchor="middle" fill="#555" fontSize={8} fontFamily="monospace">FUSE</text>
      <text x={mtX + 36} y={180} textAnchor="middle" fill="#FF9900" fontSize={9} fontFamily="monospace">{motorLabel}</text>
      <text x={250} y={218} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">3-PHASE 480VAC WIRING</text>
    </svg>
  );
}

/* ── MDR 120VAC: AC → power supply → 24VDC → roller ───────────────────── */
function DiagMDR120VAC() {
  const px = 20, psX = 200, rX = 380;
  return (
    <svg viewBox="0 0 500 220" fill="none" style={{ width: '100%', height: 'auto' }}>
      <PanelBox x={px} y={40} w={80} h={110} title="PANEL" />
      <text x={px + 40} y={78} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">120VAC</text>

      {/* AC to PS */}
      <text x={px + 6} y={104} fill={W.l1} fontSize={8} fontFamily="monospace">L1</text>
      <line x1={px + 80} y1={100} x2={psX} y2={100} stroke={W.l1} strokeWidth={2} />
      <text x={px + 6} y={120} fill={W.neutral} fontSize={8} fontFamily="monospace">N</text>
      <line x1={px + 80} y1={116} x2={psX} y2={116} stroke={W.neutral} strokeWidth={2} />
      <text x={px + 6} y={136} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={px + 80} y1={132} x2={psX} y2={132} stroke={W.gnd} strokeWidth={2} />

      {/* Power supply box */}
      <DriveBox x={psX} y={80} w={80} h={70} label={['24 VDC', 'POWER', 'SUPPLY']} color="#aaaaaa" />
      <text x={psX + 40} y={76} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">AC IN</text>

      {/* DC output to roller */}
      <text x={psX + 78} y={102} fill={W.dcPos} fontSize={8} fontFamily="monospace">+</text>
      <line x1={psX + 80} y1={100} x2={rX - 10} y2={100} stroke={W.dcPos} strokeWidth={2} />
      <text x={psX + 78} y={118} fill={W.dcNeg} fontSize={8} fontFamily="monospace">−</text>
      <line x1={psX + 80} y1={116} x2={rX - 10} y2={116} stroke={W.dcNeg} strokeWidth={2} />
      <line x1={psX + 80} y1={132} x2={rX - 10} y2={132} stroke={W.gnd} strokeWidth={2} />

      {/* Roller terminal block */}
      <rect x={rX - 10} y={86} width={36} height={58} rx={3} fill="#1e2a3c" stroke="#aaa" strokeWidth={1} />
      <text x={rX + 8} y={106} textAnchor="middle" fill="#FF6600" fontSize={8} fontFamily="monospace">+24V</text>
      <text x={rX + 8} y={120} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">0 V</text>
      <text x={rX + 8} y={134} textAnchor="middle" fill={W.gnd} fontSize={8} fontFamily="monospace">PE</text>

      {/* Roller symbol */}
      <rect x={rX + 28} y={88} width={60} height={44} rx={18} fill="#1a2133" stroke="#FF9900" strokeWidth={1.5} />
      <ellipse cx={rX + 28} cy={110} rx={12} ry={18} fill="#131c2e" stroke="#FF9900" strokeWidth={1.5} />
      <ellipse cx={rX + 88} cy={110} rx={12} ry={18} fill="#131c2e" stroke="#FF9900" strokeWidth={1.5} />
      <circle cx={rX + 44} cy={110} r={9} fill="none" stroke="#FF9900" strokeWidth={1} strokeDasharray="3 2" />
      <text x={rX + 44} y={114} textAnchor="middle" fill="#FF9900" fontSize={8} fontWeight="bold" fontFamily="monospace">M</text>

      <text x={psX + 40} y={175} textAnchor="middle" fill="#555" fontSize={8} fontFamily="monospace">24 VDC SUPPLY</text>
      <text x={250} y={215} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">MDR — 1-PHASE 120VAC → 24VDC WIRING</text>
    </svg>
  );
}

/* ── MDR 240VAC ─────────────────────────────────────────────────────────── */
function DiagMDR240VAC() {
  const px = 20, psX = 200, rX = 380;
  return (
    <svg viewBox="0 0 500 220" fill="none" style={{ width: '100%', height: 'auto' }}>
      <PanelBox x={px} y={40} w={80} h={110} title="PANEL" />
      <text x={px + 40} y={78} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">240VAC</text>

      <text x={px + 6} y={104} fill={W.l1} fontSize={8} fontFamily="monospace">L1</text>
      <line x1={px + 80} y1={100} x2={psX} y2={100} stroke={W.l1} strokeWidth={2} />
      <text x={px + 6} y={120} fill={W.l2} fontSize={8} fontFamily="monospace">L2</text>
      <line x1={px + 80} y1={116} x2={psX} y2={116} stroke={W.l2} strokeWidth={2} />
      <text x={px + 6} y={136} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={px + 80} y1={132} x2={psX} y2={132} stroke={W.gnd} strokeWidth={2} />

      <DriveBox x={psX} y={80} w={80} h={70} label={['24 VDC', 'POWER', 'SUPPLY']} color="#aaaaaa" />
      <text x={psX + 40} y={76} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">AC IN</text>

      <text x={psX + 78} y={102} fill={W.dcPos} fontSize={8} fontFamily="monospace">+</text>
      <line x1={psX + 80} y1={100} x2={rX - 10} y2={100} stroke={W.dcPos} strokeWidth={2} />
      <text x={psX + 78} y={118} fill={W.dcNeg} fontSize={8} fontFamily="monospace">−</text>
      <line x1={psX + 80} y1={116} x2={rX - 10} y2={116} stroke={W.dcNeg} strokeWidth={2} />
      <line x1={psX + 80} y1={132} x2={rX - 10} y2={132} stroke={W.gnd} strokeWidth={2} />

      <rect x={rX - 10} y={86} width={36} height={58} rx={3} fill="#1e2a3c" stroke="#aaa" strokeWidth={1} />
      <text x={rX + 8} y={106} textAnchor="middle" fill="#FF6600" fontSize={8} fontFamily="monospace">+24V</text>
      <text x={rX + 8} y={120} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">0 V</text>
      <text x={rX + 8} y={134} textAnchor="middle" fill={W.gnd} fontSize={8} fontFamily="monospace">PE</text>

      <rect x={rX + 28} y={88} width={60} height={44} rx={18} fill="#1a2133" stroke="#FF9900" strokeWidth={1.5} />
      <ellipse cx={rX + 28} cy={110} rx={12} ry={18} fill="#131c2e" stroke="#FF9900" strokeWidth={1.5} />
      <ellipse cx={rX + 88} cy={110} rx={12} ry={18} fill="#131c2e" stroke="#FF9900" strokeWidth={1.5} />
      <circle cx={rX + 44} cy={110} r={9} fill="none" stroke="#FF9900" strokeWidth={1} strokeDasharray="3 2" />
      <text x={rX + 44} y={114} textAnchor="middle" fill="#FF9900" fontSize={8} fontWeight="bold" fontFamily="monospace">M</text>

      <text x={psX + 40} y={175} textAnchor="middle" fill="#555" fontSize={8} fontFamily="monospace">24 VDC SUPPLY</text>
      <text x={250} y={215} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">MDR — 1-PHASE 240VAC → 24VDC WIRING</text>
    </svg>
  );
}

/* ── BLDC 120VAC: AC → controller → U/V/W → motor ─────────────────────── */
function DiagBLDC120VAC() {
  const px = 20, ctX = 190, mtX = 360;
  return (
    <svg viewBox="0 0 500 230" fill="none" style={{ width: '100%', height: 'auto' }}>
      <PanelBox x={px} y={40} w={80} h={120} title="PANEL" />
      <text x={px + 40} y={78} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">120VAC</text>

      {/* AC lines */}
      <text x={px + 6} y={106} fill={W.l1} fontSize={8} fontFamily="monospace">L1</text>
      <line x1={px + 80} y1={102} x2={ctX} y2={102} stroke={W.l1} strokeWidth={2} />
      <text x={px + 6} y={122} fill={W.neutral} fontSize={8} fontFamily="monospace">N</text>
      <line x1={px + 80} y1={118} x2={ctX} y2={118} stroke={W.neutral} strokeWidth={2} />
      <text x={px + 6} y={138} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={px + 80} y1={134} x2={ctX} y2={134} stroke={W.gnd} strokeWidth={2} />

      {/* Controller */}
      <DriveBox x={ctX} y={72} w={80} h={90} label={['BLDC', 'CTRL', '/ VFD']} color="#5599ff" />
      <text x={ctX + 40} y={68} textAnchor="middle" fill="#5599ff" fontSize={8} fontFamily="monospace">AC IN</text>
      <text x={ctX + 78} y={68} fill="#5599ff" fontSize={8} fontFamily="monospace">OUT</text>

      {/* 3-phase UVW output */}
      {[['U', W.l1, 102], ['V', W.l2, 118], ['W', W.l3, 134]].map(([tag, color, y]) => (
        <g key={tag}>
          <line x1={ctX + 80} y1={y} x2={mtX - 32} y2={y} stroke={color} strokeWidth={2} />
          <rect x={mtX - 32} y={y - 7} width={28} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
          <text x={mtX - 18} y={y + 4} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{tag}</text>
          <line x1={mtX - 4} y1={y} x2={mtX + 4} y2={y} stroke={color} strokeWidth={2} />
        </g>
      ))}

      {/* GND to motor */}
      <line x1={ctX + 80} y1={155} x2={mtX - 20} y2={155} stroke={W.gnd} strokeWidth={2} />
      <GndSymbol x={mtX - 12} y={155} />

      {/* Motor */}
      <MotorSymbol cx={mtX + 34} cy={118} />

      <text x={ctX + 40} y={182} textAnchor="middle" fill="#5599ff" fontSize={8} fontFamily="monospace">CONTROLLER</text>
      <text x={mtX + 34} y={170} textAnchor="middle" fill="#FF9900" fontSize={9} fontFamily="monospace">BLDC</text>
      <text x={250} y={220} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">BLDC — 1-PHASE 120VAC → CONTROLLER → MOTOR</text>
    </svg>
  );
}

/* ── BLDC 240VAC ─────────────────────────────────────────────────────────── */
function DiagBLDC240VAC() {
  const px = 20, ctX = 190, mtX = 360;
  return (
    <svg viewBox="0 0 500 230" fill="none" style={{ width: '100%', height: 'auto' }}>
      <PanelBox x={px} y={40} w={80} h={120} title="PANEL" />
      <text x={px + 40} y={78} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">240VAC</text>

      <text x={px + 6} y={106} fill={W.l1} fontSize={8} fontFamily="monospace">L1</text>
      <line x1={px + 80} y1={102} x2={ctX} y2={102} stroke={W.l1} strokeWidth={2} />
      <text x={px + 6} y={122} fill={W.l2} fontSize={8} fontFamily="monospace">L2</text>
      <line x1={px + 80} y1={118} x2={ctX} y2={118} stroke={W.l2} strokeWidth={2} />
      <text x={px + 6} y={138} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={px + 80} y1={134} x2={ctX} y2={134} stroke={W.gnd} strokeWidth={2} />

      <DriveBox x={ctX} y={72} w={80} h={90} label={['BLDC', 'CTRL', '/ VFD']} color="#5599ff" />
      <text x={ctX + 40} y={68} textAnchor="middle" fill="#5599ff" fontSize={8} fontFamily="monospace">AC IN</text>

      {[['U', W.l1, 102], ['V', W.l2, 118], ['W', W.l3, 134]].map(([tag, color, y]) => (
        <g key={tag}>
          <line x1={ctX + 80} y1={y} x2={mtX - 32} y2={y} stroke={color} strokeWidth={2} />
          <rect x={mtX - 32} y={y - 7} width={28} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
          <text x={mtX - 18} y={y + 4} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{tag}</text>
          <line x1={mtX - 4} y1={y} x2={mtX + 4} y2={y} stroke={color} strokeWidth={2} />
        </g>
      ))}

      <line x1={ctX + 80} y1={155} x2={mtX - 20} y2={155} stroke={W.gnd} strokeWidth={2} />
      <GndSymbol x={mtX - 12} y={155} />

      <MotorSymbol cx={mtX + 34} cy={118} />

      <text x={ctX + 40} y={182} textAnchor="middle" fill="#5599ff" fontSize={8} fontFamily="monospace">CONTROLLER</text>
      <text x={mtX + 34} y={170} textAnchor="middle" fill="#FF9900" fontSize={9} fontFamily="monospace">BLDC</text>
      <text x={250} y={220} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">BLDC — 1-PHASE 240VAC → CONTROLLER → MOTOR</text>
    </svg>
  );
}

/* ── Servo 120VAC ────────────────────────────────────────────────────────── */
function DiagServo120VAC({ model }) {
  const px = 20, drX = 185, mtX = 355;
  return (
    <svg viewBox="0 0 500 235" fill="none" style={{ width: '100%', height: 'auto' }}>
      <PanelBox x={px} y={40} w={80} h={120} title="PANEL" />
      <text x={px + 40} y={78} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">120VAC</text>

      <text x={px + 6} y={106} fill={W.l1} fontSize={8} fontFamily="monospace">L1</text>
      <line x1={px + 80} y1={102} x2={drX} y2={102} stroke={W.l1} strokeWidth={2} />
      <text x={px + 6} y={122} fill={W.neutral} fontSize={8} fontFamily="monospace">N</text>
      <line x1={px + 80} y1={118} x2={drX} y2={118} stroke={W.neutral} strokeWidth={2} />
      <text x={px + 6} y={138} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={px + 80} y1={134} x2={drX} y2={134} stroke={W.gnd} strokeWidth={2} />

      {/* Servo drive */}
      <DriveBox x={drX} y={68} w={82} h={96} label={['SERVO', 'DRIVE', `(${model})`]} color="#cc88ff" />
      <text x={drX + 41} y={64} textAnchor="middle" fill="#cc88ff" fontSize={8} fontFamily="monospace">AC IN</text>

      {/* Power output U/V/W */}
      {[['U', W.l1, 98], ['V', W.l2, 114], ['W', W.l3, 130]].map(([tag, color, y]) => (
        <g key={tag}>
          <line x1={drX + 82} y1={y} x2={mtX - 30} y2={y} stroke={color} strokeWidth={2} />
          <rect x={mtX - 30} y={y - 7} width={28} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
          <text x={mtX - 16} y={y + 4} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{tag}</text>
          <line x1={mtX - 2} y1={y} x2={mtX + 4} y2={y} stroke={color} strokeWidth={2} />
        </g>
      ))}

      {/* Encoder feedback (dashed) */}
      <line x1={mtX + 4} y1={155} x2={drX + 41} y2={172} stroke={W.signal} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={mtX + 30} y={158} fill={W.signal} fontSize={8} fontFamily="monospace">ENC ←</text>

      {/* GND */}
      <line x1={drX + 82} y1={150} x2={mtX - 18} y2={150} stroke={W.gnd} strokeWidth={2} />
      <GndSymbol x={mtX - 10} y={150} />

      {/* Motor */}
      <MotorSymbol cx={mtX + 34} cy={114} />

      <text x={drX + 41} y={183} textAnchor="middle" fill="#cc88ff" fontSize={8} fontFamily="monospace">SERVO DRIVE</text>
      <text x={mtX + 34} y={164} textAnchor="middle" fill="#FF9900" fontSize={9} fontFamily="monospace">{model}</text>
      <text x={250} y={225} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">SERVO {model.toUpperCase()} — 1-PHASE 120VAC WIRING</text>
    </svg>
  );
}

/* ── Servo 240VAC ────────────────────────────────────────────────────────── */
function DiagServo240VAC({ model }) {
  const px = 20, drX = 185, mtX = 355;
  return (
    <svg viewBox="0 0 500 235" fill="none" style={{ width: '100%', height: 'auto' }}>
      <PanelBox x={px} y={40} w={80} h={120} title="PANEL" />
      <text x={px + 40} y={78} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">240VAC</text>

      <text x={px + 6} y={106} fill={W.l1} fontSize={8} fontFamily="monospace">L1</text>
      <line x1={px + 80} y1={102} x2={drX} y2={102} stroke={W.l1} strokeWidth={2} />
      <text x={px + 6} y={122} fill={W.l2} fontSize={8} fontFamily="monospace">L2</text>
      <line x1={px + 80} y1={118} x2={drX} y2={118} stroke={W.l2} strokeWidth={2} />
      <text x={px + 6} y={138} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={px + 80} y1={134} x2={drX} y2={134} stroke={W.gnd} strokeWidth={2} />

      <DriveBox x={drX} y={68} w={82} h={96} label={['SERVO', 'DRIVE', `(${model})`]} color="#cc88ff" />
      <text x={drX + 41} y={64} textAnchor="middle" fill="#cc88ff" fontSize={8} fontFamily="monospace">AC IN</text>

      {[['U', W.l1, 98], ['V', W.l2, 114], ['W', W.l3, 130]].map(([tag, color, y]) => (
        <g key={tag}>
          <line x1={drX + 82} y1={y} x2={mtX - 30} y2={y} stroke={color} strokeWidth={2} />
          <rect x={mtX - 30} y={y - 7} width={28} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
          <text x={mtX - 16} y={y + 4} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{tag}</text>
          <line x1={mtX - 2} y1={y} x2={mtX + 4} y2={y} stroke={color} strokeWidth={2} />
        </g>
      ))}

      <line x1={mtX + 4} y1={155} x2={drX + 41} y2={172} stroke={W.signal} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={mtX + 30} y={158} fill={W.signal} fontSize={8} fontFamily="monospace">ENC ←</text>

      <line x1={drX + 82} y1={150} x2={mtX - 18} y2={150} stroke={W.gnd} strokeWidth={2} />
      <GndSymbol x={mtX - 10} y={150} />

      <MotorSymbol cx={mtX + 34} cy={114} />

      <text x={drX + 41} y={183} textAnchor="middle" fill="#cc88ff" fontSize={8} fontFamily="monospace">SERVO DRIVE</text>
      <text x={mtX + 34} y={164} textAnchor="middle" fill="#FF9900" fontSize={9} fontFamily="monospace">{model}</text>
      <text x={250} y={225} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">SERVO {model.toUpperCase()} — 1-PHASE 240VAC WIRING</text>
    </svg>
  );
}

/* ── Servo 480VAC ────────────────────────────────────────────────────────── */
function DiagServo480VAC({ model }) {
  const px = 20, drX = 185, mtX = 355;
  return (
    <svg viewBox="0 0 500 240" fill="none" style={{ width: '100%', height: 'auto' }}>
      <PanelBox x={px} y={30} w={80} h={150} title="PANEL" />
      <text x={px + 40} y={68} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">480VAC</text>
      <text x={px + 40} y={79} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">3-PHASE</text>

      {[['L1', W.l1, 96], ['L2', W.l2, 112], ['L3', W.l3, 128]].map(([tag, color, y]) => (
        <g key={tag}>
          <text x={px + 6} y={y + 4} fill={color} fontSize={8} fontFamily="monospace">{tag}</text>
          <line x1={px + 80} y1={y} x2={drX} y2={y} stroke={color} strokeWidth={2} />
        </g>
      ))}
      <text x={px + 6} y={150} fill={W.gnd} fontSize={8} fontFamily="monospace">GND</text>
      <line x1={px + 80} y1={146} x2={drX} y2={146} stroke={W.gnd} strokeWidth={2} />

      <DriveBox x={drX} y={64} w={82} h={106} label={['SERVO', 'DRIVE', `(${model})`, '480V']} color="#cc88ff" />
      <text x={drX + 41} y={60} textAnchor="middle" fill="#cc88ff" fontSize={8} fontFamily="monospace">AC IN</text>

      {[['U', W.l1, 96], ['V', W.l2, 112], ['W', W.l3, 128]].map(([tag, color, y]) => (
        <g key={tag}>
          <line x1={drX + 82} y1={y} x2={mtX - 30} y2={y} stroke={color} strokeWidth={2} />
          <rect x={mtX - 30} y={y - 7} width={28} height={14} rx={2} fill="#1e2a3c" stroke="#666" strokeWidth={1} />
          <text x={mtX - 16} y={y + 4} textAnchor="middle" fill="#ccc" fontSize={8} fontFamily="monospace">{tag}</text>
          <line x1={mtX - 2} y1={y} x2={mtX + 4} y2={y} stroke={color} strokeWidth={2} />
        </g>
      ))}

      <line x1={mtX + 4} y1={155} x2={drX + 41} y2={178} stroke={W.signal} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={mtX + 30} y={158} fill={W.signal} fontSize={8} fontFamily="monospace">ENC ←</text>

      <line x1={drX + 82} y1={155} x2={mtX - 18} y2={155} stroke={W.gnd} strokeWidth={2} />
      <GndSymbol x={mtX - 10} y={155} />

      <MotorSymbol cx={mtX + 34} cy={112} />

      <text x={drX + 41} y={192} textAnchor="middle" fill="#cc88ff" fontSize={8} fontFamily="monospace">SERVO DRIVE</text>
      <text x={mtX + 34} y={168} textAnchor="middle" fill="#FF9900" fontSize={9} fontFamily="monospace">{model}</text>
      <text x={250} y={230} textAnchor="middle" fill="#555" fontSize={9} fontFamily="monospace">SERVO {model.toUpperCase()} — 3-PHASE 480VAC WIRING</text>
    </svg>
  );
}

/* ─── Diagram dispatcher ─────────────────────────────────────────────────── */
function WiringDiagram({ motor, voltage }) {
  const { type, model } = motor;

  if (type === 'mdr') {
    return voltage === '120VAC' ? <DiagMDR120VAC /> : <DiagMDR240VAC />;
  }

  if (type === 'acim' || type === 'pancake') {
    const label = type === 'pancake' ? 'PANCAKE' : 'ACIM';
    if (voltage === '120VAC') return <Diag120VAC_Direct motorLabel={label} />;
    if (voltage === '240VAC') return <Diag240VAC_Direct motorLabel={label} />;
    return <Diag480VAC_Direct motorLabel={label} />;
  }

  if (type === 'bldc') {
    return voltage === '120VAC' ? <DiagBLDC120VAC /> : <DiagBLDC240VAC />;
  }

  if (type === 'servo') {
    if (voltage === '120VAC') return <DiagServo120VAC model={model} />;
    if (voltage === '240VAC') return <DiagServo240VAC model={model} />;
    return <DiagServo480VAC model={model} />;
  }

  return null;
}

/* ─── Motor illustration dispatcher ─────────────────────────────────────── */
function MotorIllustration({ motor }) {
  switch (motor.type) {
    case 'mdr': return <IllustMDR />;
    case 'acim': return <IllustACIM />;
    case 'pancake': return <IllustPancake />;
    case 'bldc': return <IllustBLDC />;
    case 'servo': return <IllustServo model={motor.model} />;
    default: return null;
  }
}

/* ─── Motor Card ─────────────────────────────────────────────────────────── */
function MotorCard({ motor }) {
  const [activeVoltage, setActiveVoltage] = useState(motor.voltages[0]);

  const tabStyle = (v) => ({
    padding: '5px 14px',
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: 'monospace',
    borderRadius: '5px',
    border: activeVoltage === v ? '1px solid rgba(255,153,0,0.5)' : '1px solid var(--border)',
    background: activeVoltage === v ? 'rgba(255,153,0,0.12)' : 'var(--bg-elevated)',
    color: activeVoltage === v ? '#FF9900' : 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '24px',
    }}>
      {/* Card header */}
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{motor.name}</span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, fontFamily: 'monospace',
            padding: '2px 8px', borderRadius: '4px',
            background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.25)', color: '#FF9900',
          }}>{motor.short}</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {motor.description}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left: illustration */}
        <div style={{
          padding: '20px 16px',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          minHeight: 160,
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Motor Illustration
          </div>
          <MotorIllustration motor={motor} />
        </div>

        {/* Right: wiring diagram */}
        <div style={{ padding: '16px', background: 'var(--bg-primary)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Wiring Diagram
          </div>
          {/* Voltage tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {motor.voltages.map((v) => (
              <button key={v} onClick={() => setActiveVoltage(v)} style={tabStyle(v)}>{v}</button>
            ))}
          </div>
          {/* Diagram */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px' }}>
            <WiringDiagram motor={motor} voltage={activeVoltage} />
          </div>
          {/* Wire legend */}
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { color: W.l1, label: 'L1 / Hot (Black)' },
              { color: W.l2, label: 'L2 (Red)' },
              { color: W.l3, label: 'L3 (Blue)' },
              { color: W.neutral, label: 'Neutral (White)' },
              { color: W.gnd, label: 'Ground (Green)' },
              ...(motor.type === 'mdr' ? [{ color: W.dcPos, label: 'DC+ (Orange)' }] : []),
              ...(motor.type === 'servo' ? [{ color: W.signal, label: 'Encoder (Purple)' }] : []),
            ].map(({ color, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'inline-block', width: 18, height: 3, background: color, borderRadius: 2 }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main view ──────────────────────────────────────────────────────────── */
export default function WiringDiagramsView() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Wiring Diagrams
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 700 }}>
          Reference wiring diagrams for all motor types in the facility. Select a voltage tab to see the applicable schematic.
          Wire colors follow <strong style={{ color: 'var(--text-primary)' }}>NEC / NFPA 79</strong> standards.
          Always de-energize and lock out / tag out (LOTO) before servicing.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
          {[
            { label: 'LOTO Required', color: '#ff8800' },
            { label: 'Verify voltage at panel before wiring', color: '#ff5555' },
            { label: 'GND all motor frames', color: '#44cc55' },
          ].map(({ label, color }) => (
            <span key={label} style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px',
              borderRadius: '99px', border: `1px solid ${color}33`,
              background: `${color}15`, color,
            }}>⚠ {label}</span>
          ))}
        </div>
      </div>

      {/* Motor cards */}
      {MOTORS.map((motor) => (
        <MotorCard key={motor.id} motor={motor} />
      ))}
    </div>
  );
}
