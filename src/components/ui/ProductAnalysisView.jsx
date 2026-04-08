import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Cell,
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Package, Zap, ChevronDown, ChevronUp } from 'lucide-react';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const TYPE_COLORS = {
  'Conveyor Belt': '#FF9900',
  'Sorter':        '#818cf8',
  'Robotic Arm':   '#22c55e',
  'Scanner':       '#f59e0b',
  'Label Printer': '#ec4899',
  'Pallet Jack':   '#06b6d4',
};
const colorOf = (type) => TYPE_COLORS[type] || '#888';

// Keywords that signal a likely defective/weak-point issue
const DEFECT_KEYWORDS = [
  'fail', 'broke', 'broken', 'defect', 'worn', 'crack', 'damage', 'error',
  'fault', 'jam', 'stuck', 'misalign', 'leak', 'burn', 'short', 'overheat',
  'not working', 'offline', 'down', 'replace', 'sensor', 'motor', 'belt',
];

const WEAK_POINT_LABELS = [
  'Mechanical',   // belts, rollers, gears
  'Electrical',   // motors, sensors, wiring
  'Software/PLC', // firmware, plc, calibration
  'Hydraulic',    // hydraulic, fluid, leak
  'Structural',   // frame, crack, bend
];

// Map issue text → weak-point category
function classifyWeakPoint(text) {
  const t = text.toLowerCase();
  if (/firmware|plc|software|calibrat|program|code|scan/.test(t)) return 'Software/PLC';
  if (/motor|sensor|wire|electrical|voltage|current|fuse|relay|short|burn/.test(t)) return 'Electrical';
  if (/hydraul|fluid|leak|pressure|pump/.test(t)) return 'Hydraulic';
  if (/frame|crack|bend|struct|weld|bolt|mount/.test(t)) return 'Structural';
  return 'Mechanical';
}

function isDefective(wo) {
  const text = `${wo.issueTitle} ${wo.problemDescription}`.toLowerCase();
  return DEFECT_KEYWORDS.some((k) => text.includes(k));
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontSize: '0.78rem',
    color: '#e2e8f0',
  },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', marginBottom: '4px' },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

/* ─── Data engine ────────────────────────────────────────────────────────── */

function buildAnalysis(workOrders, selectedMonth) {
  // Filter to selected month (or all if null)
  const filtered = selectedMonth
    ? workOrders.filter((wo) => {
        const d = new Date(wo.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
      })
    : workOrders;

  // ── Monthly volume trend (last 12 months) ──
  const now = new Date();
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    const monthWOs = workOrders.filter((wo) => {
      const w = new Date(wo.createdAt);
      return `${w.getFullYear()}-${String(w.getMonth() + 1).padStart(2, '0')}` === key;
    });
    const defective = monthWOs.filter(isDefective).length;
    return { label, total: monthWOs.length, defective, nonDefective: monthWOs.length - defective };
  });

  // ── Per-product (machine type) breakdown ──
  const byType = {};
  filtered.forEach((wo) => {
    if (!byType[wo.machineType]) {
      byType[wo.machineType] = {
        type: wo.machineType,
        total: 0,
        defective: 0,
        critical: 0,
        resolved: 0,
        weakPoints: { Mechanical: 0, Electrical: 0, 'Software/PLC': 0, Hydraulic: 0, Structural: 0 },
        units: {},      // machineId → count
        issues: [],     // top issue titles
      };
    }
    const entry = byType[wo.machineType];
    entry.total++;
    if (isDefective(wo)) entry.defective++;
    if (wo.priority === 'Critical') entry.critical++;
    if (wo.status === 'Resolved') entry.resolved++;
    entry.weakPoints[classifyWeakPoint(`${wo.issueTitle} ${wo.problemDescription}`)]++;
    entry.units[wo.machineId] = (entry.units[wo.machineId] || 0) + 1;
    entry.issues.push(wo.issueTitle);
  });

  // Compute defect rate + most-affected unit + top recurring issue
  const products = Object.values(byType).map((p) => {
    const defectRate = p.total > 0 ? Math.round((p.defective / p.total) * 100) : 0;
    const topUnit = Object.entries(p.units).sort((a, b) => b[1] - a[1])[0];
    // Count issue frequency
    const issueCount = {};
    p.issues.forEach((t) => { issueCount[t] = (issueCount[t] || 0) + 1; });
    const topIssue = Object.entries(issueCount).sort((a, b) => b[1] - a[1])[0];
    // Radar data
    const radarData = WEAK_POINT_LABELS.map((l) => ({ subject: l, value: p.weakPoints[l] || 0 }));
    return { ...p, defectRate, topUnit, topIssue, radarData };
  }).sort((a, b) => b.defectRate - a.defectRate);

  // ── Weak points across all filtered WOs ──
  const globalWeak = { Mechanical: 0, Electrical: 0, 'Software/PLC': 0, Hydraulic: 0, Structural: 0 };
  filtered.forEach((wo) => {
    globalWeak[classifyWeakPoint(`${wo.issueTitle} ${wo.problemDescription}`)]++;
  });
  const weakData = Object.entries(globalWeak)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ── Most defective individual units ──
  const unitMap = {};
  filtered.forEach((wo) => {
    if (!unitMap[wo.machineId]) unitMap[wo.machineId] = { id: wo.machineId, type: wo.machineType, total: 0, defective: 0 };
    unitMap[wo.machineId].total++;
    if (isDefective(wo)) unitMap[wo.machineId].defective++;
  });
  const topUnits = Object.values(unitMap)
    .map((u) => ({ ...u, defectRate: u.total > 0 ? Math.round((u.defective / u.total) * 100) : 0 }))
    .sort((a, b) => b.defective - a.defective)
    .slice(0, 8);

  return { filtered, monthlyTrend, products, weakData, topUnits };
}

