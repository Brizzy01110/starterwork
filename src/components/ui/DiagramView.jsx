import { useState } from 'react';
import { Zap, Info, ChevronDown, ChevronUp } from 'lucide-react';

// ─── SVG MOTOR ILLUSTRATIONS ────────────────────────────────────────────────

const MDR_ILLUSTRATION = `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:280px">
  <rect width="280" height="160" fill="#0f172a" rx="6"/>
  <text x="140" y="18" font-family="monospace" font-size="11" fill="#FF9900" text-anchor="middle" font-weight="bold">Motor-Driven Roller (MDR)</text>
  <!-- Roller tube -->
  <rect x="20" y="55" width="200" height="50" rx="25" fill="#1e293b" stroke="#60a5fa" stroke-width="2"/>
  <!-- Internal motor -->
  <rect x="85" y="65" width="70" height="30" rx="4" fill="#a78bfa" opacity="0.3" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="120" y="83" font-family="monospace" font-size="9" fill="#a78bfa" text-anchor="middle">MOTOR</text>
  <!-- Shaft left -->
  <rect x="0" y="74" width="22" height="12" rx="2" fill="#334155"/>
  <!-- Shaft right -->
  <rect x="218" y="74" width="22" height="12" rx="2" fill="#334155"/>
  <!-- Cable pigtail -->
  <line x1="140" y1="105" x2="140" y2="140" stroke="#94a3b8" stroke-width="2"/>
  <line x1="125" y1="140" x2="155" y2="140" stroke="#94a3b8" stroke-width="2"/>
  <line x1="125" y1="140" x2="120" y2="155" stroke="#ef4444" stroke-width="1.5"/>
  <line x1="140" y1="140" x2="140" y2="155" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="155" y1="140" x2="160" y2="155" stroke="#22c55e" stroke-width="1.5"/>
  <text x="140" y="30" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">Built-in gearbox</text>
  <text x="45" y="48" font-family="monospace" font-size="9" fill="#60a5fa">24VDC / 48VDC</text>
  <text x="120" y="155" font-family="monospace" font-size="8" fill="#94a3b8" text-anchor="middle">PWR / GND / CTRL</text>
</svg>`;

const AC_INDUCTION_ILLUSTRATION = `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:280px">
  <rect width="280" height="160" fill="#0f172a" rx="6"/>
  <text x="140" y="18" font-family="monospace" font-size="11" fill="#FF9900" text-anchor="middle" font-weight="bold">AC Induction Motor</text>
  <!-- Motor body -->
  <rect x="30" y="35" width="140" height="95" rx="8" fill="#1e293b" stroke="#60a5fa" stroke-width="2"/>
  <!-- Cooling fins -->
  <line x1="50" y1="35" x2="50" y2="130" stroke="#334155" stroke-width="1"/>
  <line x1="70" y1="35" x2="70" y2="130" stroke="#334155" stroke-width="1"/>
  <line x1="90" y1="35" x2="90" y2="130" stroke="#334155" stroke-width="1"/>
  <line x1="110" y1="35" x2="110" y2="130" stroke="#334155" stroke-width="1"/>
  <line x1="130" y1="35" x2="130" y2="130" stroke="#334155" stroke-width="1"/>
  <line x1="150" y1="35" x2="150" y2="130" stroke="#334155" stroke-width="1"/>
  <!-- Junction box -->
  <rect x="90" y="55" width="60" height="45" rx="4" fill="#0f172a" stroke="#FF9900" stroke-width="1.5"/>
  <text x="120" y="72" font-family="monospace" font-size="8" fill="#FF9900" text-anchor="middle">T1 T2 T3</text>
  <text x="120" y="85" font-family="monospace" font-size="8" fill="#94a3b8" text-anchor="middle">TERM BOX</text>
  <text x="120" y="95" font-family="monospace" font-size="7" fill="#94a3b8" text-anchor="middle">T7 T8 T9</text>
  <!-- Shaft -->
  <rect x="170" y="76" width="50" height="14" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
  <!-- Fan cover -->
  <rect x="20" y="40" width="12" height="85" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
  <!-- Labels -->
  <text x="235" y="88" font-family="monospace" font-size="9" fill="#94a3b8">SHAFT</text>
  <text x="55" y="150" font-family="monospace" font-size="9" fill="#60a5fa">120V / 240V / 480V</text>
</svg>`;

const PANCAKE_ILLUSTRATION = `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:280px">
  <rect width="280" height="160" fill="#0f172a" rx="6"/>
  <text x="140" y="18" font-family="monospace" font-size="11" fill="#FF9900" text-anchor="middle" font-weight="bold">Pancake (Axial Flux) Motor</text>
  <!-- Flat disc body -->
  <ellipse cx="120" cy="90" rx="85" ry="25" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <ellipse cx="120" cy="78" rx="85" ry="25" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <!-- Top face detail -->
  <ellipse cx="120" cy="78" rx="60" ry="17" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <ellipse cx="120" cy="78" rx="20" ry="6" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
  <!-- Shaft -->
  <rect x="116" y="30" width="8" height="50" rx="2" fill="#94a3b8"/>
  <text x="140" y="48" font-family="monospace" font-size="9" fill="#94a3b8">SHAFT</text>
  <!-- Wires -->
  <line x1="60" y1="90" x2="30" y2="120" stroke="#ef4444" stroke-width="1.5"/>
  <line x1="55" y1="92" x2="20" y2="120" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="50" y1="94" x2="10" y2="120" stroke="#22c55e" stroke-width="1.5"/>
  <text x="120" y="145" font-family="monospace" font-size="9" fill="#34d399" text-anchor="middle">Low profile / high torque</text>
  <text x="120" y="155" font-family="monospace" font-size="8" fill="#94a3b8" text-anchor="middle">120V / 240V AC</text>
</svg>`;

const BLDC_ILLUSTRATION = `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:280px">
  <rect width="280" height="160" fill="#0f172a" rx="6"/>
  <text x="140" y="18" font-family="monospace" font-size="11" fill="#FF9900" text-anchor="middle" font-weight="bold">Brushless DC Motor (BLDC)</text>
  <!-- Motor body -->
  <rect x="40" y="40" width="100" height="80" rx="6" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
  <!-- Stator lines -->
  <line x1="55" y1="40" x2="55" y2="120" stroke="#334155" stroke-width="1"/>
  <line x1="70" y1="40" x2="70" y2="120" stroke="#334155" stroke-width="1"/>
  <line x1="85" y1="40" x2="85" y2="120" stroke="#334155" stroke-width="1"/>
  <line x1="100" y1="40" x2="100" y2="120" stroke="#334155" stroke-width="1"/>
  <line x1="115" y1="40" x2="115" y2="120" stroke="#334155" stroke-width="1"/>
  <!-- Hall sensor box -->
  <rect x="55" y="65" width="70" height="30" rx="3" fill="#0f172a" stroke="#f472b6" stroke-width="1.5"/>
  <text x="90" y="78" font-family="monospace" font-size="8" fill="#f472b6" text-anchor="middle">HALL SENSORS</text>
  <text x="90" y="90" font-family="monospace" font-size="7" fill="#94a3b8" text-anchor="middle">H1  H2  H3</text>
  <!-- Shaft -->
  <rect x="140" y="74" width="40" height="12" rx="2" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
  <!-- ESC/Controller -->
  <rect x="195" y="55" width="70" height="50" rx="4" fill="#1e293b" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="230" y="75" font-family="monospace" font-size="8" fill="#60a5fa" text-anchor="middle">ESC / BLDC</text>
  <text x="230" y="88" font-family="monospace" font-size="8" fill="#94a3b8" text-anchor="middle">CONTROLLER</text>
  <!-- Phase wires -->
  <line x1="140" y1="55" x2="195" y2="65" stroke="#ef4444" stroke-width="1.5"/>
  <line x1="140" y1="80" x2="195" y2="80" stroke="#22c55e" stroke-width="1.5"/>
  <line x1="140" y1="105" x2="195" y2="95" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="165" y="50" font-family="monospace" font-size="8" fill="#ef4444">U</text>
  <text x="165" y="78" font-family="monospace" font-size="8" fill="#22c55e">V</text>
  <text x="165" y="108" font-family="monospace" font-size="8" fill="#60a5fa">W</text>
  <text x="100" y="145" font-family="monospace" font-size="9" fill="#a78bfa" text-anchor="middle">24VDC / 48VDC bus</text>
</svg>`;

