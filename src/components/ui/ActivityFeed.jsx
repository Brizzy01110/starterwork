import { useEffect, useRef, useState } from 'react';
import { Radio, Plus, Edit2, CheckCircle2, AlertTriangle, MessageSquare, Trash2, ArrowUp } from 'lucide-react';

const EVENT_ICONS = {
  created:  { icon: Plus,          color: '#22c55e',  label: 'Created' },
  updated:  { icon: Edit2,         color: '#818cf8',  label: 'Updated' },
  resolved: { icon: CheckCircle2,  color: '#22c55e',  label: 'Resolved' },
  critical: { icon: AlertTriangle, color: '#ef4444',  label: 'Critical' },
  note:     { icon: MessageSquare, color: '#FF9900',  label: 'Note Added' },
  deleted:  { icon: Trash2,        color: '#6b7280',  label: 'Deleted' },
  escalated:{ icon: ArrowUp,       color: '#dc2626',  label: 'Escalated' },
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildEvents(workOrders) {
  const events = [];
  workOrders.forEach((wo) => {
    events.push({
      id: `${wo.id}-created`,
      type: 'created',
      woId: wo.id,
      machine: wo.machineId,
      title: wo.issueTitle,
      priority: wo.priority,
      ts: new Date(wo.createdAt).getTime(),
    });
    if (wo.status === 'resolved' || wo.status === 'Resolved') {
      events.push({
        id: `${wo.id}-resolved`,
        type: 'resolved',
        woId: wo.id,
        machine: wo.machineId,
        title: wo.issueTitle,
        ts: new Date(wo.updatedAt || wo.createdAt).getTime(),
      });
    }
    if (wo.priority === 'critical' || wo.priority === 'Critical') {
      events.push({
        id: `${wo.id}-critical`,
        type: 'critical',
        woId: wo.id,
        machine: wo.machineId,
        title: wo.issueTitle,
        ts: new Date(wo.createdAt).getTime() + 1,
      });
    }
    (wo.notes || []).forEach((note, i) => {
      events.push({
        id: `${wo.id}-note-${i}`,
        type: 'note',
        woId: wo.id,
        machine: wo.machineId,
        title: `${note.author || 'Tech'}: "${(note.note || '').substring(0, 40)}${(note.note || '').length > 40 ? '…' : ''}"`,
        ts: new Date(note.timestamp || wo.updatedAt || wo.createdAt).getTime(),
      });
    });
  });
  return events.sort((a, b) => b.ts - a.ts).slice(0, 60);
}

export default function ActivityFeed({ workOrders = [], maxHeight = 420 }) {
  const [events, setEvents] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const prevLen = useRef(0);
  const listRef = useRef(null);

  useEffect(() => {
    const next = buildEvents(workOrders);
    const diff = next.length - prevLen.current;
    if (diff > 0 && prevLen.current > 0) setNewCount((n) => n + diff);
    prevLen.current = next.length;
    setEvents(next);
  }, [workOrders]);

  // Tick timer every 30s to refresh timestamps
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  function scrollToTop() {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setNewCount(0);
  }

  const PRIORITY_COLOR = { critical: '#ef4444', Critical: '#ef4444', high: '#f97316', High: '#f97316', medium: '#FF9900', Medium: '#FF9900', low: '#22c55e', Low: '#22c55e' };

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,153,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={14} color="#FF9900" style={{ animation: 'pulse-radio 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Activity Feed</span>
          <span style={{ padding: '1px 7px', borderRadius: '99px', background: 'rgba(255,153,0,0.15)', border: '1px solid rgba(255,153,0,0.25)', fontSize: '0.65rem', fontWeight: 700, color: '#FF9900' }}>
            {events.length} events
          </span>
        </div>
        {newCount > 0 && (
          <button onClick={scrollToTop}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '99px', background: '#FF9900', border: 'none', color: '#000', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', animation: 'bounce-in 0.3s ease' }}>
            ↑ {newCount} new
          </button>
        )}
      </div>

      {/* Feed */}
      <div ref={listRef} style={{ maxHeight, overflowY: 'auto', scrollBehavior: 'smooth' }}>
        {events.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            No activity yet — work orders will appear here in real time.
          </div>
        ) : (
          events.map((ev, i) => {
            const meta = EVENT_ICONS[ev.type] || EVENT_ICONS.updated;
            const Icon = meta.icon;
            const pColor = ev.priority ? PRIORITY_COLOR[ev.priority] : null;
            return (
              <div key={ev.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '10px 16px',
                borderBottom: i < events.length - 1 ? '1px solid rgba(42,48,64,0.5)' : 'none',
                borderLeft: `3px solid ${meta.color}`,
                transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                {/* Icon bubble */}
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                  background: `${meta.color}18`, border: `1px solid ${meta.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px',
                }}>
                  <Icon size={12} color={meta.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#FF9900', fontWeight: 700 }}>{ev.woId}</span>
                    {ev.machine && <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{ev.machine}</span>}
                    <span style={{ padding: '1px 6px', borderRadius: '3px', background: `${meta.color}18`, color: meta.color, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>{meta.label}</span>
                    {pColor && (
                      <span style={{ padding: '1px 6px', borderRadius: '3px', background: `${pColor}18`, color: pColor, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>{ev.priority}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                </div>

                {/* Timestamp */}
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', flexShrink: 0, marginTop: '3px' }}>
                  {timeAgo(ev.ts)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes pulse-radio { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes bounce-in { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
