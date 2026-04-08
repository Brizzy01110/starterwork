import { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, ShieldCheck, FileText, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

/* ─── Static safety content ─────────────────────────────────────────────── */

const LOTO_STEPS = [
  { step: 1, action: 'Notify affected employees that equipment will be shut down.' },
  { step: 2, action: 'Identify all energy sources (electrical, pneumatic, hydraulic, gravity).' },
  { step: 3, action: 'Shut down equipment using normal stopping procedure.' },
  { step: 4, action: 'Isolate all energy sources using the designated energy-isolating device(s).' },
  { step: 5, action: 'Apply personal lock(s) and tag(s) to each energy-isolating device.' },
  { step: 6, action: 'Release or restrain all stored energy (bleed pneumatics, block gravity loads, discharge capacitors).' },
  { step: 7, action: 'Verify zero energy state — attempt to start equipment and test with a meter.' },
  { step: 8, action: 'Perform maintenance or service work.' },
  { step: 9, action: 'Remove tools and materials, replace guards.' },
  { step: 10, action: 'Remove lock(s) and tag(s) only after work is complete and area is clear.' },
  { step: 11, action: 'Notify affected employees that equipment is being re-energized.' },
  { step: 12, action: 'Re-energize and verify normal operation.' },
];

const PM_CHECKLIST = [
  { id: 'pm1', area: 'Conveyor', item: 'Inspect belt tension and tracking — adjust if outside ±5% spec.' },
  { id: 'pm2', area: 'Conveyor', item: 'Lubricate roller bearings per OEM schedule.' },
  { id: 'pm3', area: 'Conveyor', item: 'Check drive sprocket and chain for wear — replace if >3% elongation.' },
  { id: 'pm4', area: 'Electrical', item: 'Inspect all motor terminal connections — torque to spec, check for corrosion.' },
  { id: 'pm5', area: 'Electrical', item: 'Test ground continuity on all motor frames.' },
  { id: 'pm6', area: 'Electrical', item: 'Verify overload relay settings match motor nameplate FLA.' },
  { id: 'pm7', area: 'Sorter', item: 'Clean and verify all photo-eye sensors — check alignment and response time.' },
  { id: 'pm8', area: 'Sorter', item: 'Inspect divert arms for wear, cracks, or loose fasteners.' },
  { id: 'pm9', area: 'Robotic Arm', item: 'Run full homing sequence and verify all waypoints within tolerance.' },
  { id: 'pm10', area: 'Robotic Arm', item: 'Inspect joint covers and cable management for wear or pinching.' },
  { id: 'pm11', area: 'General', item: 'Inspect all E-stop buttons — test function, verify proper illumination.' },
  { id: 'pm12', area: 'General', item: 'Walk the line for loose guards, exposed wiring, or slip/trip hazards.' },
  { id: 'pm13', area: 'General', item: 'Verify fire extinguisher access is unobstructed in the work area.' },
];

const INCIDENT_TYPES = [
  'Near Miss',
  'First Aid',
  'Recordable Injury',
  'Equipment Damage',
  'Fire / Smoke',
  'Chemical Spill',
  'Electrical Hazard',
  'Struck-By',
  'Caught-In / Between',
  'Fall / Slip / Trip',
  'Other',
];

const PREVENTABLE_CATEGORIES = [
  { id: 'pc1', category: 'Lack of LOTO', description: 'Employee worked on energized equipment without proper lockout/tagout procedure.' },
  { id: 'pc2', category: 'Bypassed Guard', description: 'Machine guard was removed or defeated and not reinstalled prior to operation.' },
  { id: 'pc3', category: 'Improper PPE', description: 'Correct PPE was available but not worn during the task.' },
  { id: 'pc4', category: 'Skipped PM', description: 'Scheduled preventive maintenance was deferred and contributed to the incident.' },
  { id: 'pc5', category: 'Procedure Not Followed', description: 'Written SOP or work instruction existed but was not followed.' },
  { id: 'pc6', category: 'Housekeeping', description: 'Clutter, spill, or debris in the work area contributed to the incident.' },
  { id: 'pc7', category: 'Improper Tool Use', description: 'Incorrect or damaged tool used for the task.' },
  { id: 'pc8', category: 'Unauthorized Repair', description: 'Repair attempted by untrained or uncertified personnel.' },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SectionCard({ title, icon: Icon, color = '#FF9900', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '10px', overflow: 'hidden', marginBottom: '18px',
    }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 18px', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon size={16} color={color} />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        {open ? <ChevronUp size={15} color="var(--text-secondary)" /> : <ChevronDown size={15} color="var(--text-secondary)" />}
      </button>
      {open && <div style={{ padding: '16px 18px' }}>{children}</div>}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 110, padding: '14px 16px', borderRadius: '8px',
      background: `${color}10`, border: `1px solid ${color}30`,
      display: 'flex', flexDirection: 'column', gap: '4px',
    }}>
      <span style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

/* ─── LOTO Section ───────────────────────────────────────────────────────── */
function LOTOSection() {
  const [checked, setChecked] = useState({});
  const toggle = (i) => setChecked((p) => ({ ...p, [i]: !p[i] }));
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, maxWidth: 600 }}>
          Follow all 12 steps before performing any maintenance. OSHA 29 CFR 1910.147 — Control of Hazardous Energy.
        </p>
        <span style={{
          fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: '99px',
          background: doneCount === LOTO_STEPS.length ? 'rgba(34,197,94,0.15)' : 'rgba(255,153,0,0.1)',
          border: `1px solid ${doneCount === LOTO_STEPS.length ? 'rgba(34,197,94,0.4)' : 'rgba(255,153,0,0.3)'}`,
          color: doneCount === LOTO_STEPS.length ? '#22c55e' : '#FF9900',
          whiteSpace: 'nowrap',
        }}>
          {doneCount} / {LOTO_STEPS.length} complete
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {LOTO_STEPS.map(({ step, action }) => {
          const done = !!checked[step];
          return (
            <label key={step} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '10px 14px', borderRadius: '7px', cursor: 'pointer',
              background: done ? 'rgba(34,197,94,0.05)' : 'var(--bg-elevated)',
              border: `1px solid ${done ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
              <input type="checkbox" checked={done} onChange={() => toggle(step)}
                style={{ marginTop: '2px', accentColor: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#FF9900', minWidth: 18, fontFamily: 'monospace' }}>
                {String(step).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.8rem', color: done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                {action}
              </span>
            </label>
          );
        })}
      </div>

      {doneCount === LOTO_STEPS.length && (
        <div style={{
          marginTop: '14px', padding: '12px 16px', borderRadius: '8px',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <CheckCircle size={16} color="#22c55e" />
          <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>
            LOTO procedure complete — safe to perform maintenance.
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── PM Checklist ───────────────────────────────────────────────────────── */
function PMSection() {
  const [checked, setChecked] = useState({});
  const [filter, setFilter] = useState('All');
  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const areas = ['All', ...new Set(PM_CHECKLIST.map((i) => i.area))];
  const visible = filter === 'All' ? PM_CHECKLIST : PM_CHECKLIST.filter((i) => i.area === filter);
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {areas.map((a) => (
            <button key={a} onClick={() => setFilter(a)} style={{
              padding: '4px 12px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
              border: filter === a ? '1px solid rgba(255,153,0,0.5)' : '1px solid var(--border)',
              background: filter === a ? 'rgba(255,153,0,0.12)' : 'var(--bg-elevated)',
              color: filter === a ? '#FF9900' : 'var(--text-secondary)', cursor: 'pointer',
            }}>{a}</button>
          ))}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {doneCount} / {PM_CHECKLIST.length} items checked
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {visible.map(({ id, area, item }) => {
          const done = !!checked[id];
          return (
            <label key={id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '9px 14px', borderRadius: '7px', cursor: 'pointer',
              background: done ? 'rgba(34,197,94,0.05)' : 'var(--bg-elevated)',
              border: `1px solid ${done ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
            }}>
              <input type="checkbox" checked={done} onChange={() => toggle(id)}
                style={{ marginTop: '2px', accentColor: '#22c55e', flexShrink: 0 }} />
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '1px 7px', borderRadius: '4px',
                background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.2)',
                color: '#FF9900', flexShrink: 0, alignSelf: 'center',
              }}>{area}</span>
              <span style={{ fontSize: '0.8rem', color: done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                {item}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Preventable Categories ─────────────────────────────────────────────── */
function PreventableSection() {
  return (
    <div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
        These are the leading preventable causes of MT incidents. Each one is avoidable with proper procedure and accountability.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
        {PREVENTABLE_CATEGORIES.map(({ id, category, description }) => (
          <div key={id} style={{
            padding: '12px 14px', borderRadius: '8px',
            background: 'var(--bg-elevated)', border: '1px solid rgba(239,68,68,0.2)',
            borderLeft: '3px solid #ef4444',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
              <AlertTriangle size={13} color="#ef4444" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{category}</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Incident Log ───────────────────────────────────────────────────────── */
function IncidentLogSection() {
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({ date: '', type: '', location: '', description: '', preventable: 'Yes' });
  const [adding, setAdding] = useState(false);

  const inputStyle = {
    padding: '7px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border)',
    borderRadius: '5px', color: 'var(--text-primary)', fontSize: '0.8rem',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  function submit() {
    if (!form.date || !form.type || !form.description) return;
    setIncidents((p) => [{ ...form, id: Date.now() }, ...p]);
    setForm({ date: '', type: '', location: '', description: '', preventable: 'Yes' });
    setAdding(false);
  }

  function remove(id) {
    setIncidents((p) => p.filter((i) => i.id !== id));
  }

  const preventableCount = incidents.filter((i) => i.preventable === 'Yes').length;

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <StatPill label="Total Incidents" value={incidents.length} color="#FF9900" />
        <StatPill label="Preventable" value={preventableCount} color="#ef4444" />
        <StatPill label="Non-Preventable" value={incidents.length - preventableCount} color="#6366f1" />
      </div>

      {/* Add button */}
      {!adding && (
        <button onClick={() => setAdding(true)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', background: 'rgba(255,153,0,0.1)',
          border: '1px solid rgba(255,153,0,0.3)', borderRadius: '6px',
          color: '#FF9900', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
          marginBottom: '14px',
        }}>
          <Plus size={13} /> Log Incident
        </button>
      )}

      {/* Form */}
      {adding && (
        <div style={{
          padding: '14px', borderRadius: '8px', background: 'var(--bg-elevated)',
          border: '1px solid var(--border)', marginBottom: '16px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Date *</label>
              <input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Incident Type *</label>
              <select style={inputStyle} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="">— Select type —</option>
                {INCIDENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Location / Area</label>
              <input style={inputStyle} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Inbound — Belt 4" />
            </div>
            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Preventable?</label>
              <select style={inputStyle} value={form.preventable} onChange={(e) => setForm((f) => ({ ...f, preventable: e.target.value }))}>
                <option>Yes</option>
                <option>No</option>
                <option>Under Review</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description *</label>
            <textarea style={{ ...inputStyle, height: '70px', resize: 'vertical' }}
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe what happened, root cause, and corrective action taken..." />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={submit} style={{
              padding: '7px 16px', background: '#FF9900', border: 'none',
              borderRadius: '5px', color: '#000', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
            }}>Save Incident</button>
            <button onClick={() => setAdding(false)} style={{
              padding: '7px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '5px', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Incident list */}
      {incidents.length === 0 && !adding && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontStyle: 'italic' }}>
          No incidents logged. Click "Log Incident" to add one.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {incidents.map((inc) => (
          <div key={inc.id} style={{
            padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-elevated)',
            border: `1px solid ${inc.preventable === 'Yes' ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
            borderLeft: `3px solid ${inc.preventable === 'Yes' ? '#ef4444' : inc.preventable === 'No' ? '#6366f1' : '#f59e0b'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inc.type}</span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '1px 8px', borderRadius: '99px',
                  background: inc.preventable === 'Yes' ? 'rgba(239,68,68,0.1)' : inc.preventable === 'No' ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
                  border: `1px solid ${inc.preventable === 'Yes' ? 'rgba(239,68,68,0.3)' : inc.preventable === 'No' ? 'rgba(99,102,241,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  color: inc.preventable === 'Yes' ? '#ef4444' : inc.preventable === 'No' ? '#818cf8' : '#f59e0b',
                }}>{inc.preventable === 'Yes' ? 'Preventable' : inc.preventable === 'No' ? 'Non-Preventable' : 'Under Review'}</span>
                {inc.location && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{inc.location}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} />{inc.date}
                </span>
                <button onClick={() => remove(inc.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', padding: 0, display: 'flex',
                }}>
                  <X size={13} />
                </button>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{inc.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main view ──────────────────────────────────────────────────────────── */
export default function SafetyView() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Safety / Preventable MT
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 700, margin: 0 }}>
          LOTO procedures, preventive maintenance checklists, incident logging, and preventable cause tracking for maintenance technicians.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
          {[
            { label: 'OSHA 29 CFR 1910.147 — LOTO', color: '#FF9900' },
            { label: 'NFPA 70E — Electrical Safety', color: '#ef4444' },
            { label: 'Zero Incident Goal', color: '#22c55e' },
          ].map(({ label, color }) => (
            <span key={label} style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '99px',
              border: `1px solid ${color}33`, background: `${color}15`, color,
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <SectionCard title="Lockout / Tagout (LOTO) Procedure" icon={ShieldCheck} color="#FF9900" defaultOpen={true}>
        <LOTOSection />
      </SectionCard>

      <SectionCard title="Preventive Maintenance Checklist" icon={CheckCircle} color="#22c55e" defaultOpen={false}>
        <PMSection />
      </SectionCard>

      <SectionCard title="Preventable Incident Categories" icon={AlertTriangle} color="#ef4444" defaultOpen={false}>
        <PreventableSection />
      </SectionCard>

      <SectionCard title="Incident Log" icon={FileText} color="#6366f1" defaultOpen={false}>
        <IncidentLogSection />
      </SectionCard>
    </div>
  );
}
