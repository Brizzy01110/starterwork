import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
} from 'recharts';

const PRIORITY_COLORS = {
  Critical: '#ff3b3b',
  High: '#ff7a00',
  Medium: '#f5c518',
  Low: '#4caf8e',
};

const STATE_COLORS = {
  Operational: '#22c55e',
  Degraded: '#f59e0b',
  Down: '#ef4444',
  Maintenance: '#6366f1',
  Unknown: '#6b7280',
};

const STATUS_COLORS = {
  Open: '#FF9900',
  'In Progress': '#818cf8',
  Resolved: '#22c55e',
  'Pending Parts': '#f5c518',
};

const CHART_STYLE = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '16px',
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontSize: '0.78rem',
    color: 'var(--text-primary)',
  },
  itemStyle: { color: 'var(--text-primary)' },
  labelStyle: { color: 'var(--text-secondary)', marginBottom: '4px' },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

function ChartTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitle}</div>}
    </div>
  );
}

export default function AnalyticsView({ workOrders }) {
  // WOs by machine type
  const byType = {};
  workOrders.forEach((wo) => {
    if (!byType[wo.machineType]) byType[wo.machineType] = { name: wo.machineType, total: 0, Critical: 0, High: 0, Medium: 0, Low: 0 };
    byType[wo.machineType].total++;
    byType[wo.machineType][wo.priority]++;
  });
  const typeData = Object.values(byType).sort((a, b) => b.total - a.total);

  // WOs by priority
  const byPriority = {};
  workOrders.forEach((wo) => {
    byPriority[wo.priority] = (byPriority[wo.priority] || 0) + 1;
  });
  const priorityData = Object.entries(byPriority).map(([name, value]) => ({ name, value }));

  // WOs by machine state
  const byState = {};
  workOrders.forEach((wo) => {
    byState[wo.machineState] = (byState[wo.machineState] || 0) + 1;
  });
  const stateData = Object.entries(byState).map(([name, value]) => ({ name, value }));

  // WOs by status
  const byStatus = {};
  workOrders.forEach((wo) => {
    byStatus[wo.status] = (byStatus[wo.status] || 0) + 1;
  });
  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));

  // WOs created per day (last 14 days)
  const now = new Date();
  const dailyData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const dayStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = workOrders.filter((wo) => new Date(wo.createdAt).toISOString().slice(0, 10) === dayStr).length;
    return { date: label, count };
  });

  // Tech workload
  const byTech = {};
  workOrders.forEach((wo) => {
    if (wo.status !== 'Resolved') {
      byTech[wo.assignedTech] = (byTech[wo.assignedTech] || 0) + 1;
    }
  });
  const techData = Object.entries(byTech).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const axisStyle = { fill: 'var(--text-secondary)', fontSize: 11 };
  const gridStyle = { stroke: 'var(--border)', strokeOpacity: 0.5 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>

      {/* WOs by machine type */}
      <div style={{ ...CHART_STYLE, gridColumn: 'span 2' }}>
        <ChartTitle title="Work Orders by Machine Type" subtitle="Breakdown by priority per machine type" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={typeData} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <CartesianGrid vertical={false} stroke={gridStyle.stroke} strokeOpacity={gridStyle.strokeOpacity} />
            <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }} />
            <Bar dataKey="Critical" stackId="a" fill={PRIORITY_COLORS.Critical} radius={[0,0,0,0]} />
            <Bar dataKey="High" stackId="a" fill={PRIORITY_COLORS.High} />
            <Bar dataKey="Medium" stackId="a" fill={PRIORITY_COLORS.Medium} />
            <Bar dataKey="Low" stackId="a" fill={PRIORITY_COLORS.Low} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily creation trend */}
      <div style={{ ...CHART_STYLE, gridColumn: 'span 2' }}>
        <ChartTitle title="Work Orders Created (Last 14 Days)" subtitle="Daily new work order volume" />
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={dailyData} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <CartesianGrid vertical={false} stroke={gridStyle.stroke} strokeOpacity={gridStyle.strokeOpacity} />
            <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="count"
              name="New WOs"
              stroke="#FF9900"
              strokeWidth={2}
              dot={{ fill: '#FF9900', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Priority distribution */}
      <div style={CHART_STYLE}>
        <ChartTitle title="Priority Distribution" />
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={priorityData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
            >
              {priorityData.map((entry) => (
                <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#888'} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Machine state distribution */}
      <div style={CHART_STYLE}>
        <ChartTitle title="Machine State Distribution" />
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={stateData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
            >
              {stateData.map((entry) => (
                <Cell key={entry.name} fill={STATE_COLORS[entry.name] || '#888'} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Status breakdown */}
      <div style={CHART_STYLE}>
        <ChartTitle title="Status Breakdown" subtitle="Current WO status distribution" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 60 }}>
            <CartesianGrid horizontal={false} stroke={gridStyle.stroke} strokeOpacity={gridStyle.strokeOpacity} />
            <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis dataKey="name" type="category" tick={axisStyle} tickLine={false} axisLine={false} width={80} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Count" radius={[0, 3, 3, 0]}>
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#888'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Technician workload */}
      <div style={CHART_STYLE}>
        <ChartTitle title="Open WOs by Technician" subtitle="Active (non-resolved) work orders per tech" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={techData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 60 }}>
            <CartesianGrid horizontal={false} stroke={gridStyle.stroke} strokeOpacity={gridStyle.strokeOpacity} />
            <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis dataKey="name" type="category" tick={axisStyle} tickLine={false} axisLine={false} width={70} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="count" name="Open WOs" fill="#FF9900" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
