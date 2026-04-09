import { useState } from 'react';
import { ClipboardList, Sun, Moon, Sunset, Printer, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const SHIFTS = [
  { id: 'day', label: 'Day Shift', sub: '6:00 AM – 2:30 PM', icon: Sun, color: '#FF9900' },
  { id: 'evening', label: 'Evening Shift', sub: '2:30 PM – 11:00 PM', icon: Sunset, color: '#818cf8' },
  { id: 'night', label: 'Night Shift', sub: '11:00 PM – 6:00 AM', icon: Moon, color: '#06b6d4' },
];

function today() { return new Date().toISOString().split('T')[0]; }

export default function ShiftHandoffView({ workOrders = [] }) {
  const [activeShift, setActiveShift] = useState('day');
  const [date, setDate] = useState(today());
  const [outgoingTech, setOutgoingTech] = useState('');
  const [incomingTech, setIncomingTech] = useState('');
  const [notes, setNotes] = useState('');
  const [priorityAlerts, setPriorityAlerts] = useState('');
  const [safetyNotes, setSafetyNotes] = useState('');
  const [pendingParts, setPendingParts] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedReports, setSavedReports] = useState([]);

  const openWOs = workOrders.filter((wo) => wo.status !== 'resolved' && wo.status !== 'closed');
  const resolvedToday = workOrders.filter((wo) => {
    if (!wo.updatedAt) return false;
    return wo.updatedAt.split('T')[0] === date && (wo.status === 'resolved' || wo.status === 'closed');
  });
  const criticalWOs = openWOs.filter((wo) => wo.priority === 'critical' || wo.priority === 'high');

  function handleSave() {
    const shift = SHIFTS.find((s) => s.id === activeShift);
    setSavedReports((prev) => [{
      id: Date.now(), date, shift: shift.label, outgoingTech, incomingTech,
      notes, priorityAlerts, safetyNotes, pendingParts,
      openCount: openWOs.length, resolvedCount: resolvedToday.length, criticalCount: criticalWOs.length,
      ts: new Date().toLocaleString(),
    }, ...prev]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  const shift = SHIFTS.find((s) => s.id === activeShift);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Shift selector */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {SHIFTS.map(({ id, label, sub, icon: Icon, color }) => (
          <button key={id} onClick={() => setActiveShift(id)}
            style={{
              flex: 1, padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
              background: activeShift === id ? `${color}18` : 'var(--bg-surface)',
              border: `1px solid ${activeShift === id ? color : 'var(--border)'}`,
              boxShadow: activeShift === id ? `0 0 12px ${color}22` : 'none',
              transition: 'all 0.15s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon size={15} color={activeShift === id ? color : 'var(--text-secondary)'} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: activeShift === id ? color : 'var(--text-primary)' }}>{label}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{sub}</div>
          </button>
        ))}
      </div>

      {/* Auto WO summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { label: 'Open WOs', value: openWOs.length, color: '#FF9900', icon: Clock },
          { label: 'Resolved Today', value: resolvedToday.length, color: '#22c55e', icon: CheckCircle2 },
          { label: 'Critical / High', value: criticalWOs.length, color: '#ef4444', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: `1px solid ${color}33`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Handoff form */}
      <div style={{ background: 'var(--bg-surface)', border: `1px solid ${shift.color}44`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `${shift.color}0a` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={15} color={shift.color} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Shift Handoff Report — {shift.label}</span>
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '5px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none' }} />
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Tech names */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Outgoing Technician</label>
              <input value={outgoingTech} onChange={(e) => setOutgoingTech(e.target.value)} placeholder="Name of tech ending shift"
                style={{ width: '100%', padding: '8px 11px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = shift.color; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Incoming Technician</label>
              <input value={incomingTech} onChange={(e) => setIncomingTech(e.target.value)} placeholder="Name of tech starting shift"
                style={{ width: '100%', padding: '8px 11px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = shift.color; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }} />
            </div>
          </div>

          {/* Text areas */}
          {[
            { label: 'Priority Alerts / Escalations', value: priorityAlerts, set: setPriorityAlerts, placeholder: 'List any critical machines, escalated WOs, or issues needing immediate attention…', color: '#ef4444' },
            { label: 'General Shift Notes', value: notes, set: setNotes, placeholder: 'Summary of work completed, ongoing issues, observations…', color: shift.color },
            { label: 'Safety Observations', value: safetyNotes, set: setSafetyNotes, placeholder: 'Any hazards identified, near-misses, or safety actions taken…', color: '#FF9900' },
            { label: 'Pending Parts / Parts Ordered', value: pendingParts, set: setPendingParts, placeholder: 'Parts awaiting arrival, reorder requests submitted…', color: '#818cf8' },
          ].map(({ label, value, set, placeholder, color }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <textarea value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} rows={3}
                style={{ width: '100%', padding: '8px 11px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = color; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }} />
            </div>
          ))}

          {/* Open WO quick list */}
          {openWOs.length > 0 && (
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Open Work Orders (auto-populated)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                {openWOs.map((wo) => {
                  const pColor = { critical: '#dc2626', high: '#ef4444', medium: '#FF9900', low: '#22c55e' }[wo.priority] || '#FF9900';
                  return (
                    <div key={wo.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: '6px', borderLeft: `3px solid ${pColor}` }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#FF9900', fontWeight: 700, flexShrink: 0 }}>{wo.id}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{wo.issueTitle}</span>
                      <span style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem', fontWeight: 700, background: `${pColor}20`, color: pColor, textTransform: 'uppercase', flexShrink: 0 }}>{wo.priority}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{wo.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button onClick={handleSave}
              style={{ flex: 1, padding: '10px', borderRadius: '7px', background: shift.color, border: 'none', color: activeShift === 'day' ? '#000' : '#fff', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'opacity 0.15s' }}>
              <CheckCircle2 size={15} />
              {saved ? 'Report Saved!' : 'Save Handoff Report'}
            </button>
            <button onClick={handlePrint}
              style={{ padding: '10px 16px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={14} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Saved reports history */}
      {savedReports.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Saved Handoff Reports</span>
          </div>
          {savedReports.map((r, i) => (
            <div key={r.id} style={{
              padding: '12px 16px', borderBottom: i < savedReports.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'flex-start', gap: '14px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.date} — {r.shift}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{r.outgoingTech} → {r.incomingTech || '?'}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Saved {r.ts}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem' }}>
                  <span style={{ color: '#FF9900' }}>{r.openCount} open</span>
                  <span style={{ color: '#22c55e' }}>{r.resolvedCount} resolved</span>
                  <span style={{ color: '#ef4444' }}>{r.criticalCount} critical</span>
                </div>
                {r.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>"{r.notes.substring(0, 100)}{r.notes.length > 100 ? '…' : ''}"</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
