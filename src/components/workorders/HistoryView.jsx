import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, X, Calendar, Clock, User, AlertTriangle, BarChart2, CheckCircle2, Archive } from 'lucide-react';
import PriorityBadge from '../ui/PriorityBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import MachineStateBadge from '../ui/MachineStateBadge.jsx';
import { formatDateTime } from '../../utils/formatters.js';

/* ─── grouping helpers ────────────────────────────────────────────────────── */
function groupHierarchy(workOrders) {
  // year → month → day → [wos]
  const tree = {};

  workOrders.forEach((wo) => {
    const d = new Date(wo.createdAt);
    const year  = d.getFullYear();
    const month = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const day   = d.toISOString().slice(0, 10);

    if (!tree[year])        tree[year] = {};
    if (!tree[year][month]) tree[year][month] = {};
    if (!tree[year][month][day]) tree[year][month][day] = [];
    tree[year][month][day].push(wo);
  });

  // Sort descending at every level
  return Object.keys(tree)
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      months: Object.keys(tree[year])
        .sort((a, b) => (a < b ? 1 : -1))
        .map((month) => ({
          month,
          label: new Date(month + '-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          days: Object.keys(tree[year][month])
            .sort((a, b) => (a < b ? 1 : -1))
            .map((day) => ({
              day,
              label: formatDayLabel(day),
              orders: tree[year][month][day].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
            })),
        })),
    }));
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (same(d, today))     return 'Today';
  if (same(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function stats(orders) {
  const total    = orders.length;
  const resolved = orders.filter((o) => o.status === 'resolved' || o.status === 'Resolved' || o.status === 'closed').length;
  const critical = orders.filter((o) => o.priority === 'critical' || o.priority === 'Critical').length;
  const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  return { total, resolved, critical, resolvedRate };
}

function flatOrders(months) {
  return months.flatMap((m) => m.days.flatMap((d) => d.orders));
}

/* ─── Read-only detail panel ─────────────────────────────────────────────── */
function ReadOnlyPanel({ workOrder, onClose }) {
  if (!workOrder) return null;
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }} onClick={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(560px,100vw)', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', zIndex: 40, display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="slide-in-right">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', position: 'sticky', top: 0, zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: '#FF9900', fontWeight: 700 }}>{workOrder.id}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border)' }}>{workOrder.machineType}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>READ ONLY</span>
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{workOrder.issueTitle}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          <PriorityBadge priority={workOrder.priority} size="md" />
          <MachineStateBadge state={workOrder.machineState} size="md" />
          <StatusBadge status={workOrder.status} size="md" />
        </div>

        <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Section title="Work Order Details">
            <InfoRow label="Machine ID">{workOrder.machineId}</InfoRow>
            <InfoRow label="Machine Type">{workOrder.machineType}</InfoRow>
            <InfoRow label="Assigned Tech">{workOrder.assignedTech}</InfoRow>
            <InfoRow label="Priority"><PriorityBadge priority={workOrder.priority} size="sm" /></InfoRow>
            <InfoRow label="Status"><StatusBadge status={workOrder.status} size="sm" /></InfoRow>
            <InfoRow label="Machine State"><MachineStateBadge state={workOrder.machineState} size="sm" /></InfoRow>
            <InfoRow label="Created">{formatDateTime(workOrder.createdAt)}</InfoRow>
            <InfoRow label="Last Updated">{formatDateTime(workOrder.updatedAt)}</InfoRow>
            {workOrder.estimatedResolution && <InfoRow label="Est. Resolution">{formatDateTime(workOrder.estimatedResolution)}</InfoRow>}
          </Section>

          <Section title="Problem Description">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.65, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', margin: 0 }}>
              {workOrder.problemDescription}
            </p>
          </Section>

          {workOrder.errorCodes?.length > 0 && (
            <Section title="Error Codes">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {workOrder.errorCodes.map((code) => (
                  <span key={code} className="font-mono" style={{ padding: '3px 8px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.25)', borderRadius: '4px', fontSize: '0.72rem', color: '#ff8080' }}>{code}</span>
                ))}
              </div>
            </Section>
          )}

          {workOrder.notes?.length > 0 && (
            <Section title={`Activity Timeline (${workOrder.notes.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {workOrder.notes.map((n, i) => (
                  <div key={n.id || i} style={{ padding: '10px 12px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderLeft: '3px solid rgba(255,153,0,0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF9900', display: 'flex', alignItems: 'center', gap: '5px' }}><User size={11} />{n.author}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} />{formatDateTime(n.timestamp)}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{n.note}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '5px 0', borderBottom: '1px solid rgba(42,48,64,0.5)' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', textAlign: 'right' }}>{children}</span>
    </div>
  );
}

/* ─── Stat pills ──────────────────────────────────────────────────────────── */
function Pills({ s }) {
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px', borderRadius: '99px', background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.25)', color: '#FF9900' }}>
        {s.total} WO{s.total !== 1 ? 's' : ''}
      </span>
      {s.resolved > 0 && (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px', borderRadius: '99px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <CheckCircle2 size={9} />{s.resolved} resolved
        </span>
      )}
      {s.critical > 0 && (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px', borderRadius: '99px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <AlertTriangle size={9} />{s.critical} critical
        </span>
      )}
      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '2px' }}>
        {s.resolvedRate}% resolved
      </span>
    </div>
  );
}

/* ─── Day row ─────────────────────────────────────────────────────────────── */
function DayRow({ day, label, orders, onSelect }) {
  const [open, setOpen] = useState(false);
  const s = stats(orders);

  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '6px' }}>
      <button onClick={() => setOpen((v) => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        {open ? <ChevronDown size={13} color="#FF9900" /> : <ChevronRight size={13} color="var(--text-secondary)" />}
        <Calendar size={12} color="#FF9900" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>
          {label}
          <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '7px' }}>{day}</span>
        </span>
        <Pills s={s} />
      </button>

      {open && (
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {orders.map((wo) => (
            <button key={wo.id} onClick={() => onSelect(wo)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', width: '100%', textAlign: 'left', background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,153,0,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#FF9900', fontWeight: 700, minWidth: 76, flexShrink: 0 }}>{wo.id}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', minWidth: 80, flexShrink: 0 }}>{wo.machineId}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{wo.issueTitle}</span>
              <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                <PriorityBadge priority={wo.priority} size="sm" />
                <StatusBadge status={wo.status} size="sm" />
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                {new Date(wo.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Month row ───────────────────────────────────────────────────────────── */
function MonthRow({ month, label, days, onSelect }) {
  const [open, setOpen] = useState(false);
  const allOrders = days.flatMap((d) => d.orders);
  const s = stats(allOrders);

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
      <button onClick={() => setOpen((v) => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 18px', background: open ? 'rgba(129,140,248,0.06)' : 'none', border: 'none', cursor: 'pointer', borderBottom: open ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}>
        {open ? <ChevronDown size={15} color="#818cf8" /> : <ChevronRight size={15} color="var(--text-secondary)" />}
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BarChart2 size={13} color="#818cf8" />
        </div>
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>{label}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginRight: '8px' }}>{days.length} day{days.length !== 1 ? 's' : ''}</span>
        <Pills s={s} />
      </button>

      {open && (
        <div style={{ padding: '10px 14px' }}>
          {/* Month summary bar */}
          <div style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total WOs',   val: s.total,        color: '#FF9900' },
              { label: 'Resolved',    val: s.resolved,     color: '#22c55e' },
              { label: 'Critical',    val: s.critical,     color: '#ef4444' },
              { label: 'Resolve Rate',val: `${s.resolvedRate}%`, color: '#818cf8' },
              { label: 'Active Days', val: days.length,    color: '#06b6d4' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: 'center', flex: '1 1 60px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>

          {days.map(({ day, label, orders }) => (
            <DayRow key={day} day={day} label={label} orders={orders} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Year row ────────────────────────────────────────────────────────────── */
function YearRow({ year, months, onSelect }) {
  const [open, setOpen] = useState(true); // default open for current year
  const allOrders = flatOrders(months);
  const s = stats(allOrders);

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,153,0,0.2)', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
      <button onClick={() => setOpen((v) => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 22px', background: open ? 'rgba(255,153,0,0.05)' : 'none', border: 'none', cursor: 'pointer', borderBottom: open ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}>
        {open ? <ChevronDown size={17} color="#FF9900" /> : <ChevronRight size={17} color="var(--text-secondary)" />}
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,153,0,0.12)', border: '1px solid rgba(255,153,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Archive size={17} color="#FF9900" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FF9900', lineHeight: 1 }}>{year}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{months.length} month{months.length !== 1 ? 's' : ''} on record</div>
        </div>
        <Pills s={s} />
      </button>

      {open && (
        <div style={{ padding: '14px 18px' }}>
          {/* Year summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '10px', marginBottom: '14px' }}>
            {[
              { label: 'Total WOs',    val: s.total,          color: '#FF9900' },
              { label: 'Resolved',     val: s.resolved,       color: '#22c55e' },
              { label: 'Critical',     val: s.critical,       color: '#ef4444' },
              { label: 'Resolve Rate', val: `${s.resolvedRate}%`, color: '#818cf8' },
              { label: 'Months Active',val: months.length,    color: '#06b6d4' },
              { label: 'Total Days',   val: months.reduce((a, m) => a + m.days.length, 0), color: '#f5c518' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'var(--bg-elevated)', border: `1px solid ${color}22`, borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>

          {months.map(({ month, label, days }) => (
            <MonthRow key={month} month={month} label={label} days={days} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────────────────── */
export default function HistoryView({ workOrders }) {
  const [selected, setSelected] = useState(null);
  const tree = useMemo(() => groupHierarchy(workOrders), [workOrders]);
  const total = workOrders.length;
  const resolved = workOrders.filter((w) => w.status === 'resolved' || w.status === 'Resolved' || w.status === 'closed').length;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Work Order History</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Grouped by <strong style={{ color: '#FF9900' }}>Year → Month → Day</strong>. Click any level to expand. Records are <strong style={{ color: '#818cf8' }}>read-only</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FF9900', fontFamily: 'monospace', lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#22c55e', fontFamily: 'monospace', lineHeight: 1 }}>{resolved}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#818cf8', fontFamily: 'monospace', lineHeight: 1 }}>{tree.length}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Years</div>
          </div>
        </div>
      </div>

      {tree.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          No work orders on record yet.
        </div>
      ) : (
        tree.map(({ year, months }) => (
          <YearRow key={year} year={year} months={months} onSelect={setSelected} />
        ))
      )}

      {selected && <ReadOnlyPanel workOrder={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