const SERVO_ILLUSTRATION = `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:280px">
  <rect width="280" height="160" fill="#0f172a" rx="6"/>
  <text x="140" y="18" font-family="monospace" font-size="11" fill="#FF9900" text-anchor="middle" font-weight="bold">Servo Motor (Robin / Cardinal)</text>
  <!-- Motor body -->
  <rect x="25" y="40" width="110" height="80" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <!-- Fins -->
  <line x1="45" y1="40" x2="45" y2="120" stroke="#334155" stroke-width="1"/>
  <line x1="65" y1="40" x2="65" y2="120" stroke="#334155" stroke-width="1"/>
  <line x1="85" y1="40" x2="85" y2="120" stroke="#334155" stroke-width="1"/>
  <line x1="105" y1="40" x2="105" y2="120" stroke="#334155" stroke-width="1"/>
  <!-- Encoder at rear -->
  <rect x="13" y="50" width="14" height="60" rx="3" fill="#0f172a" stroke="#f472b6" stroke-width="1.5"/>
  <text x="20" y="78" font-family="monospace" font-size="7" fill="#f472b6" writing-mode="tb">ENC</text>
  <!-- Shaft -->
  <rect x="135" y="74" width="45" height="12" rx="2" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
  <!-- Servo Drive -->
  <rect x="195" y="40" width="75" height="80" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="232" y="65" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">SERVO</text>
  <text x="232" y="78" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">DRIVE</text>
  <text x="232" y="94" font-family="monospace" font-size="7" fill="#94a3b8" text-anchor="middle">Robin/Cardinal</text>
  <text x="232" y="107" font-family="monospace" font-size="7" fill="#94a3b8" text-anchor="middle">Compatible</text>
  <!-- Power wires -->
  <line x1="135" y1="60" x2="195" y2="60" stroke="#ef4444" stroke-width="1.5"/>
  <line x1="135" y1="80" x2="195" y2="80" stroke="#22c55e" stroke-width="1.5"/>
  <!-- Encoder cable -->
  <line x1="13" y1="80" x2="0" y2="80" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="195" y1="95" x2="13" y2="95" stroke="#f472b6" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="100" y="148" font-family="monospace" font-size="9" fill="#f59e0b" text-anchor="middle">120V / 240V AC input to drive</text>
</svg>`;

// ─── WIRING DIAGRAMS ────────────────────────────────────────────────────────

function mdrWiring(voltage) {
  if (voltage === '24VDC') return `<svg viewBox="0 0 580 340" xmlns="http://www.w3.org/2000/svg" style="width:100%">
  <rect width="580" height="340" fill="#0f172a" rx="6"/>
  <style>text{font-family:monospace;fill:#e2e8f0}.lb{font-size:11px}.title{font-size:12px;font-weight:bold;fill:#FF9900}</style>
  <text x="290" y="22" class="title" text-anchor="middle">MDR — 24VDC Wiring</text>
  <!-- Power Supply -->
  <rect x="15" y="45" width="95" height="70" rx="4" stroke="#334155" fill="#1e293b" stroke-width="1.5"/>
  <text x="62" y="66" class="lb" text-anchor="middle">24VDC PSU</text>
  <text x="62" y="82" class="lb" text-anchor="middle" fill="#FF9900">110VAC IN</text>
  <text x="22" y="100" class="lb" fill="#ef4444">+24V</text>
  <text x="22" y="115" class="lb" fill="#94a3b8">GND</text>
  <!-- MDR Controller -->
  <rect x="170" y="40" width="110" height="80" rx="4" stroke="#60a5fa" fill="#1e293b" stroke-width="1.5"/>
  <text x="225" y="62" class="lb" text-anchor="middle">MDR CONTROLLER</text>
  <text x="225" y="78" class="lb" text-anchor="middle" fill="#60a5fa">(ZPA / Zone Ctrl)</text>
  <text x="225" y="96" class="lb" text-anchor="middle" fill="#94a3b8">24V  GND  CTRL</text>
  <!-- MDR Roller -->
  <rect x="370" y="45" width="130" height="60" rx="25" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
  <text x="435" y="73" class="lb" text-anchor="middle" fill="#a78bfa">MDR ROLLER</text>
  <text x="435" y="88" class="lb" text-anchor="middle" fill="#94a3b8">24VDC built-in</text>
  <!-- +24V wire -->
  <line x1="110" y1="98" x2="170" y2="85" stroke="#ef4444" stroke-width="2.5"/>
  <!-- GND wire -->
  <line x1="110" y1="113" x2="170" y2="105" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Controller to roller -->
  <line x1="280" y1="80" x2="370" y2="72" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="280" y1="95" x2="370" y2="87" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Control signal -->
  <line x1="280" y1="108" x2="370" y2="100" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Sensor input -->
  <rect x="170" y="170" width="110" height="50" rx="4" stroke="#34d399" fill="#1e293b" stroke-width="1.5"/>
  <text x="225" y="192" class="lb" text-anchor="middle" fill="#34d399">PHOTO EYE</text>
  <text x="225" y="208" class="lb" text-anchor="middle" fill="#94a3b8">Object Detect</text>
  <line x1="225" y1="120" x2="225" y2="170" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- E-stop -->
  <rect x="15" y="170" width="95" height="50" rx="4" stroke="#ef4444" fill="#1e293b" stroke-width="1.5"/>
  <text x="62" y="192" class="lb" text-anchor="middle" fill="#ef4444">E-STOP</text>
  <text x="62" y="208" class="lb" text-anchor="middle" fill="#94a3b8">NC Contact</text>
  <line x1="110" y1="195" x2="170" y2="80" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Labels -->
  <text x="310" y="68" class="lb" fill="#ef4444">+24V</text>
  <text x="310" y="84" class="lb" fill="#94a3b8">GND</text>
  <text x="310" y="100" class="lb" fill="#60a5fa">CTRL SIG</text>
  <!-- Notes -->
  <rect x="15" y="240" width="550" height="85" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="25" y="258" class="lb" fill="#FF9900">Wiring Notes:</text>
  <text x="25" y="275" class="lb" fill="#94a3b8">• PSU must be 24VDC rated for total zone current (typ. 10A per zone)</text>
  <text x="25" y="291" class="lb" fill="#94a3b8">• Control signal: 0V = stop, 24V = run (or serial RS-485 for smart ZPA)</text>
  <text x="25" y="307" class="lb" fill="#94a3b8">• Fuse each roller circuit at 3–5A inline between PSU and controller</text>
  <text x="25" y="323" class="lb" fill="#94a3b8">• Ground chassis of PSU and controller to earth ground</text>
</svg>`;
  return null;
}

