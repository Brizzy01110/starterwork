import { useState } from 'react';
import { Wrench, Plus, CheckCircle2, AlertTriangle, Clock, Calendar, Filter } from 'lucide-react';

const AREAS = ['All', 'Induct', 'Pack', 'Ship', 'Conveyor', 'Robotics', 'MEWP', 'Electrical'];
const FREQ_OPTIONS = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly'];
const MACHINE_TYPES = ['MDR', 'ACIM', 'Pancake Motor', 'BLDC', 'Servo', 'Conveyor Belt', 'Scanner', 'Palletizer', 'Forklift', 'Scissor Lift', 'Other'];

const INITIAL_TASKS = [
  { id: 'pm-001', machine: 'MDR-07', area: 'Induct', task: 'Inspect roller bearings and belt tension', freq: 'Weekly', lastDone: '2026-04-01', tech: 'J. Smith', priority: 'high' },
  { id: 'pm-002', machine: 'ACIM-12', area: 'Pack', task: 'Check motor insulation resistance', freq: 'Monthly', lastDone: '2026-03-15', tech: 'M. Torres', priority: 'medium' },
  { id: 'pm-003', machine: 'BELT-03', area: 'Conveyor', task: 'Lubricate drive shaft and inspect belt wear', freq: 'Bi-Weekly', lastDone: '2026-03-28', tech: 'R. Davis', priority: 'high' },
  { id: 'pm-004', machine: 'SCAN-02', area: 'Induct', task: 'Clean scanner lens, calibrate barcode reader', freq: 'Daily', lastDone: '2026-04-08', tech: 'K. Patel', priority: 'low' },
  { id: 'pm-005', machine: 'SERVO-01', area: 'Robotics', task: 'Verify servo drive parameters, check cable routing', freq: 'Monthly', lastDone: '2026-02-20', tech: 'J. Smith', priority: 'critical' },
];

function getNextDue(lastDone, freq) {
  const d = new Date(lastDone);
  const map = { Daily: 1, Weekly: 7, 'Bi-Weekly': 14, Monthly: 30, Quarterly: 90 };
  d.setDate(d.getDate() + (map[freq] || 7));
  return d;
}

function daysUntil(date) {
  return Math.round((date - new Date()) / 86400000);
}

function statusOf(task) {
  const days = daysUntil(getNextDue(task.lastDone, task.freq));
  if (days < 0) return 'overdue';
  if (days <= 2) return 'due-soon';
  return 'ok';
}

const STATUS_COLOR = { overdue: '#ef4444', 'due-soon': '#FF9900', ok: '#22c55e' };
const STATUS_LABEL = { overdue: 'OVERDUE', 'due-soon': 'DUE SOON', ok: 'OK' };
const PRIORITY_COLOR = { critical: '#dc2626', high: '#ef4444', medium: '#FF9900', low: '#22c55e' };

