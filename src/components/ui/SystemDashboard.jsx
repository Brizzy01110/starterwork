import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, Activity, TrendingUp, TrendingDown, Zap, Shield, Package, DollarSign } from 'lucide-react';
import ActivityFeed from './ActivityFeed.jsx';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1a1d2b', border: '1px solid #2a3040', borderRadius: '8px', fontSize: '0.75rem', color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#8a95a8', marginBottom: '4px' },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

function KPICard({ icon: Icon, label, value, sub, color, trend, trendVal }) {
  const trendUp = trend === 'up';
  const trendColor = trendUp ? '#ef4444' : '#22c55e'; // up = worse for downtime metrics
  return (
    <div style={{
      background: 'var(--bg-surface)', border: `1px solid ${color}22`,
      borderRadius: '12px', padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* BG glow */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${color}0c`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={color} />
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        </div>
        {trendVal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: trendColor }}>
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trendVal}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: '2.2rem', fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionLabel({ title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
      {sub && <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{sub}</span>}
    </div>
  );
}

const STATUS_COLORS = { open: '#FF9900', 'in progress': '#818cf8', 'in-progress': '#818cf8', resolved: '#22c55e', closed: '#22c55e', 'pending parts': '#f5c518' };
const PRIORITY_COLORS = { critical: '#dc2626', high: '#ef4444', medium: '#FF9900', low: '#22c55e' };
const PIE_COLORS = ['#FF9900', '#818cf8', '#22c55e', '#06b6d4', '#f5c518', '#ef4444'];

export default function SystemDashboard({ workOrders = [], connStatus = 'connected', lastRefreshed }) {
  const stats = useMemo(() => {
    const open = workOrders.filter((w) => w.status !== 'resolved' && w.status !== 'Resolved' && w.status !== 'closed').length;
    const resolved = workOrders.filter((w) => w.status === 'resolved' || w.status === 'Resolved' || w.status === 'closed').length;
    const critical = workOrders.filter((w) => (w.priority === 'critical' || w.priority === 'Critical') && w.status !== 'resolved' && w.status !== 'Resolved').length;
    const down = workOrders.filter((w) => w.machineState === 'Down').length;
    const inProgress = workOrders.filter((w) => w.status === 'In Progress' || w.status === 'in-progress').length;
    const pendingParts = workOrders.filter((w) => w.status === 'Pending Parts' || w.status === 'pending parts').length;
    const resolvedRate = workOrders.length > 0 ? Math.round((resolved / workOrders.length) * 100) : 100;

    // Avg resolution hours
    const resolvedWOs = workOrders.filter((w) => w.status === 'resolved' || w.status === 'Resolved');
    let avgHours = null;
    if (resolvedWOs.length) {
      const total = resolvedWOs.reduce((acc, w) => {
        return acc + (new Date(w.updatedAt || w.createdAt) - new Date(w.createdAt)) / 3600000;
      }, 0);
      avgHours = (total / resolvedWOs.length).toFixed(1);
    }

    return { open, resolved, critical, down, inProgress, pendingParts, resolvedRate, avgHours, total: workOrders.length };
  }, [workOrders]);

  // WOs over last 14 days
  const trendData = useMemo(() => {
    const days = 14;
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const created = workOrders.filter((w) => w.createdAt?.slice(0, 10) === key).length;
      const resolved = workOrders.filter((w) => (w.updatedAt || '').slice(0, 10) === key && (w.status === 'resolved' || w.status === 'Resolved')).length;
      return { label, created, resolved };
    });
  }, [workOrders]);

  // By priority
  const priorityData = useMemo(() => {
    const counts = {};
    workOrders.forEach((w) => {
      const p = (w.priority || 'Unknown').toLowerCase();
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: PRIORITY_COLORS[name] || '#818cf8' }));
  }, [workOrders]);

  // By status
  const statusData = useMemo(() => {
    const counts = {};
    workOrders.forEach((w) => {
      const s = (w.status || 'Open');
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [workOrders]);

  // By machine type (top 8)
  const machineData = useMemo(() => {
    const counts = {};
    workOrders.forEach((w) => {
      const m = w.machineType || w.machineId || 'Unknown';
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [workOrders]);

  // Downtime alerts — open WOs sorted by age
  const downtimeAlerts = useMemo(() => {
    return workOrders
      .filter((w) => w.status !== 'resolved' && w.status !== 'Resolved' && w.status !== 'closed')
      .map((w) => ({
        ...w,
        ageHours: (Date.now() - new Date(w.createdAt).getTime()) / 3600000,
      }))
      .sort((a, b) => b.ageHours - a.ageHours)
      .slice(0, 8);
  }, [workOrders]);

  const connColor = connStatus === 'connected' ? '#22c55e' : connStatus === 'connecting' ? '#FF9900' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── System Status Banner ── */}
      <div style={{
        background: 'var(--bg-surface)', border: `1px solid ${connColor}33`,
        borderRadius: '12px', padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        boxShadow: `0 0 20px ${connColor}0a`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: connColor }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: connColor, opacity: 0.3, animation: 'pulse-ring 2s ease-out infinite' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Active Work Orders System Status
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {connStatus === 'connected' ? 'Real-time sync active · Auto-refreshes every 30s' : connStatus === 'connecting' ? 'Connecting to live database…' : 'Offline — showing cached data'}
              {lastRefreshed && connStatus === 'connected' && ` · Last updated ${lastRefreshed.toLocaleTimeString()}`}
            </div>
          </div>
        </div>

        {/* Quick status pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Open', val: stats.open, color: '#FF9900' },
            { label: 'Critical', val: stats.critical, color: '#ef4444' },
            { label: 'Machines Down', val: stats.down, color: '#dc2626' },
            { label: 'In Progress', val: stats.inProgress, color: '#818cf8' },
            { label: 'Resolved', val: stats.resolved, color: '#22c55e' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '99px',
              background: `${color}12`, border: `1px solid ${color}33`,
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color, fontFamily: 'monospace' }}>{val}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '12px' }}>
        <KPICard icon={Package}       label="Open WOs"         value={stats.open}        sub={`${stats.inProgress} in progress`}     color="#FF9900"  trend={stats.open > 5 ? 'up' : 'down'} trendVal={stats.open > 5 ? 'High Load' : 'Normal'} />
        <KPICard icon={AlertTriangle} label="Critical Alerts"  value={stats.critical}    sub="requiring immediate action"              color="#ef4444"  trend={stats.critical > 0 ? 'up' : 'down'} trendVal={stats.critical > 0 ? `${stats.critical} active` : 'Clear'} />
        <KPICard icon={Activity}      label="Machines Down"    value={stats.down}        sub="currently offline"                       color="#dc2626"  trend={stats.down > 0 ? 'up' : 'down'} trendVal={stats.down > 2 ? 'Critical' : stats.down > 0 ? 'Monitor' : 'All Up'} />
        <KPICard icon={Clock}         label="Avg Resolution"   value={stats.avgHours ? `${stats.avgHours}h` : '—'} sub="mean time to resolve"  color="#818cf8" />
        <KPICard icon={CheckCircle2}  label="Resolved Rate"    value={`${stats.resolvedRate}%`} sub={`${stats.resolved} of ${stats.total} closed`} color="#22c55e" trend={stats.resolvedRate < 50 ? 'up' : 'down'} trendVal={stats.resolvedRate >= 70 ? 'On Track' : 'Behind'} />
        <KPICard icon={DollarSign}    label="Pending Parts"    value={stats.pendingParts} sub="awaiting parts"                         color="#f5c518" />
      </div>

      {/* ── Charts Row 1: Trend + Priority ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>

        {/* WO Trend */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
          <SectionLabel title="Work Order Trend" sub="14-day created vs resolved" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9900" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: '#8a95a8', fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: '#8a95a8', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.72rem' }} />
              <Area type="monotone" dataKey="created" stroke="#FF9900" strokeWidth={2} fill="url(#gradCreated)" name="Created" dot={false} />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fill="url(#gradResolved)" name="Resolved" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Pie */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
          <SectionLabel title="By Priority" sub="current distribution" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {priorityData.map(({ name, value, color }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
                <span style={{ fontWeight: 700, color, fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2: Machine breakdown + Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Machine type bar */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
          <SectionLabel title="WOs by Machine Type" sub="top 8 machines" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={machineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#8a95a8', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8a95a8', fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} name="Work Orders">
                {machineData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status bar */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
          <SectionLabel title="WOs by Status" sub="current breakdown" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 4, right: 4, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#8a95a8', fontSize: 9 }} tickLine={false} axisLine={false} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: '#8a95a8', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Count">
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[(entry.name || '').toLowerCase()] || PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row: Downtime Alerts + Activity Feed ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Downtime Alerts */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 16px rgba(239,68,68,0.06)' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.05)' }}>
            <Zap size={14} color="#ef4444" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Downtime Alerts</span>
            <span style={{ marginLeft: 'auto', padding: '1px 7px', borderRadius: '99px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.65rem', fontWeight: 700 }}>
              {downtimeAlerts.length} active
            </span>
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {downtimeAlerts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#22c55e', fontSize: '0.82rem' }}>
                <CheckCircle2 size={20} style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                No active downtime — all machines operational
              </div>
            ) : downtimeAlerts.map((wo, i) => {
              const ageH = wo.ageHours;
              const urgency = ageH > 24 ? '#dc2626' : ageH > 8 ? '#ef4444' : ageH > 2 ? '#FF9900' : '#f5c518';
              const pColor = PRIORITY_COLORS[(wo.priority || '').toLowerCase()] || '#FF9900';
              return (
                <div key={wo.id} style={{
                  padding: '10px 16px', borderBottom: i < downtimeAlerts.length - 1 ? '1px solid var(--border)' : 'none',
                  borderLeft: `3px solid ${urgency}`,
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '7px', alignItems: 'center', marginBottom: '2px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#FF9900', fontWeight: 700 }}>{wo.id}</span>
                      <span style={{ padding: '1px 5px', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 700, background: `${pColor}18`, color: pColor, textTransform: 'uppercase' }}>{wo.priority}</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{wo.issueTitle}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{wo.machineId} — {wo.status}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 800, color: urgency }}>
                      {ageH < 1 ? `${Math.round(ageH * 60)}m` : `${ageH.toFixed(1)}h`}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>open</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <ActivityFeed workOrders={workOrders} maxHeight={360} />
      </div>

      {/* System health footer */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
      }}>
        <Shield size={14} color="#818cf8" />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>System Health</span>
        {[
          { label: 'Database', status: connStatus === 'connected' ? 'Operational' : 'Degraded', color: connStatus === 'connected' ? '#22c55e' : '#FF9900' },
          { label: 'Real-Time Sync', status: connStatus === 'connected' ? 'Active' : 'Reconnecting', color: connStatus === 'connected' ? '#22c55e' : '#FF9900' },
          { label: 'Work Order Engine', status: 'Operational', color: '#22c55e' },
          { label: 'Downtime Monitor', status: 'Active', color: '#22c55e' },
          { label: 'Alert System', status: stats.critical > 0 ? `${stats.critical} Active` : 'Standby', color: stats.critical > 0 ? '#ef4444' : '#22c55e' },
        ].map(({ label, status, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color }}>{status}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(2.4); opacity: 0; } }
      `}</style>
    </div>
  );
}