/* ─── UI helpers ─────────────────────────────────────────────────────────── */

function StatCard({ label, value, sub, color = '#FF9900', icon: Icon }) {
  return (
    <div style={{
      flex: 1, minWidth: 110, padding: '14px 16px', borderRadius: '8px',
      background: `${color}0f`, border: `1px solid ${color}28`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        {Icon && <Icon size={14} color={color} />}
        {sub && <span style={{ fontSize: '0.65rem', color, fontWeight: 600 }}>{sub}</span>}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function TrendBadge({ rate, prev }) {
  if (prev === undefined || prev === null) return null;
  const diff = rate - prev;
  if (Math.abs(diff) < 2) return <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px' }}><Minus size={11} /> Stable</span>;
  if (diff > 0) return <span style={{ fontSize: '0.68rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={11} />+{diff}%</span>;
  return <span style={{ fontSize: '0.68rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingDown size={11} />{diff}%</span>;
}

function RiskBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
    </div>
  );
}

function SectionBox({ title, subtitle, children, span2 = false }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '18px',
      gridColumn: span2 ? 'span 2' : undefined,
    }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

/* ─── Product card ───────────────────────────────────────────────────────── */

function ProductCard({ product }) {
  const [expanded, setExpanded] = useState(false);
  const color = colorOf(product.type);
  const riskColor = product.defectRate >= 70 ? '#ef4444' : product.defectRate >= 40 ? '#f59e0b' : '#22c55e';
  const riskLabel = product.defectRate >= 70 ? 'HIGH RISK' : product.defectRate >= 40 ? 'MODERATE' : 'LOW RISK';

  return (
    <div style={{
      background: 'var(--bg-surface)', border: `1px solid var(--border)`,
      borderTop: `3px solid ${color}`,
      borderRadius: '10px', overflow: 'hidden',
    }}>
      {/* Card header */}
      <button
        onClick={() => setExpanded((o) => !o)}
        style={{
          width: '100%', padding: '14px 16px', border: 'none', cursor: 'pointer',
          background: 'none', textAlign: 'left',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={14} color={color} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>{product.type}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
              background: `${riskColor}18`, border: `1px solid ${riskColor}40`, color: riskColor,
            }}>{riskLabel}</span>
            {expanded ? <ChevronUp size={13} color="#64748b" /> : <ChevronDown size={13} color="#64748b" />}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total WOs', value: product.total, color: '#94a3b8' },
            { label: 'Defective', value: product.defective, color: '#ef4444' },
            { label: 'Critical', value: product.critical, color: '#FF9900' },
            { label: 'Resolved', value: product.resolved, color: '#22c55e' },
          ].map(({ label, value, color: c }) => (
            <div key={label} style={{ textAlign: 'center', minWidth: 52 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c }}>{value}</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
          {/* Defect rate gauge */}
          <div style={{ flex: 1, minWidth: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Defect Rate</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: riskColor }}>{product.defectRate}%</span>
            </div>
            <RiskBar value={product.defectRate} max={100} color={riskColor} />
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Top unit + top issue */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Most Affected Unit</div>
              {product.topUnit ? (
                <>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: color, fontFamily: 'monospace' }}>{product.topUnit[0]}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{product.topUnit[1]} incident{product.topUnit[1] !== 1 ? 's' : ''}</div>
                </>
              ) : <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No data</div>}
            </div>
            <div style={{ padding: '10px 12px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top Recurring Issue</div>
              {product.topIssue ? (
                <>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>{product.topIssue[0]}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>×{product.topIssue[1]} occurrences</div>
                </>
              ) : <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No data</div>}
            </div>
          </div>

          {/* Weak point radar */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Failure Category Breakdown
            </div>
            {/* Bar breakdown since radar needs large height */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {product.radarData.sort((a, b) => b.value - a.value).map(({ subject, value }) => (
                <div key={subject} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', width: 90, flexShrink: 0 }}>{subject}</span>
                  <RiskBar value={value} max={product.total || 1} color={color} />
                  <span style={{ fontSize: '0.72rem', color: color, fontWeight: 700, width: 20, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI-style insight */}
          <div style={{
            padding: '10px 12px', borderRadius: '7px',
            background: 'rgba(255,153,0,0.05)', border: '1px solid rgba(255,153,0,0.2)',
          }}>
            <div style={{ fontSize: '0.65rem', color: '#FF9900', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Analysis Insight
            </div>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              {generateInsight(product)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function generateInsight(p) {
  const topWeak = p.radarData.sort((a, b) => b.value - a.value)[0];
  const pct = p.defectRate;
  const risk = pct >= 70 ? 'high defect rate' : pct >= 40 ? 'moderate defect rate' : 'low defect rate';

  let insight = `${p.type} shows a ${risk} of ${pct}% across ${p.total} work order${p.total !== 1 ? 's' : ''} in this period. `;

  if (topWeak && topWeak.value > 0) {
    insight += `The dominant failure category is ${topWeak.subject} (${topWeak.value} incident${topWeak.value !== 1 ? 's' : ''}), indicating this is the primary weak point. `;
  }
  if (p.topUnit) {
    insight += `Unit ${p.topUnit[0]} is the most problematic individual machine with ${p.topUnit[1]} incident${p.topUnit[1] !== 1 ? 's' : ''}. `;
  }
  if (pct >= 60) {
    insight += 'Recommend escalating to OEM and scheduling a full inspection with increased PM frequency.';
  } else if (pct >= 30) {
    insight += 'Consider tightening PM intervals and reviewing operating procedures for this machine type.';
  } else {
    insight += 'Current maintenance approach appears effective. Continue scheduled PM intervals.';
  }
  return insight;
}

/* ─── Available months selector ─────────────────────────────────────────── */

function getAvailableMonths(workOrders) {
  const set = new Set();
  workOrders.forEach((wo) => {
    const d = new Date(wo.createdAt);
    set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  });
  return Array.from(set).sort((a, b) => (a < b ? 1 : -1)); // descending
}

function monthLabel(key) {
  const [y, m] = key.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

/* ─── Main view ──────────────────────────────────────────────────────────── */

export default function ProductAnalysisView({ workOrders }) {
  const availableMonths = useMemo(() => getAvailableMonths(workOrders), [workOrders]);
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || null);

  const { filtered, monthlyTrend, products, weakData, topUnits } = useMemo(
    () => buildAnalysis(workOrders, selectedMonth),
    [workOrders, selectedMonth]
  );

  const totalDefective = filtered.filter(isDefective).length;
  const defectRate = filtered.length > 0 ? Math.round((totalDefective / filtered.length) * 100) : 0;
  const criticalCount = filtered.filter((w) => w.priority === 'Critical').length;
  const resolvedCount = filtered.filter((w) => w.status === 'Resolved').length;

  const axisStyle = { fill: '#64748b', fontSize: 11 };
  const gridStyle = { stroke: '#1e293b', strokeOpacity: 1 };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
          Monthly Product Defect Analysis
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: 0, maxWidth: 700 }}>
          Tracks branded machine types month-by-month, scores defect rates, identifies weak-point failure categories,
          and surfaces the most problematic individual units to help narrow down systemic issues.
        </p>
      </div>

      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Filter Month:
        </span>
        <button
          onClick={() => setSelectedMonth(null)}
          style={{
            padding: '5px 14px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
            border: selectedMonth === null ? '1px solid rgba(255,153,0,0.5)' : '1px solid var(--border)',
            background: selectedMonth === null ? 'rgba(255,153,0,0.12)' : 'var(--bg-elevated)',
            color: selectedMonth === null ? '#FF9900' : '#64748b', cursor: 'pointer',
          }}
        >All Time</button>
        {availableMonths.map((m) => (
          <button key={m} onClick={() => setSelectedMonth(m)} style={{
            padding: '5px 14px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
            border: selectedMonth === m ? '1px solid rgba(255,153,0,0.5)' : '1px solid var(--border)',
            background: selectedMonth === m ? 'rgba(255,153,0,0.12)' : 'var(--bg-elevated)',
            color: selectedMonth === m ? '#FF9900' : '#64748b', cursor: 'pointer',
          }}>{monthLabel(m)}</button>
        ))}
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <StatCard label="Work Orders" value={filtered.length} color="#FF9900" icon={Package} />
        <StatCard label="Defect-Related" value={totalDefective} color="#ef4444" icon={AlertTriangle}
          sub={filtered.length > 0 ? `${defectRate}% rate` : undefined} />
        <StatCard label="Critical" value={criticalCount} color="#f97316" icon={Zap} />
        <StatCard label="Resolved" value={resolvedCount} color="#22c55e" icon={TrendingDown}
          sub={filtered.length > 0 ? `${Math.round((resolvedCount / filtered.length) * 100)}% res.` : undefined} />
        <StatCard label="Machine Types" value={products.length} color="#818cf8" icon={Package} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginBottom: '20px' }}>

        {/* Monthly trend */}
        <SectionBox title="Monthly Volume Trend" subtitle="Total vs defect-related WOs per month (last 12 months)" span2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrend} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid vertical={false} stroke={gridStyle.stroke} strokeOpacity={1} />
              <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.slice(0, 6)} interval="preserveStartEnd" />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '0.72rem', color: '#64748b' }} />
              <Line type="monotone" dataKey="total" name="Total WOs" stroke="#FF9900" strokeWidth={2}
                dot={{ fill: '#FF9900', r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="defective" name="Defect-Related" stroke="#ef4444" strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </SectionBox>

        {/* Weak point bar */}
        <SectionBox title="Global Weak Points" subtitle="Failure categories across all filtered WOs">
          {weakData.every((d) => d.value === 0) ? (
            <div style={{ color: '#64748b', fontSize: '0.78rem', textAlign: 'center', padding: '40px 0' }}>No data for selected period</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weakData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 70 }}>
                <CartesianGrid horizontal={false} stroke={gridStyle.stroke} />
                <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={axisStyle} tickLine={false} axisLine={false} width={80} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="value" name="Incidents" radius={[0, 4, 4, 0]}>
                  {weakData.map((entry, i) => (
                    <Cell key={i} fill={['#ef4444','#f97316','#f59e0b','#818cf8','#06b6d4'][i] || '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionBox>

        {/* Most defective units */}
        <SectionBox title="Most Defective Units" subtitle="Individual machines ranked by incident count">
          {topUnits.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.78rem', textAlign: 'center', padding: '40px 0' }}>No data for selected period</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {topUnits.map((u, i) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', width: 16 }}>#{i + 1}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: colorOf(u.type), fontFamily: 'monospace', width: 100, flexShrink: 0 }}>{u.id}</span>
                  <RiskBar value={u.defective} max={topUnits[0]?.defective || 1} color={colorOf(u.type)} />
                  <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, width: 28, textAlign: 'right' }}>{u.defective}</span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', width: 28, textAlign: 'right' }}>/{u.total}</span>
                </div>
              ))}
            </div>
          )}
        </SectionBox>

      </div>

      {/* Product breakdown cards */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Product / Machine Type Analysis — {selectedMonth ? monthLabel(selectedMonth) : 'All Time'}
          {products.length > 0 && <span style={{ fontWeight: 400, marginLeft: 8 }}>({products.length} type{products.length !== 1 ? 's' : ''} · click to expand)</span>}
        </div>
        {products.length === 0 ? (
          <div style={{
            padding: '48px', textAlign: 'center',
            background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px',
            color: '#64748b', fontSize: '0.85rem',
          }}>
            No work orders found for the selected period.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {products.map((p) => <ProductCard key={p.type} product={p} />)}
          </div>
        )}
      </div>

    </div>
  );
}
