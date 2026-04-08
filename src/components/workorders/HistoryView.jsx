import { useState } from 'react';
import { ChevronDown, ChevronRight, X, Calendar, Clock, User, Tag, AlertTriangle } from 'lucide-react';
import PriorityBadge from '../ui/PriorityBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import MachineStateBadge from '../ui/MachineStateBadge.jsx';
import { formatDateTime } from '../../utils/formatters.js';

/* ─── group work orders by calendar date ────────────────────────────────── */
function groupByDay(workOrders) {
  const map = {};
  workOrders.forEach((wo) => {
    const d = new Date(wo.createdAt);
    // "2026-04-07"
    const key = d.toISOString().slice(0, 10);
    if (!map[key]) map[key] = [];
    map[key].push(wo);
  });
  // Sort days descending (newest first)
  return Object.entries(map)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, orders]) => ({
      date,
      label: formatDayLabel(date),
      orders: orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    }));
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── Read-only detail panel ─────────────────────────────────────────────── */
function ReadOnlyPanel({ workOrder, onClose }) {
  if (!workOrder) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(560px, 100vw)',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 40, display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}
        className="slide-in-right"
        role="region"
        aria-label="Work order history detail"
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '12px', padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          position: 'sticky', top: 0, zIndex: 1,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: '#FF9900', fontWeight: 700 }}>{workOrder.id}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                {workOrder.machineType}
              </span>
              {/* Read-only badge */}
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8',
              }}>
                READ ONLY
              </span>
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {workOrder.issueTitle}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          <PriorityBadge priority={workOrder.priority} size="md" />
          <MachineStateBadge state={workOrder.machineState} size="md" />
          <StatusBadge status={workOrder.status} size="md" />
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Details */}
          <Section title="Work Order Details">
            <InfoRow label="Machine ID">{workOrder.machineId}</InfoRow>
            <InfoRow label="Machine Type">{workOrder.machineType}</InfoRow>
            <InfoRow label="Assigned Tech">{workOrder.assignedTech}</InfoRow>
            <InfoRow label="Priority"><PriorityBadge priority={workOrder.priority} size="sm" /></InfoRow>
            <InfoRow label="Status"><StatusBadge status={workOrder.status} size="sm" /></InfoRow>
            <InfoRow label="Machine State"><MachineStateBadge state={workOrder.machineState} size="sm" /></InfoRow>
            <InfoRow label="Created">{formatDateTime(workOrder.createdAt)}</InfoRow>
            <InfoRow label="Last Updated">{formatDateTime(workOrder.updatedAt)}</InfoRow>
            {workOrder.estimatedResolution && (
              <InfoRow label="Est. Resolution">{formatDateTime(workOrder.estimatedResolution)}</InfoRow>
            )}
          </Section>

          {/* Problem */}
          <Section title="Problem Description">
            <p style={{
              fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.65,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '12px', margin: 0,
            }}>
              {workOrder.problemDescription}
            </p>
          </Section>

          {/* Error codes */}
          {workOrder.errorCodes?.length > 0 && (
            <Section title="Error Codes">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {workOrder.errorCodes.map((code) => (
                  <span key={code} className="font-mono" style={{
                    padding: '3px 8px', background: 'rgba(255,59,59,0.1)',
                    border: '1px solid rgba(255,59,59,0.25)', borderRadius: '4px',
                    fontSize: '0.72rem', color: '#ff8080',
                  }}>{code}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Notes timeline (read-only) */}
          {workOrder.notes?.length > 0 && (
            <Section title={`Activity Timeline (${workOrder.notes.length} note${workOrder.notes.length !== 1 ? 's' : ''})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {workOrder.notes.map((n, i) => (
                  <div key={n.id || i} style={{
                    padding: '10px 12px', borderRadius: '7px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderLeft: '3px solid rgba(255,153,0,0.4)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF9900', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={11} />{n.author}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} />{formatDateTime(n.timestamp)}
                      </span>
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
      <h3 style={{
        fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--border)',
      }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: '12px', padding: '5px 0', borderBottom: '1px solid rgba(42,48,64,0.5)',
    }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', textAlign: 'right' }}>{children}</span>
    </div>
  );
}

/* ─── Day row ────────────────────────────────────────────────────────────── */
function DayRow({ date, label, orders, onSelect }) {
  const [open, setOpen] = useState(false);

  const resolved = orders.filter((o) => o.status === 'Resolved').length;
  const critical = orders.filter((o) => o.priority === 'Critical').length;

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '10px', overflow: 'hidden', marginBottom: '10px',
    }}>
      {/* Day header — clickable to expand */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: '12px', padding: '13px 18px',
          background: open ? 'var(--bg-elevated)' : 'none',
          border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        {open
          ? <ChevronDown size={15} color="#FF9900" />
          : <ChevronRight size={15} color="var(--text-secondary)" />
        }

        <Calendar size={14} color="#FF9900" />

        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>
          {label}
          <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '8px' }}>
            {date}
          </span>
        </span>

        {/* Pill counts */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px',
            background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.25)', color: '#FF9900',
          }}>
            {orders.length} WO{orders.length !== 1 ? 's' : ''}
          </span>
          {resolved > 0 && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e',
            }}>
              {resolved} resolved
            </span>
          )}
          {critical > 0 && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <AlertTriangle size={10} />{critical} critical
            </span>
          )}
        </div>
      </button>

      {/* Expanded work order list */}
      {open && (
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {orders.map((wo) => (
            <button
              key={wo.id}
              onClick={() => onSelect(wo)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '7px', width: '100%', textAlign: 'left',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,153,0,0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* WO ID */}
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#FF9900', fontWeight: 700, minWidth: 80, flexShrink: 0 }}>
                {wo.id}
              </span>

              {/* Machine */}
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', minWidth: 90, flexShrink: 0 }}>
                {wo.machineId}
              </span>

              {/* Issue title */}
              <span style={{
                fontSize: '0.8rem', color: 'var(--text-primary)', flex: 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {wo.issueTitle}
              </span>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                <PriorityBadge priority={wo.priority} size="sm" />
                <StatusBadge status={wo.status} size="sm" />
              </div>

              {/* Tech + time */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: 90 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <User size={10} />{wo.assignedTech?.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={10} />
                  {new Date(wo.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export default function HistoryView({ workOrders }) {
  const [selected, setSelected] = useState(null);
  const days = groupByDay(workOrders);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Work Order History
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          All work orders grouped by day. Click a day to expand, then click any work order to view its details.
          Records are <strong style={{ color: '#818cf8' }}>read-only</strong> — no edits or deletions from this view.
        </p>
      </div>

      {days.length === 0 && (
        <div style={{
          padding: '48px', textAlign: 'center',
          background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px',
          color: 'var(--text-secondary)', fontSize: '0.85rem',
        }}>
          No work orders on record yet.
        </div>
      )}

      {days.map(({ date, label, orders }) => (
        <DayRow key={date} date={date} label={label} orders={orders} onSelect={setSelected} />
      ))}

      {selected && <ReadOnlyPanel workOrder={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
