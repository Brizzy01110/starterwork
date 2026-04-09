import { useState, useEffect } from 'react';
import { DollarSign, Clock, TrendingUp, AlertTriangle, CheckCircle2, Play, Pause } from 'lucide-react';

const PRODUCTION_RATE = 120; // dollars per minute default

function CostClock({ startedAt, ratePerMin }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = (now - startedAt) / 60000;
  return Math.round(mins * ratePerMin);
}

function fmt(mins) {
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}

function fmtDollars(n) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
}

function LiveCost({ startedAt, ratePerMin }) {
  const [cost, setCost] = useState(0);
  useEffect(() => {
    function tick() {
      const mins = (Date.now() - startedAt) / 60000;
      setCost(Math.round(mins * ratePerMin));
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startedAt, ratePerMin]);
  return <span>{fmtDollars(cost)}</span>;
}

function LiveDuration({ startedAt }) {
  const [dur, setDur] = useState('');
  useEffect(() => {
    function tick() {
      const mins = (Date.now() - startedAt) / 60000;
      setDur(fmt(mins));
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  return <span>{dur}</span>;
}

export default function DowntimeView({ workOrders = [] }) {
  const [rate, setRate] = useState(PRODUCTION_RATE);
  const [editRate, setEditRate] = useState(false);
  const [rateInput, setRateInput] = useState(String(PRODUCTION_RATE));
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({ machine: '', area: '', cause: '', severity: 'medium' });
  const [showForm, setShowForm] = useState(false);

  // Live open WOs = downtime candidates
  const openWOs = workOrders.filter((wo) => wo.status !== 'resolved' && wo.status !== 'closed');

  const totalLostMins = openWOs.reduce((acc, wo) => {
    const mins = (Date.now() - new Date(wo.createdAt).getTime()) / 60000;
    return acc + mins;
  }, 0);
  const totalLostCost = Math.round(totalLostMins * rate);

  function addIncident(e) {
    e.preventDefault();
    setIncidents((prev) => [
      {
        id: Date.now(),
        ...form,
        startedAt: Date.now(),
        resolved: false,
      },
      ...prev,
    ]);
    setForm({ machine: '', area: '', cause: '', severity: 'medium' });
    setShowForm(false);
  }

  function resolveIncident(id) {
    setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, resolved: true, resolvedAt: Date.now() } : i));
  }

  const SEVERITY_COLOR = { low: '#22c55e', medium: '#FF9900', high: '#ef4444', critical: '#dc2626' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {/* Total live cost */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', padding: '16px',
          boxShadow: '0 0 16px rgba(239,68,68,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DollarSign size={15} color="#ef4444" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Estimated Loss (Live)</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>
            {fmtDollars(totalLostCost)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {openWOs.length} open WO{openWOs.length !== 1 ? 's' : ''} active
          </div>
        </div>

        {/* Total downtime */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={15} color="#FF9900" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Total Downtime</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FF9900', fontFamily: 'monospace' }}>
            {fmt(totalLostMins)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>across all open WOs</div>
        </div>

        {/* Rate setting */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={15} color="#818cf8" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Production Rate</span>
          </div>
          {editRate ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="number"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                style={{
                  width: '80px', padding: '4px 8px', borderRadius: '5px',
                  background: 'var(--bg-elevated)', border: '1px solid #818cf8',
                  color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/min</span>
              <button onClick={() => { setRate(Number(rateInput) || 120); setEditRate(false); }}
                style={{ padding: '4px 8px', borderRadius: '5px', background: '#818cf8', border: 'none', color: '#fff', fontSize: '0.72rem', cursor: 'pointer' }}>
                Save
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#818cf8', fontFamily: 'monospace' }}>${rate}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/min</span>
              <button onClick={() => setEditRate(true)}
                style={{ marginLeft: '4px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', color: '#818cf8', fontSize: '0.65rem', cursor: 'pointer' }}>
                Edit
              </button>
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>revenue per minute lost</div>
        </div>
      </div>

      {/* Live WO cost clocks */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} color="#FF9900" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Work Order Cost Clock</span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Updates every second</span>
        </div>
        {openWOs.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            No open work orders — all clear!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {openWOs.map((wo, i) => {
              const startedAt = new Date(wo.createdAt).getTime();
              const priority = wo.priority || 'medium';
              const border = { critical: '#ef4444', high: '#f97316', medium: '#FF9900', low: '#22c55e' }[priority] || '#FF9900';
              return (
                <div key={wo.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: i < openWOs.length - 1 ? '1px solid var(--border)' : 'none',
                  borderLeft: `3px solid ${border}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#FF9900', fontWeight: 700 }}>{wo.id}</span>
                      <span style={{
                        padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem', fontWeight: 700,
                        background: `${border}20`, color: border, textTransform: 'uppercase',
                      }}>{priority}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {wo.issueTitle || wo.machine}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {wo.machineId} — {wo.area || wo.location || '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Duration</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: '#FF9900' }}>
                        <LiveDuration startedAt={startedAt} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Est. Loss</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 900, color: '#ef4444' }}>
                        <LiveCost startedAt={startedAt} ratePerMin={rate} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual downtime incidents */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pause size={15} color="#ef4444" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Downtime Incidents</span>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              padding: '5px 12px', borderRadius: '6px',
              background: '#ef4444', border: 'none',
              color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Log Incident
          </button>
        </div>

        {showForm && (
          <form onSubmit={addIncident} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '10px', background: 'rgba(239,68,68,0.04)' }}>
            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Machine ID *</label>
              <input required value={form.machine} onChange={(e) => setForm({ ...form, machine: e.target.value })}
                placeholder="e.g. MDR-07"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Area *</label>
              <input required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="e.g. Induct, Pack"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
            </div>
            <div style={{ flex: '2 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Root Cause</label>
              <input value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })}
                placeholder="e.g. Belt jam, power failure"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Severity</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={{ padding: '7px 16px', borderRadius: '6px', background: '#ef4444', border: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                Start Clock
              </button>
            </div>
          </form>
        )}

        {incidents.length === 0 && !showForm ? (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            No downtime incidents logged yet.
          </div>
        ) : (
          <div>
            {incidents.map((inc, i) => {
              const color = SEVERITY_COLOR[inc.severity] || '#FF9900';
              const resolvedMins = inc.resolved ? (inc.resolvedAt - inc.startedAt) / 60000 : null;
              return (
                <div key={inc.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                  padding: '12px 16px',
                  borderBottom: i < incidents.length - 1 ? '1px solid var(--border)' : 'none',
                  borderLeft: `3px solid ${color}`,
                  opacity: inc.resolved ? 0.6 : 1,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inc.machine}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{inc.area}</span>
                      <span style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem', fontWeight: 700, background: `${color}20`, color, textTransform: 'uppercase' }}>{inc.severity}</span>
                      {inc.resolved && <span style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem', fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>RESOLVED</span>}
                    </div>
                    {inc.cause && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inc.cause}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Downtime</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700, color: '#FF9900' }}>
                        {inc.resolved ? fmt(resolvedMins) : <LiveDuration startedAt={inc.startedAt} />}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Est. Loss</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 900, color: '#ef4444' }}>
                        {inc.resolved ? fmtDollars(Math.round(resolvedMins * rate)) : <LiveCost startedAt={inc.startedAt} ratePerMin={rate} />}
                      </div>
                    </div>
                    {!inc.resolved && (
                      <button onClick={() => resolveIncident(inc.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                        <CheckCircle2 size={12} />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