export default function PMSchedulerView() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [areaFilter, setAreaFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ machine: '', area: 'Induct', task: '', freq: 'Weekly', lastDone: new Date().toISOString().split('T')[0], tech: '', priority: 'medium' });

  function markDone(id) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, lastDone: new Date().toISOString().split('T')[0] } : t));
  }

  function addTask(e) {
    e.preventDefault();
    setTasks((prev) => [{ ...form, id: `pm-${Date.now()}` }, ...prev]);
    setForm({ machine: '', area: 'Induct', task: '', freq: 'Weekly', lastDone: new Date().toISOString().split('T')[0], tech: '', priority: 'medium' });
    setShowForm(false);
  }

  const filtered = tasks.filter((t) => {
    const areaOk = areaFilter === 'All' || t.area === areaFilter;
    const st = statusOf(t);
    const statusOk = statusFilter === 'All' || st === statusFilter;
    return areaOk && statusOk;
  });

  const overdue = tasks.filter((t) => statusOf(t) === 'overdue').length;
  const dueSoon = tasks.filter((t) => statusOf(t) === 'due-soon').length;
  const ok = tasks.filter((t) => statusOf(t) === 'ok').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* KPI bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { label: 'Overdue', value: overdue, color: '#ef4444' },
          { label: 'Due Soon', value: dueSoon, color: '#FF9900' },
          { label: 'On Track', value: ok, color: '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: `1px solid ${color}33`, borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color, fontFamily: 'monospace' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters + add */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Filter size={13} color="var(--text-secondary)" />
        {AREAS.map((a) => (
          <button key={a} onClick={() => setAreaFilter(a)}
            style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
              background: areaFilter === a ? '#818cf8' : 'var(--bg-elevated)',
              borderColor: areaFilter === a ? '#818cf8' : 'var(--border)',
              color: areaFilter === a ? '#fff' : 'var(--text-secondary)',
            }}>
            {a}
          </button>
        ))}
        <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }} />
        {['All', 'overdue', 'due-soon', 'ok'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
              background: statusFilter === s ? (STATUS_COLOR[s] || '#818cf8') : 'var(--bg-elevated)',
              borderColor: statusFilter === s ? (STATUS_COLOR[s] || '#818cf8') : 'var(--border)',
              color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
            }}>
            {s === 'All' ? 'All Status' : STATUS_LABEL[s]}
          </button>
        ))}
        <button onClick={() => setShowForm((v) => !v)}
          style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '6px', background: '#818cf8', border: 'none', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Plus size={13} /> Add PM Task
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addTask} style={{ background: 'var(--bg-surface)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: '10px', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            { key: 'machine', label: 'Machine ID', placeholder: 'e.g. MDR-07', type: 'text' },
            { key: 'tech', label: 'Assigned Tech', placeholder: 'Full name', type: 'text' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key} style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label} *</label>
              <input required type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
            </div>
          ))}
          <div style={{ flex: '2 1 260px' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>PM Task Description *</label>
            <input required value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} placeholder="Describe the preventive maintenance task"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
          </div>
          {[
            { key: 'area', label: 'Area', options: AREAS.filter((a) => a !== 'All') },
            { key: 'freq', label: 'Frequency', options: FREQ_OPTIONS },
            { key: 'priority', label: 'Priority', options: ['low', 'medium', 'high', 'critical'] },
          ].map(({ key, label, options }) => (
            <div key={key} style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Completed</label>
            <input type="date" value={form.lastDone} onChange={(e) => setForm({ ...form, lastDone: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <button type="submit" style={{ padding: '7px 16px', borderRadius: '6px', background: '#818cf8', border: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Save Task</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '7px 12px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Task list */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={15} color="#818cf8" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>PM Schedule — {filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>No tasks match filters.</div>
        ) : (
          filtered.map((t, i) => {
            const st = statusOf(t);
            const stColor = STATUS_COLOR[st];
            const nextDue = getNextDue(t.lastDone, t.freq);
            const days = daysUntil(nextDue);
            const pColor = PRIORITY_COLOR[t.priority] || '#FF9900';
            return (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                borderLeft: `3px solid ${stColor}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.machine}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{t.area}</span>
                    <span style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem', fontWeight: 700, background: `${pColor}20`, color: pColor, textTransform: 'uppercase' }}>{t.priority}</span>
                    <span style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem', fontWeight: 700, background: `${stColor}20`, color: stColor }}>{STATUS_LABEL[st]}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginBottom: '3px' }}>{t.task}</div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    <span><Calendar size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />Every {t.freq}</span>
                    <span><Clock size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />Last: {t.lastDone}</span>
                    <span style={{ color: stColor, fontWeight: 600 }}>Next: {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `in ${days}d`}</span>
                    <span>Tech: {t.tech || '—'}</span>
                  </div>
                </div>
                <button onClick={() => markDone(t.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                  <CheckCircle2 size={13} />
                  Mark Done
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