function acInductionWiring(voltage) {
  const colors = { title: '#FF9900' };
  if (voltage === '120VAC') return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" style="width:100%">
  <rect width="600" height="360" fill="#0f172a" rx="6"/>
  <style>text{font-family:monospace;fill:#e2e8f0}.lb{font-size:11px}.t{font-size:12px;font-weight:bold;fill:#FF9900}</style>
  <text x="300" y="22" class="t" text-anchor="middle">AC Induction Motor — 120VAC Single Phase</text>
  <!-- Source -->
  <rect x="15" y="45" width="95" height="75" rx="4" stroke="#334155" fill="#1e293b" stroke-width="1.5"/>
  <text x="62" y="68" class="lb" text-anchor="middle">120VAC</text>
  <text x="62" y="83" class="lb" text-anchor="middle">PANEL</text>
  <text x="22" y="103" class="lb" fill="#ef4444">L1 Hot</text>
  <text x="22" y="118" class="lb" fill="#94a3b8">Neutral</text>
  <text x="22" y="133" class="lb" fill="#22c55e">Ground</text>
  <!-- Breaker -->
  <rect x="165" y="50" width="75" height="45" rx="4" stroke="#FF9900" fill="#1e293b" stroke-width="1.5"/>
  <text x="202" y="70" class="lb" text-anchor="middle">BREAKER</text>
  <text x="202" y="85" class="lb" text-anchor="middle" fill="#FF9900">15–20A / 1P</text>
  <!-- Overload relay -->
  <rect x="300" y="50" width="85" height="45" rx="4" stroke="#f59e0b" fill="#1e293b" stroke-width="1.5"/>
  <text x="342" y="70" class="lb" text-anchor="middle">OVERLOAD</text>
  <text x="342" y="85" class="lb" text-anchor="middle" fill="#f59e0b">RELAY (OL)</text>
  <!-- Motor -->
  <circle cx="490" cy="145" r="60" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2"/>
  <text x="490" y="135" class="lb" text-anchor="middle" fill="#a78bfa">AC INDUCTION</text>
  <text x="490" y="150" class="lb" text-anchor="middle" fill="#a78bfa">MOTOR</text>
  <text x="490" y="167" class="lb" text-anchor="middle" fill="#94a3b8">T1  T2  GND</text>
  <!-- Run cap -->
  <rect x="395" y="55" width="75" height="35" rx="4" stroke="#34d399" fill="#1e293b" stroke-width="1.5"/>
  <text x="432" y="72" class="lb" text-anchor="middle" fill="#34d399">RUN CAP</text>
  <text x="432" y="84" class="lb" text-anchor="middle" fill="#94a3b8">10–50µF</text>
  <!-- Hot wire L1 -->
  <line x1="110" y1="100" x2="165" y2="72" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="240" y1="72" x2="300" y2="72" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="385" y1="72" x2="395" y2="72" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="395" y1="72" x2="430" y2="120" stroke="#ef4444" stroke-width="2.5"/>
  <text x="428" y="116" class="lb" fill="#ef4444">T1</text>
  <!-- Neutral -->
  <line x1="110" y1="116" x2="145" y2="116" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="145" y1="116" x2="145" y2="190" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="145" y1="190" x2="450" y2="175" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="448" y="171" class="lb" fill="#94a3b8">T2</text>
  <!-- Ground -->
  <line x1="110" y1="130" x2="130" y2="130" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="130" y1="130" x2="130" y2="230" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="130" y1="230" x2="490" y2="205" stroke="#22c55e" stroke-width="2.5"/>
  <!-- Cap to neutral -->
  <line x1="432" y1="155" x2="432" y2="175" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Ground symbol -->
  <line x1="490" y1="215" x2="490" y2="240" stroke="#22c55e" stroke-width="2"/>
  <line x1="477" y1="240" x2="503" y2="240" stroke="#22c55e" stroke-width="2"/>
  <line x1="481" y1="247" x2="499" y2="247" stroke="#22c55e" stroke-width="2"/>
  <line x1="485" y1="254" x2="495" y2="254" stroke="#22c55e" stroke-width="2"/>
  <!-- Notes -->
  <rect x="15" y="270" width="570" height="78" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="25" y="287" class="lb" fill="#FF9900">Wiring Notes (120VAC):</text>
  <text x="25" y="303" class="lb" fill="#94a3b8">• Single-phase: L1 (hot) to T1, Neutral to T2 — always verify on motor nameplate</text>
  <text x="25" y="319" class="lb" fill="#94a3b8">• Run capacitor required for single-phase induction motor startup and running</text>
  <text x="25" y="335" class="lb" fill="#94a3b8">• Reverse direction: swap T1 and T2 connections only</text>
</svg>`;

  if (voltage === '240VAC') return `<svg viewBox="0 0 620 380" xmlns="http://www.w3.org/2000/svg" style="width:100%">
  <rect width="620" height="380" fill="#0f172a" rx="6"/>
  <style>text{font-family:monospace;fill:#e2e8f0}.lb{font-size:11px}.t{font-size:12px;font-weight:bold;fill:#FF9900}</style>
  <text x="310" y="22" class="t" text-anchor="middle">AC Induction Motor — 240VAC Single Phase (High Voltage Tap)</text>
  <!-- Source -->
  <rect x="15" y="45" width="100" height="85" rx="4" stroke="#334155" fill="#1e293b" stroke-width="1.5"/>
  <text x="65" y="67" class="lb" text-anchor="middle">240VAC</text>
  <text x="65" y="82" class="lb" text-anchor="middle">PANEL</text>
  <text x="22" y="103" class="lb" fill="#ef4444">L1</text>
  <text x="22" y="118" class="lb" fill="#f97316">L2</text>
  <text x="22" y="133" class="lb" fill="#22c55e">GND</text>
  <!-- 2-pole breaker -->
  <rect x="175" y="48" width="80" height="55" rx="4" stroke="#FF9900" fill="#1e293b" stroke-width="1.5"/>
  <text x="215" y="68" class="lb" text-anchor="middle">2-POLE BKR</text>
  <text x="215" y="83" class="lb" text-anchor="middle" fill="#FF9900">20–30A</text>
  <text x="215" y="98" class="lb" text-anchor="middle" fill="#94a3b8">240V rated</text>
  <line x1="215" y1="52" x2="215" y2="98" stroke="#FF9900" stroke-width="1" stroke-dasharray="2,2"/>
  <!-- Overload -->
  <rect x="315" y="48" width="85" height="55" rx="4" stroke="#f59e0b" fill="#1e293b" stroke-width="1.5"/>
  <text x="357" y="68" class="lb" text-anchor="middle">OVERLOAD</text>
  <text x="357" y="83" class="lb" text-anchor="middle" fill="#f59e0b">RELAY 2P</text>
  <!-- Motor -->
  <circle cx="510" cy="160" r="65" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2"/>
  <text x="510" y="145" class="lb" text-anchor="middle" fill="#a78bfa">AC INDUCTION</text>
  <text x="510" y="161" class="lb" text-anchor="middle" fill="#a78bfa">240V WINDING</text>
  <text x="510" y="178" class="lb" text-anchor="middle" fill="#94a3b8">T1     T2</text>
  <!-- L1 hot -->
  <line x1="115" y1="100" x2="175" y2="75" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="255" y1="72" x2="315" y2="68" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="400" y1="68" x2="435" y2="130" stroke="#ef4444" stroke-width="2.5"/>
  <text x="428" y="126" class="lb" fill="#ef4444">T1</text>
  <!-- L2 hot -->
  <line x1="115" y1="115" x2="175" y2="92" stroke="#f97316" stroke-width="2.5"/>
  <line x1="255" y1="88" x2="315" y2="85" stroke="#f97316" stroke-width="2.5"/>
  <line x1="400" y1="85" x2="445" y2="190" stroke="#f97316" stroke-width="2.5"/>
  <text x="437" y="195" class="lb" fill="#f97316">T2</text>
  <!-- Ground -->
  <line x1="115" y1="130" x2="140" y2="130" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="140" y1="130" x2="140" y2="250" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="140" y1="250" x2="510" y2="225" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="510" y1="235" x2="510" y2="255" stroke="#22c55e" stroke-width="2"/>
  <line x1="498" y1="255" x2="522" y2="255" stroke="#22c55e" stroke-width="2"/>
  <line x1="502" y1="262" x2="518" y2="262" stroke="#22c55e" stroke-width="2"/>
  <line x1="506" y1="269" x2="514" y2="269" stroke="#22c55e" stroke-width="2"/>
  <!-- Notes -->
  <rect x="15" y="285" width="590" height="82" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="25" y="303" class="lb" fill="#FF9900">Wiring Notes (240VAC — Dual Hot):</text>
  <text x="25" y="319" class="lb" fill="#94a3b8">• Both L1 and L2 are HOT — use 2-pole breaker only, never single pole</text>
  <text x="25" y="335" class="lb" fill="#94a3b8">• No neutral wire goes to the motor at 240V — L1→T1, L2→T2</text>
  <text x="25" y="351" class="lb" fill="#94a3b8">• Motor nameplate must show 240V rating — check high/low voltage tap jumpers in terminal box</text>
</svg>`;

  if (voltage === '480VAC') return `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" style="width:100%">
  <rect width="640" height="400" fill="#0f172a" rx="6"/>
  <style>text{font-family:monospace;fill:#e2e8f0}.lb{font-size:11px}.t{font-size:12px;font-weight:bold;fill:#FF9900}</style>
  <text x="320" y="22" class="t" text-anchor="middle">AC Induction Motor — 480VAC Three Phase (WYE / DELTA)</text>
  <!-- Source -->
  <rect x="15" y="45" width="100" height="100" rx="4" stroke="#334155" fill="#1e293b" stroke-width="1.5"/>
  <text x="65" y="67" class="lb" text-anchor="middle">480VAC</text>
  <text x="65" y="82" class="lb" text-anchor="middle">3-PHASE</text>
  <text x="65" y="97" class="lb" text-anchor="middle">PANEL</text>
  <text x="22" y="117" class="lb" fill="#ef4444">L1</text>
  <text x="22" y="132" class="lb" fill="#f97316">L2</text>
  <text x="22" y="147" class="lb" fill="#60a5fa">L3</text>
  <!-- 3-pole breaker -->
  <rect x="175" y="48" width="80" height="65" rx="4" stroke="#FF9900" fill="#1e293b" stroke-width="1.5"/>
  <text x="215" y="68" class="lb" text-anchor="middle">3-POLE BKR</text>
  <text x="215" y="83" class="lb" text-anchor="middle" fill="#FF9900">15–60A</text>
  <text x="215" y="98" class="lb" text-anchor="middle" fill="#94a3b8">480V rated</text>
  <line x1="215" y1="52" x2="215" y2="108" stroke="#FF9900" stroke-width="1" stroke-dasharray="2,2"/>
  <!-- MCS / Contactor -->
  <rect x="315" y="48" width="85" height="65" rx="4" stroke="#60a5fa" fill="#1e293b" stroke-width="1.5"/>
  <text x="357" y="68" class="lb" text-anchor="middle">CONTACTOR</text>
  <text x="357" y="83" class="lb" text-anchor="middle" fill="#60a5fa">3-POLE MCS</text>
  <text x="357" y="98" class="lb" text-anchor="middle" fill="#94a3b8">+ OL relay</text>
  <!-- Motor -->
  <circle cx="530" cy="185" r="70" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2"/>
  <text x="530" y="165" class="lb" text-anchor="middle" fill="#a78bfa">3-PHASE</text>
  <text x="530" y="180" class="lb" text-anchor="middle" fill="#a78bfa">AC INDUCTION</text>
  <text x="530" y="196" class="lb" text-anchor="middle" fill="#a78bfa">480V WYE</text>
  <text x="530" y="214" class="lb" text-anchor="middle" fill="#94a3b8">T1   T2   T3</text>
  <!-- L1 -->
  <line x1="115" y1="114" x2="175" y2="75" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="255" y1="72" x2="315" y2="68" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="400" y1="68" x2="460" y2="155" stroke="#ef4444" stroke-width="2.5"/>
  <text x="452" y="151" class="lb" fill="#ef4444">T1</text>
  <!-- L2 -->
  <line x1="115" y1="129" x2="175" y2="90" stroke="#f97316" stroke-width="2.5"/>
  <line x1="255" y1="87" x2="315" y2="80" stroke="#f97316" stroke-width="2.5"/>
  <line x1="400" y1="80" x2="470" y2="190" stroke="#f97316" stroke-width="2.5"/>
  <text x="462" y="196" class="lb" fill="#f97316">T2</text>
  <!-- L3 -->
  <line x1="115" y1="144" x2="175" y2="107" stroke="#60a5fa" stroke-width="2.5"/>
  <line x1="255" y1="103" x2="315" y2="95" stroke="#60a5fa" stroke-width="2.5"/>
  <line x1="400" y1="95" x2="462" y2="222" stroke="#60a5fa" stroke-width="2.5"/>
  <text x="455" y="228" class="lb" fill="#60a5fa">T3</text>
  <!-- Ground -->
  <line x1="115" y1="145" x2="135" y2="145" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="135" y1="145" x2="135" y2="275" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="135" y1="275" x2="530" y2="255" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="530" y1="265" x2="530" y2="285" stroke="#22c55e" stroke-width="2"/>
  <line x1="517" y1="285" x2="543" y2="285" stroke="#22c55e" stroke-width="2"/>
  <line x1="521" y1="292" x2="539" y2="292" stroke="#22c55e" stroke-width="2"/>
  <line x1="525" y1="299" x2="535" y2="299" stroke="#22c55e" stroke-width="2"/>
  <!-- WYE diagram -->
  <text x="20" y="190" class="lb" fill="#FF9900">WYE (Y):</text>
  <text x="20" y="205" class="lb" fill="#ef4444">T1 T4 together</text>
  <text x="20" y="220" class="lb" fill="#f97316">T2 T5 together</text>
  <text x="20" y="235" class="lb" fill="#60a5fa">T3 T6 together</text>
  <text x="20" y="255" class="lb" fill="#FF9900">DELTA (Δ):</text>
  <text x="20" y="270" class="lb" fill="#ef4444">T1–T6, T2–T4, T3–T5</text>
  <!-- Notes -->
  <rect x="15" y="305" width="610" height="82" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="25" y="323" class="lb" fill="#FF9900">Wiring Notes (480VAC 3-Phase):</text>
  <text x="25" y="339" class="lb" fill="#94a3b8">• Always use 3-pole breaker and 3-pole contactor — never single or double pole</text>
  <text x="25" y="355" class="lb" fill="#94a3b8">• Check motor nameplate for WYE or DELTA configuration — wrong config will burn motor</text>
  <text x="25" y="371" class="lb" fill="#94a3b8">• Phase rotation matters — swap any 2 of L1/L2/L3 to reverse motor direction</text>
</svg>`;
  return null;
}

function pancakeWiring(voltage) {
  if (voltage === '120VAC') return `<svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" style="width:100%">
  <rect width="600" height="340" fill="#0f172a" rx="6"/>
  <style>text{font-family:monospace;fill:#e2e8f0}.lb{font-size:11px}.t{font-size:12px;font-weight:bold;fill:#FF9900}</style>
  <text x="300" y="22" class="t" text-anchor="middle">Pancake Motor — 120VAC Single Phase</text>
  <rect x="15" y="45" width="95" height="75" rx="4" stroke="#334155" fill="#1e293b" stroke-width="1.5"/>
  <text x="62" y="67" class="lb" text-anchor="middle">120VAC</text><text x="62" y="82" class="lb" text-anchor="middle">SOURCE</text>
  <text x="22" y="102" class="lb" fill="#ef4444">L1 Hot</text><text x="22" y="117" class="lb" fill="#94a3b8">Neutral</text><text x="22" y="132" class="lb" fill="#22c55e">Ground</text>
  <rect x="165" y="50" width="75" height="40" rx="4" stroke="#FF9900" fill="#1e293b" stroke-width="1.5"/>
  <text x="202" y="68" class="lb" text-anchor="middle">BREAKER</text><text x="202" y="83" class="lb" text-anchor="middle" fill="#FF9900">15A / 1P</text>
  <rect x="300" y="50" width="85" height="40" rx="4" stroke="#f59e0b" fill="#1e293b" stroke-width="1.5"/>
  <text x="342" y="68" class="lb" text-anchor="middle">OVERLOAD</text><text x="342" y="83" class="lb" text-anchor="middle" fill="#f59e0b">RELAY</text>
  <!-- Pancake motor shape -->
  <ellipse cx="490" cy="135" rx="80" ry="22" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <ellipse cx="490" cy="118" rx="80" ry="22" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="490" y="115" class="lb" text-anchor="middle" fill="#34d399">PANCAKE MOTOR</text>
  <text x="490" y="131" class="lb" text-anchor="middle" fill="#94a3b8">T1  T2  GND</text>
  <!-- Shaft -->
  <line x1="490" y1="80" x2="490" y2="96" stroke="#94a3b8" stroke-width="3"/>
  <!-- Run cap -->
  <rect x="390" y="50" width="70" height="32" rx="4" stroke="#34d399" fill="#1e293b" stroke-width="1.5"/>
  <text x="425" y="65" class="lb" text-anchor="middle" fill="#34d399">RUN CAP</text><text x="425" y="77" class="lb" text-anchor="middle" fill="#94a3b8">20–40µF</text>
  <!-- Wires -->
  <line x1="110" y1="100" x2="165" y2="70" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="240" y1="70" x2="300" y2="68" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="385" y1="68" x2="390" y2="66" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="390" y1="66" x2="415" y2="110" stroke="#ef4444" stroke-width="2.5"/>
  <text x="410" y="107" class="lb" fill="#ef4444">T1</text>
  <line x1="110" y1="115" x2="145" y2="115" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="145" y1="115" x2="145" y2="175" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="145" y1="175" x2="415" y2="142" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="410" y="140" class="lb" fill="#94a3b8">T2</text>
  <line x1="110" y1="130" x2="130" y2="130" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="130" y1="130" x2="130" y2="195" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="130" y1="195" x2="490" y2="157" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="425" y1="136" x2="425" y2="145" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Notes -->
  <rect x="15" y="220" width="570" height="110" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="25" y="238" class="lb" fill="#FF9900">Pancake Motor Notes (120VAC):</text>
  <text x="25" y="254" class="lb" fill="#94a3b8">• Axial flux design — very thin profile, high torque density</text>
  <text x="25" y="270" class="lb" fill="#94a3b8">• Wiring identical to standard single-phase AC: L1→T1, N→T2, GND→frame</text>
  <text x="25" y="286" class="lb" fill="#94a3b8">• Run capacitor is almost always built-in — check spec sheet before adding external cap</text>
  <text x="25" y="302" class="lb" fill="#94a3b8">• Used in conveyor direct-drive and low-clearance installations</text>
  <text x="25" y="318" class="lb" fill="#94a3b8">• Reverse direction: swap T1 and T2</text>
</svg>`;

  if (voltage === '240VAC') return `<svg viewBox="0 0 620 340" xmlns="http://www.w3.org/2000/svg" style="width:100%">
  <rect width="620" height="340" fill="#0f172a" rx="6"/>
  <style>text{font-family:monospace;fill:#e2e8f0}.lb{font-size:11px}.t{font-size:12px;font-weight:bold;fill:#FF9900}</style>
  <text x="310" y="22" class="t" text-anchor="middle">Pancake Motor — 240VAC Single Phase</text>
  <rect x="15" y="45" width="100" height="85" rx="4" stroke="#334155" fill="#1e293b" stroke-width="1.5"/>
  <text x="65" y="67" class="lb" text-anchor="middle">240VAC</text><text x="65" y="82" class="lb" text-anchor="middle">SOURCE</text>
  <text x="22" y="103" class="lb" fill="#ef4444">L1</text><text x="22" y="118" class="lb" fill="#f97316">L2</text><text x="22" y="133" class="lb" fill="#22c55e">GND</text>
  <rect x="175" y="50" width="80" height="50" rx="4" stroke="#FF9900" fill="#1e293b" stroke-width="1.5"/>
  <text x="215" y="70" class="lb" text-anchor="middle">2-POLE BKR</text><text x="215" y="85" class="lb" text-anchor="middle" fill="#FF9900">20A / 240V</text>
  <line x1="215" y1="54" x2="215" y2="96" stroke="#FF9900" stroke-width="1" stroke-dasharray="2,2"/>
  <rect x="315" y="50" width="85" height="50" rx="4" stroke="#f59e0b" fill="#1e293b" stroke-width="1.5"/>
  <text x="357" y="70" class="lb" text-anchor="middle">OVERLOAD</text><text x="357" y="85" class="lb" text-anchor="middle" fill="#f59e0b">RELAY 2P</text>
  <ellipse cx="510" cy="140" rx="85" ry="23" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <ellipse cx="510" cy="122" rx="85" ry="23" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="510" y="119" class="lb" text-anchor="middle" fill="#34d399">PANCAKE MOTOR 240V</text>
  <text x="510" y="136" class="lb" text-anchor="middle" fill="#94a3b8">T1    T2    GND</text>
  <line x1="510" y1="82" x2="510" y2="99" stroke="#94a3b8" stroke-width="3"/>
  <line x1="115" y1="100" x2="175" y2="75" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="255" y1="72" x2="315" y2="68" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="400" y1="68" x2="430" y2="112" stroke="#ef4444" stroke-width="2.5"/>
  <text x="424" y="108" class="lb" fill="#ef4444">T1</text>
  <line x1="115" y1="115" x2="175" y2="92" stroke="#f97316" stroke-width="2.5"/>
  <line x1="255" y1="88" x2="315" y2="85" stroke="#f97316" stroke-width="2.5"/>
  <line x1="400" y1="85" x2="445" y2="150" stroke="#f97316" stroke-width="2.5"/>
  <text x="438" y="156" class="lb" fill="#f97316">T2</text>
  <line x1="115" y1="130" x2="140" y2="130" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="140" y1="130" x2="140" y2="190" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="140" y1="190" x2="510" y2="163" stroke="#22c55e" stroke-width="2.5"/>
  <rect x="15" y="225" width="590" height="100" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="25" y="243" class="lb" fill="#FF9900">Pancake Motor Notes (240VAC):</text>
  <text x="25" y="259" class="lb" fill="#94a3b8">• No neutral at motor — L1→T1, L2→T2 (both legs hot at 240V)</text>
  <text x="25" y="275" class="lb" fill="#94a3b8">• Must use 2-pole breaker — both legs must be disconnected simultaneously</text>
  <text x="25" y="291" class="lb" fill="#94a3b8">• Higher efficiency than 120V — preferred for motors above 1 HP</text>
  <text x="25" y="307" class="lb" fill="#94a3b8">• Verify 240V winding tap on motor nameplate before energizing</text>
</svg>`;
  return null;
}

function bldcWiring(voltage) {
  const label = voltage === '24VDC' ? '24VDC' : '48VDC';
  return `<svg viewBox="0 0 620 380" xmlns="http://www.w3.org/2000/svg" style="width:100%">
  <rect width="620" height="380" fill="#0f172a" rx="6"/>
  <style>text{font-family:monospace;fill:#e2e8f0}.lb{font-size:11px}.t{font-size:12px;font-weight:bold;fill:#FF9900}</style>
  <text x="310" y="22" class="t" text-anchor="middle">Brushless DC Motor (BLDC) — ${label}</text>
  <!-- PSU -->
  <rect x="15" y="50" width="100" height="80" rx="4" stroke="#334155" fill="#1e293b" stroke-width="1.5"/>
  <text x="65" y="73" class="lb" text-anchor="middle">DC POWER</text>
  <text x="65" y="88" class="lb" text-anchor="middle">SUPPLY</text>
  <text x="65" y="103" class="lb" text-anchor="middle" fill="#FF9900">${label}</text>
  <text x="22" y="122" class="lb" fill="#ef4444">+</text>
  <text x="22" y="137" class="lb" fill="#94a3b8">−</text>
  <!-- BLDC Controller/ESC -->
  <rect x="175" y="45" width="110" height="100" rx="4" stroke="#60a5fa" fill="#1e293b" stroke-width="1.5"/>
  <text x="230" y="67" class="lb" text-anchor="middle">BLDC</text>
  <text x="230" y="82" class="lb" text-anchor="middle">CONTROLLER</text>
  <text x="230" y="97" class="lb" text-anchor="middle" fill="#60a5fa">ESC / VFD</text>
  <text x="230" y="112" class="lb" text-anchor="middle" fill="#94a3b8">PWM IN</text>
  <text x="230" y="127" class="lb" text-anchor="middle" fill="#94a3b8">U  V  W out</text>
  <!-- BLDC Motor -->
  <circle cx="470" cy="145" r="70" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2"/>
  <text x="470" y="125" class="lb" text-anchor="middle" fill="#a78bfa">BLDC MOTOR</text>
  <text x="470" y="141" class="lb" text-anchor="middle" fill="#a78bfa">${label}</text>
  <text x="470" y="157" class="lb" text-anchor="middle" fill="#94a3b8">U    V    W</text>
  <!-- Hall sensor connector -->
  <rect x="175" y="175" width="110" height="55" rx="4" stroke="#f472b6" fill="#1e293b" stroke-width="1.5"/>
  <text x="230" y="197" class="lb" text-anchor="middle" fill="#f472b6">HALL SENSOR</text>
  <text x="230" y="212" class="lb" text-anchor="middle" fill="#94a3b8">5V  GND  H1 H2 H3</text>
  <!-- Power to ESC -->
  <line x1="115" y1="120" x2="175" y2="90" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="115" y1="135" x2="175" y2="120" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- ESC phase outputs to motor -->
  <line x1="285" y1="100" x2="400" y2="120" stroke="#ef4444" stroke-width="2"/>
  <line x1="285" y1="115" x2="400" y2="145" stroke="#22c55e" stroke-width="2"/>
  <line x1="285" y1="130" x2="400" y2="170" stroke="#60a5fa" stroke-width="2"/>
  <text x="333" y="113" class="lb" fill="#ef4444">U</text>
  <text x="333" y="132" class="lb" fill="#22c55e">V</text>
  <text x="333" y="153" class="lb" fill="#60a5fa">W</text>
  <!-- Hall sensor feedback -->
  <line x1="400" y1="175" x2="285" y2="195" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="400" y1="185" x2="285" y2="205" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="400" y1="195" x2="285" y2="215" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="330" y="183" class="lb" fill="#f472b6">H1</text>
  <text x="330" y="198" class="lb" fill="#f472b6">H2</text>
  <text x="330" y="213" class="lb" fill="#f472b6">H3</text>
  <!-- Hall sensor power -->
  <line x1="175" y1="195" x2="145" y2="195" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="145" y1="195" x2="145" y2="130" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2"/>
  <!-- PWM input -->
  <rect x="15" y="185" width="100" height="45" rx="4" stroke="#34d399" fill="#1e293b" stroke-width="1.5"/>
  <text x="65" y="207" class="lb" text-anchor="middle" fill="#34d399">PWM / CAN</text>
  <text x="65" y="222" class="lb" text-anchor="middle" fill="#94a3b8">Speed Signal</text>
  <line x1="115" y1="207" x2="175" y2="112" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Ground -->
  <line x1="115" y1="135" x2="470" y2="215" stroke="#22c55e" stroke-width="1.5"/>
  <line x1="470" y1="225" x2="470" y2="245" stroke="#22c55e" stroke-width="2"/>
  <line x1="458" y1="245" x2="482" y2="245" stroke="#22c55e" stroke-width="2"/>
  <line x1="462" y1="252" x2="478" y2="252" stroke="#22c55e" stroke-width="2"/>
  <line x1="466" y1="259" x2="474" y2="259" stroke="#22c55e" stroke-width="2"/>
  <!-- Notes -->
  <rect x="15" y="285" width="590" height="82" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="25" y="303" class="lb" fill="#FF9900">BLDC Wiring Notes (${label}):</text>
  <text x="25" y="319" class="lb" fill="#94a3b8">• Three phase outputs U/V/W from controller to motor — never connect directly to DC supply</text>
  <text x="25" y="335" class="lb" fill="#94a3b8">• Hall sensor wires: 5V, GND, H1, H2, H3 — connector must match controller pinout</text>
  <text x="25" y="351" class="lb" fill="#94a3b8">• Reverse direction: swap any two of U/V/W, or set reverse in controller firmware</text>
</svg>`;
}

function servoWiring(voltage) {
  if (voltage === '120VAC') return `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" style="width:100%">
  <rect width="640" height="400" fill="#0f172a" rx="6"/>
  <style>text{font-family:monospace;fill:#e2e8f0}.lb{font-size:11px}.t{font-size:12px;font-weight:bold;fill:#FF9900}</style>
  <text x="320" y="22" class="t" text-anchor="middle">Servo Motor (Robin / Cardinal) — 120VAC Drive Input</text>
  <!-- AC Panel -->
  <rect x="15" y="50" width="100" height="80" rx="4" stroke="#334155" fill="#1e293b" stroke-width="1.5"/>
  <text x="65" y="73" class="lb" text-anchor="middle">120VAC</text><text x="65" y="88" class="lb" text-anchor="middle">PANEL</text>
  <text x="22" y="108" class="lb" fill="#ef4444">L1</text><text x="22" y="123" class="lb" fill="#94a3b8">N</text><text x="22" y="138" class="lb" fill="#22c55e">GND</text>
  <!-- Servo Drive -->
  <rect x="175" y="40" width="120" height="130" rx="4" stroke="#f59e0b" fill="#1e293b" stroke-width="1.5"/>
  <text x="235" y="62" class="lb" text-anchor="middle" fill="#f59e0b">SERVO DRIVE</text>
  <text x="235" y="77" class="lb" text-anchor="middle" fill="#f59e0b">Robin / Cardinal</text>
  <text x="235" y="95" class="lb" text-anchor="middle">AC IN: L1 N GND</text>
  <line x1="185" y1="100" x2="285" y2="100" stroke="#334155" stroke-width="1"/>
  <text x="235" y="115" class="lb" text-anchor="middle">OUT: U V W</text>
  <text x="235" y="130" class="lb" text-anchor="middle">ENC: A B Z +5V</text>
  <text x="235" y="145" class="lb" text-anchor="middle" fill="#60a5fa">CMD: ±10V/PWM</text>
  <text x="235" y="162" class="lb" text-anchor="middle" fill="#34d399">I/O: EN FLT RDY</text>
  <!-- Servo Motor -->
  <rect x="400" y="55" width="120" height="110" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <line x1="420" y1="55" x2="420" y2="165" stroke="#334155" stroke-width="1"/>
  <line x1="445" y1="55" x2="445" y2="165" stroke="#334155" stroke-width="1"/>
  <line x1="470" y1="55" x2="470" y2="165" stroke="#334155" stroke-width="1"/>
  <line x1="495" y1="55" x2="495" y2="165" stroke="#334155" stroke-width="1"/>
  <text x="460" y="90" class="lb" text-anchor="middle" fill="#f59e0b">SERVO</text>
  <text x="460" y="105" class="lb" text-anchor="middle" fill="#f59e0b">MOTOR</text>
  <text x="460" y="120" class="lb" text-anchor="middle" fill="#94a3b8">Robin / Cardinal</text>
  <!-- Shaft -->
  <rect x="520" y="98" width="35" height="12" rx="2" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
  <!-- Encoder (rear) -->
  <rect x="388" y="70" width="14" height="80" rx="3" fill="#0f172a" stroke="#f472b6" stroke-width="1.5"/>
  <text x="395" y="108" class="lb" text-anchor="middle" fill="#f472b6" font-size="8" writing-mode="tb">ENCODER</text>
  <!-- AC power to drive -->
  <line x1="115" y1="105" x2="175" y2="80" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="115" y1="120" x2="175" y2="100" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="115" y1="135" x2="175" y2="118" stroke="#22c55e" stroke-width="2.5"/>
  <!-- Drive phase output to motor -->
  <line x1="295" y1="108" x2="400" y2="95" stroke="#ef4444" stroke-width="2"/>
  <line x1="295" y1="118" x2="400" y2="110" stroke="#22c55e" stroke-width="2"/>
  <line x1="295" y1="128" x2="400" y2="125" stroke="#60a5fa" stroke-width="2"/>
  <text x="343" y="95" class="lb" fill="#ef4444">U</text>
  <text x="343" y="110" class="lb" fill="#22c55e">V</text>
  <text x="343" y="127" class="lb" fill="#60a5fa">W</text>
  <!-- Encoder feedback cable -->
  <line x1="388" y1="110" x2="295" y2="128" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="320" y="145" class="lb" fill="#f472b6">ENC FEEDBACK</text>
  <!-- Command input -->
  <rect x="15" y="185" width="110" height="50" rx="4" stroke="#60a5fa" fill="#1e293b" stroke-width="1.5"/>
  <text x="70" y="207" class="lb" text-anchor="middle" fill="#60a5fa">PLC / CONTROLLER</text>
  <text x="70" y="222" class="lb" text-anchor="middle" fill="#94a3b8">Position Command</text>
  <line x1="125" y1="207" x2="175" y2="142" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Enable signal -->
  <rect x="15" y="250" width="110" height="50" rx="4" stroke="#34d399" fill="#1e293b" stroke-width="1.5"/>
  <text x="70" y="272" class="lb" text-anchor="middle" fill="#34d399">ENABLE / E-STOP</text>
  <text x="70" y="287" class="lb" text-anchor="middle" fill="#94a3b8">24VDC I/O</text>
  <line x1="125" y1="272" x2="175" y2="158" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Ground frame -->
  <line x1="115" y1="135" x2="460" y2="165" stroke="#22c55e" stroke-width="1.5"/>
  <!-- Notes -->
  <rect x="15" y="315" width="610" height="75" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="25" y="333" class="lb" fill="#FF9900">Robin / Cardinal Servo Notes (120VAC):</text>
  <text x="25" y="349" class="lb" fill="#94a3b8">• Drive converts 120VAC → DC bus → 3-phase PWM to motor — never connect motor directly to AC</text>
  <text x="25" y="365" class="lb" fill="#94a3b8">• Encoder cable must be shielded — keep away from power cables to prevent interference</text>
  <text x="25" y="381" class="lb" fill="#94a3b8">• Enable signal (24VDC) must be high before drive will output — check I/O wiring first on faults</text>
</svg>`;

  if (voltage === '240VAC') return `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" style="width:100%">
  <rect width="640" height="400" fill="#0f172a" rx="6"/>
  <style>text{font-family:monospace;fill:#e2e8f0}.lb{font-size:11px}.t{font-size:12px;font-weight:bold;fill:#FF9900}</style>
  <text x="320" y="22" class="t" text-anchor="middle">Servo Motor (Robin / Cardinal) — 240VAC Drive Input</text>
  <rect x="15" y="50" width="100" height="85" rx="4" stroke="#334155" fill="#1e293b" stroke-width="1.5"/>
  <text x="65" y="73" class="lb" text-anchor="middle">240VAC</text><text x="65" y="88" class="lb" text-anchor="middle">PANEL</text>
  <text x="22" y="108" class="lb" fill="#ef4444">L1</text><text x="22" y="123" class="lb" fill="#f97316">L2</text><text x="22" y="138" class="lb" fill="#22c55e">GND</text>
  <!-- Servo Drive -->
  <rect x="175" y="40" width="120" height="140" rx="4" stroke="#f59e0b" fill="#1e293b" stroke-width="1.5"/>
  <text x="235" y="62" class="lb" text-anchor="middle" fill="#f59e0b">SERVO DRIVE</text>
  <text x="235" y="77" class="lb" text-anchor="middle" fill="#f59e0b">Robin / Cardinal</text>
  <text x="235" y="95" class="lb" text-anchor="middle">AC IN: L1 L2 GND</text>
  <line x1="185" y1="100" x2="285" y2="100" stroke="#334155" stroke-width="1"/>
  <text x="235" y="115" class="lb" text-anchor="middle">OUT: U V W PE</text>
  <text x="235" y="130" class="lb" text-anchor="middle">ENC: A B Z +5V</text>
  <text x="235" y="145" class="lb" text-anchor="middle" fill="#60a5fa">CMD: ±10V/PWM</text>
  <text x="235" y="162" class="lb" text-anchor="middle" fill="#34d399">I/O: EN FLT RDY</text>
  <!-- Motor -->
  <rect x="400" y="55" width="120" height="110" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <line x1="420" y1="55" x2="420" y2="165" stroke="#334155" stroke-width="1"/>
  <line x1="445" y1="55" x2="445" y2="165" stroke="#334155" stroke-width="1"/>
  <line x1="470" y1="55" x2="470" y2="165" stroke="#334155" stroke-width="1"/>
  <line x1="495" y1="55" x2="495" y2="165" stroke="#334155" stroke-width="1"/>
  <text x="460" y="93" class="lb" text-anchor="middle" fill="#f59e0b">SERVO MOTOR</text>
  <text x="460" y="108" class="lb" text-anchor="middle" fill="#94a3b8">Robin / Cardinal</text>
  <text x="460" y="125" class="lb" text-anchor="middle" fill="#94a3b8">240V Class</text>
  <rect x="520" y="98" width="35" height="12" rx="2" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
  <rect x="388" y="70" width="14" height="80" rx="3" fill="#0f172a" stroke="#f472b6" stroke-width="1.5"/>
  <!-- AC input -->
  <line x1="115" y1="105" x2="175" y2="78" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="115" y1="120" x2="175" y2="96" stroke="#f97316" stroke-width="2.5"/>
  <line x1="115" y1="135" x2="175" y2="115" stroke="#22c55e" stroke-width="2.5"/>
  <!-- Phase output -->
  <line x1="295" y1="108" x2="400" y2="95" stroke="#ef4444" stroke-width="2"/>
  <line x1="295" y1="118" x2="400" y2="110" stroke="#22c55e" stroke-width="2"/>
  <line x1="295" y1="128" x2="400" y2="125" stroke="#60a5fa" stroke-width="2"/>
  <text x="343" y="95" class="lb" fill="#ef4444">U</text>
  <text x="343" y="110" class="lb" fill="#22c55e">V</text>
  <text x="343" y="127" class="lb" fill="#60a5fa">W</text>
  <!-- Encoder -->
  <line x1="388" y1="110" x2="295" y2="135" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="325" y="150" class="lb" fill="#f472b6">ENC FEEDBACK</text>
  <!-- Regen resistor -->
  <rect x="400" y="190" width="110" height="40" rx="4" stroke="#f97316" fill="#1e293b" stroke-width="1.5"/>
  <text x="455" y="207" class="lb" text-anchor="middle" fill="#f97316">REGEN RESISTOR</text>
  <text x="455" y="222" class="lb" text-anchor="middle" fill="#94a3b8">Dynamic Braking</text>
  <line x1="295" y1="150" x2="400" y2="205" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="400" y1="215" x2="295" y2="160" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Controls -->
  <rect x="15" y="190" width="110" height="50" rx="4" stroke="#60a5fa" fill="#1e293b" stroke-width="1.5"/>
  <text x="70" y="212" class="lb" text-anchor="middle" fill="#60a5fa">PLC COMMAND</text>
  <text x="70" y="227" class="lb" text-anchor="middle" fill="#94a3b8">Position / Speed</text>
  <line x1="125" y1="212" x2="175" y2="148" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4,3"/>
  <rect x="15" y="255" width="110" height="50" rx="4" stroke="#34d399" fill="#1e293b" stroke-width="1.5"/>
  <text x="70" y="277" class="lb" text-anchor="middle" fill="#34d399">ENABLE / FAULT</text>
  <text x="70" y="292" class="lb" text-anchor="middle" fill="#94a3b8">24VDC I/O</text>
  <line x1="125" y1="277" x2="175" y2="165" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3"/>
  <rect x="15" y="320" width="610" height="70" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="25" y="338" class="lb" fill="#FF9900">Robin / Cardinal Servo Notes (240VAC):</text>
  <text x="25" y="354" class="lb" fill="#94a3b8">• 240V drive: L1 and L2 both HOT — no neutral — use 2-pole breaker</text>
  <text x="25" y="370" class="lb" fill="#94a3b8">• Regen resistor required for high-inertia loads — wire to drive's P+ and D terminals</text>
  <text x="25" y="386" class="lb" fill="#94a3b8">• Fault output wired to PLC — always monitor FLT signal to catch drive faults early</text>
</svg>`;
  return null;
}

// ─── MOTOR DATA ──────────────────────────────────────────────────────────────

const MOTORS = [
  {
    id: 'mdr',
    name: 'Motor-Driven Rollers',
    abbr: 'MDR',
    illustration: MDR_ILLUSTRATION,
    description: 'Motor-Driven Rollers (MDRs) have a brushless DC motor built directly inside the roller tube along with an integral gearbox. Used in zero-pressure accumulation (ZPA) conveyor zones throughout fulfillment centers. Each roller is controlled independently by a zone controller.',
    specs: ['Voltage: 24VDC (standard) / 48VDC (high-speed)', 'Current: 0.5–3A per roller', 'Speed: up to 600 FPM depending on gear ratio', 'Interface: 24VDC digital I/O or RS-485 serial', 'Common use: Conveyor zones, accumulation, sortation'],
    voltages: [{ id: '24VDC', label: '24VDC', getSvg: () => mdrWiring('24VDC') }],
    notes: ['Always size PSU for total zone load — 10A per zone minimum', 'Use 24VDC shielded cable for long runs to avoid signal noise', 'Do not run MDR at full load continuously — allow thermal recovery time', 'Roller direction can be reversed via controller — no rewiring needed'],
  },
  {
    id: 'ac-induction',
    name: 'AC Induction Motors',
    abbr: 'ACIM',
    illustration: AC_INDUCTION_ILLUSTRATION,
    description: 'AC Induction Motors are the most common motor type in fulfillment centers. They are rugged, low-maintenance, and available in single-phase (120V/240V) and three-phase (240V/480V) versions. The magnetic field in the stator induces current in the rotor — no brushes, no encoder required for basic operation.',
    specs: ['Voltage: 120VAC / 240VAC (1-phase), 240VAC / 480VAC (3-phase)', 'Frame: NEMA 48, 56, 143T, 145T common in FCs', 'Enclosure: TEFC (Totally Enclosed Fan Cooled)', 'Service Factor: 1.15 typical', 'Common use: Conveyor belts, sorters, fans, pumps'],
    voltages: [
      { id: '120VAC', label: '120VAC 1Ø', getSvg: () => acInductionWiring('120VAC') },
      { id: '240VAC', label: '240VAC 1Ø', getSvg: () => acInductionWiring('240VAC') },
      { id: '480VAC', label: '480VAC 3Ø', getSvg: () => acInductionWiring('480VAC') },
    ],
    notes: ['Always check nameplate for voltage, FLA, and winding configuration before wiring', 'For dual-voltage motors, verify terminal jumpers match selected voltage', 'Single-phase motors require a run capacitor — never bypass it', 'Three-phase: swapping any 2 of L1/L2/L3 reverses direction'],
  },
  {
    id: 'pancake',
    name: 'Pancake Motors',
    abbr: 'Axial Flux',
    illustration: PANCAKE_ILLUSTRATION,
    description: 'Pancake motors (axial flux motors) have a very flat, disc-like form factor. The magnetic flux travels axially rather than radially, giving high torque density in a short axial length. Used where space is limited or a direct-drive low-profile solution is needed.',
    specs: ['Voltage: 120VAC / 240VAC', 'Form factor: Very low axial height (pancake shape)', 'Torque: High torque-to-weight ratio', 'Cooling: Natural convection or forced air', 'Common use: Direct-drive conveyors, low-clearance drives, fans'],
    voltages: [
      { id: '120VAC', label: '120VAC 1Ø', getSvg: () => pancakeWiring('120VAC') },
      { id: '240VAC', label: '240VAC 1Ø', getSvg: () => pancakeWiring('240VAC') },
    ],
    notes: ['Run capacitor often built-in — check spec sheet before adding external', 'Mount with shaft vertical or horizontal per manufacturer recommendation', 'Thin profile does not mean lower heat — ensure adequate airflow around disc', 'Reverse direction by swapping T1 and T2'],
  },
  {
    id: 'bldc',
    name: 'Brushless DC Motors',
    abbr: 'BLDC',
    illustration: BLDC_ILLUSTRATION,
    description: 'Brushless DC motors (BLDC) use electronic commutation instead of brushes, controlled by an ESC or BLDC controller. Three-phase windings (U, V, W) are energized in sequence by the controller based on hall sensor feedback, producing smooth rotation with high efficiency and long service life.',
    specs: ['Voltage: 24VDC / 48VDC bus', 'Phases: 3-phase (U, V, W)', 'Feedback: Hall effect sensors (H1, H2, H3)', 'Control: PWM, CAN bus, RS-485, analog ±10V', 'Common use: Robotic arms, AGVs, high-speed rollers, precision drives'],
    voltages: [
      { id: '24VDC', label: '24VDC', getSvg: () => bldcWiring('24VDC') },
      { id: '48VDC', label: '48VDC', getSvg: () => bldcWiring('48VDC') },
    ],
    notes: ['Never connect motor directly to DC supply — always use a BLDC controller/ESC', 'Hall sensor connector polarity must match controller — verify before powering', 'Reverse direction: swap any two of U/V/W or use controller firmware setting', 'Keep hall sensor cable shielded and away from power cables'],
  },
  {
    id: 'servo',
    name: 'Servo Motors',
    abbr: 'Robin / Cardinal',
    illustration: SERVO_ILLUSTRATION,
    description: 'Servo motors combine a brushless AC or DC motor with a high-resolution encoder for precise position, speed, and torque control. In Amazon fulfillment centers, "Robin" and "Cardinal" are servo motor/drive systems used on specific conveyor and sortation equipment. They require a dedicated servo drive that converts AC power to controlled 3-phase output.',
    specs: ['Drive input: 120VAC or 240VAC single phase', 'Motor output: 3-phase PWM (U, V, W)', 'Encoder: Incremental or absolute, 2500–17-bit resolution', 'Control modes: Position, velocity, torque', 'Common use: Precise conveyor indexing, diverters, robotic joints'],
    voltages: [
      { id: '120VAC', label: '120VAC Drive', getSvg: () => servoWiring('120VAC') },
      { id: '240VAC', label: '240VAC Drive', getSvg: () => servoWiring('240VAC') },
    ],
    notes: ['Drive converts AC → DC bus → 3-phase to motor — never wire motor direct to AC', 'Encoder feedback cable must be shielded and separated from power cables by 6"+', 'Enable signal (24VDC) must be present before drive outputs power to motor', 'Fault output should be wired to PLC/safety relay to stop machine on drive fault', 'Regen resistor required for high-inertia or frequent stop/start applications'],
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function DiagramView() {
  const [selectedMotor, setSelectedMotor] = useState('mdr');
  const [selectedVoltage, setSelectedVoltage] = useState('24VDC');
  const [showNotes, setShowNotes] = useState(true);

  const motor = MOTORS.find((m) => m.id === selectedMotor);

  function selectMotor(id) {
    setSelectedMotor(id);
    const m = MOTORS.find((mo) => mo.id === id);
    setSelectedVoltage(m.voltages[0].id);
  }

  const voltageEntry = motor?.voltages.find((v) => v.id === selectedVoltage);
  const wiringDiagram = voltageEntry?.getSvg?.();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Motor type tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {MOTORS.map((m) => {
          const active = selectedMotor === m.id;
          return (
            <button key={m.id} onClick={() => selectMotor(m.id)}
              style={{ padding: '7px 14px', borderRadius: '6px', background: active ? '#FF9900' : 'var(--bg-elevated)', border: active ? 'none' : '1px solid var(--border)', color: active ? '#000' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '0.65rem', opacity: 0.7, marginRight: '4px' }}>{m.abbr}</span>
              {m.name}
            </button>
          );
        })}
      </div>

      {motor && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: '14px' }}>

          {/* Left: illustration + specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Motor illustration */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
              <div dangerouslySetInnerHTML={{ __html: motor.illustration }} />
            </div>

            {/* Description */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>About</div>
              <p style={{ fontSize: '0.79rem', color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>{motor.description}</p>
            </div>

            {/* Specs */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>Specifications</div>
              {motor.specs.map((s) => (
                <div key={s} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', gap: '6px', marginBottom: '5px' }}>
                  <span style={{ color: '#FF9900', flexShrink: 0 }}>•</span>{s}
                </div>
              ))}
            </div>

            {/* Safety notes */}
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '14px' }}>
              <button onClick={() => setShowNotes((n) => !n)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', marginBottom: showNotes ? '8px' : 0 }}>
                <Info size={13} color="#ef4444" />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Safety Notes</span>
                {showNotes ? <ChevronUp size={12} color="#ef4444" style={{ marginLeft: 'auto' }} /> : <ChevronDown size={12} color="#ef4444" style={{ marginLeft: 'auto' }} />}
              </button>
              {showNotes && motor.notes.map((n, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', gap: '6px', marginBottom: '5px', lineHeight: 1.5 }}>
                  <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{n}
                </div>
              ))}
            </div>
          </div>

          {/* Right: voltage selector + wiring diagram */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Voltage tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {motor.voltages.map((v) => {
                const active = selectedVoltage === v.id;
                return (
                  <button key={v.id} onClick={() => setSelectedVoltage(v.id)}
                    style={{ padding: '6px 14px', borderRadius: '5px', background: active ? 'rgba(255,153,0,0.15)' : 'var(--bg-elevated)', border: active ? '1px solid rgba(255,153,0,0.5)' : '1px solid var(--border)', color: active ? '#FF9900' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: active ? 700 : 400, cursor: 'pointer' }}>
                    {v.label}
                  </button>
                );
              })}
            </div>

            {/* Wiring diagram */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', overflowX: 'auto', flex: 1 }}>
              {wiringDiagram
                ? <div dangerouslySetInnerHTML={{ __html: wiringDiagram }} />
                : <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', padding: '20px', textAlign: 'center' }}>Diagram not available for this voltage.</div>
              }
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .diagram-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
