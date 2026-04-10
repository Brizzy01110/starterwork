import { AlertTriangle, Package, Clock, TrendingUp, Activity } from 'lucide-react';
import { calcAvgResolutionHours } from '../../utils/formatters.js';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';

// Generate sparkline data from work orders grouped by day
function buildSparklineData(workOrders, field, value, days = 7) {
  const now = new Date();
  const data = Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const dayStr = date.toISOString().slice(0, 10);
    const count = workOrders.filter((wo) => {
      const woDay = new Date(wo.createdAt).toISOString().slice(0, 10);
      return woDay === dayStr && (field ? wo[field] === value : true);
    }).length;
    return { v: count };
  });
  return data;
}

function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          fill={`${color}22`}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          contentStyle={{ display: 'none' }}
          cursor={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusDot({ level }) {
  // level: 'green' | 'yellow' | 'red'
  const color = level === 'green' ? '#22c55e' : level === 'yellow' ? '#FF9900' : '#ef4444';
  return (
    <div style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4,
        animation: 'pulse-ring 1.8s ease-out infinite',
      }} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color, sparkData, statusLevel }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${statusLevel === 'red' ? 'rgba(239,68,68,0.3)' : statusLevel === 'yellow' ? 'rgba(255,153,0,0.3)' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
        flex: '1 1 140px',
        boxShadow: statusLevel === 'red' ? '0 0 12px rgba(239,68,68,0.08)' : statusLevel === 'yellow' ? '0 0 12px rgba(255,153,0,0.08)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Icon size={14} color={color} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {label}
          </span>
        </div>
        {statusLevel && <StatusDot level={statusLevel} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
          {subtext && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {subtext}
            </div>
          )}
        </div>
        {sparkData && (
          <div style={{ flex: '0 0 80px', height: '32px' }}>
            <Sparkline data={sparkData} color={color} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatsSummaryBar({ workOrders }) {
  const openCount = workOrders.filter((wo) => wo.status !== 'Resolved').length;
  const criticalCount = workOrders.filter((wo) => wo.priority === 'Critical' && wo.status !== 'Resolved').length;
  const downCount = workOrders.filter((wo) => wo.machineState === 'Down').length;
  const avgTime = calcAvgResolutionHours(workOrders);
  const inProgressCount = workOrders.filter((wo) => wo.status === 'In Progress').length;
  const resolvedCount = workOrders.filter((w) => w.status === 'Resolved').length;

  const sparkOpen = buildSparklineData(workOrders, 'status', null);
  const sparkCritical = buildSparklineData(workOrders, 'priority', 'Critical');
  const sparkDown = buildSparklineData(workOrders, 'machineState', 'Down');

  // Status level thresholds
  const openLevel = openCount === 0 ? 'green' : openCount <= 5 ? 'yellow' : 'red';
  const criticalLevel = criticalCount === 0 ? 'green' : criticalCount <= 2 ? 'yellow' : 'red';
  const downLevel = downCount === 0 ? 'green' : downCount <= 2 ? 'yellow' : 'red';
  const avgHours = parseFloat(avgTime);
  const avgLevel = !avgTime ? 'green' : avgHours <= 4 ? 'green' : avgHours <= 12 ? 'yellow' : 'red';
  const resolvedRate = workOrders.length > 0 ? resolvedCount / workOrders.length : 1;
  const totalLevel = resolvedRate >= 0.7 ? 'green' : resolvedRate >= 0.4 ? 'yellow' : 'red';

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '0 0 12px 0',
          flexWrap: 'wrap',
        }}
      >
        <StatCard
          icon={Package}
          label="Open WOs"
          value={openCount}
          subtext={`${inProgressCount} in progress`}
          color="#FF9900"
          sparkData={sparkOpen}
          statusLevel={openLevel}
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical"
          value={criticalCount}
          subtext="open critical issues"
          color="#ff3b3b"
          sparkData={sparkCritical}
          statusLevel={criticalLevel}
        />
        <StatCard
          icon={Activity}
          label="Machines Down"
          value={downCount}
          subtext="currently offline"
          color="#ef4444"
          sparkData={sparkDown}
          statusLevel={downLevel}
        />
        <StatCard
          icon={Clock}
          label="Avg Resolution"
          value={avgTime || '--'}
          subtext="from open to resolved"
          color="#818cf8"
          statusLevel={avgLevel}
        />
        <StatCard
          icon={TrendingUp}
          label="Total WOs"
          value={workOrders.length}
          subtext={`${resolvedCount} resolved`}
          color="#4caf8e"
          statusLevel={totalLevel}
        />
      </div>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
