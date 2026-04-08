import { useState, useMemo } from 'react';
import { Plus, X, Clock, User, MapPin, AlertTriangle, Droplets, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const SEVERITY_OPTIONS = ['Minor', 'Moderate', 'Serious', 'Critical'];
const SHIFT_OPTIONS    = ['Day', 'Evening', 'Night', 'Weekend'];
const STATUS_OPTIONS   = ['Open', 'Under Review', 'Closed'];

const SPILL_TYPES = [
  'Oil / Lubricant',
  'Hydraulic Fluid',
  'Coolant / Water',
  'Chemical / Solvent',
  'Fuel',
  'Ink / Dye',
  'Other Liquid',
];

const TRIP_TYPES = [
  'Loose Cable / Cord',
  'Pallet / Material on Floor',
  'Wet / Slippery Surface',
  'Uneven Flooring',
  'Open Drawer / Door',
  'Debris / Clutter',
  'Damaged Floor Mat',
  'Poor Lighting',
  'Other',
];

const SEVERITY_COLOR = {
  Minor:    '#22c55e',
  Moderate: '#f59e0b',
  Serious:  '#f97316',
  Critical: '#ef4444',
};

const STATUS_COLOR = {
  Open:           '#FF9900',
  'Under Review': '#818cf8',
  Closed:         '#22c55e',
};

/* ─── Shared helpers ─────────────────────────────────────────────────────── */

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
      borderRadius: '99px', border: `1px solid ${color}44`,
      background: `${color}18`, color, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 90, padding: '12px 14px', borderRadius: '8px',
      background: `${color}10`, border: `1px solid ${color}28`,
    }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

const inputStyle = {
  padding: '7px 10px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: '5px',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

/* ─── Incident card ──────────────────────────────────────────────────────── */

function IncidentCard({ incident, onRemove, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const sColor = SEVERITY_COLOR[incident.severity] || '#888';
  const stColor = STATUS_COLOR[incident.status]    || '#888';

  return (
    <div style={{
      borderRadius: '8px', background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${sColor}`,
      overflow: 'hidden',
    }}>
      {/* Row summary */}
      <button
        onClick={() => setExpanded((o) => !o)}
        style={{
          width: '100%', padding: '11px 14px', background: 'none',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        }}
      >
        <Badge label={incident.severity} color={sColor} />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          {incident.title}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          <Badge label={incident.status} color={stColor} />
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={10} />{incident.date}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(incident.id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex' }}
          >
            <X size={13} />
          </button>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px' }}>
            {incident.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <MapPin size={11} color="#FF9900" />{incident.location}
              </div>
            )}
            {incident.shift && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Shift: <strong style={{ color: 'var(--text-primary)' }}>{incident.shift}</strong>
              </div>
            )}
            {incident.reportedBy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <User size={11} />{incident.reportedBy}
              </div>
            )}
            {incident.subType && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Type: <strong style={{ color: 'var(--text-primary)' }}>{incident.subType}</strong>
              </div>
            )}
          </div>

          {incident.description && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0,
              padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              {incident.description}
            </p>
          )}

          {incident.corrective && (
            <div style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 700, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Corrective Action
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {incident.corrective}
              </p>
            </div>
          )}

          {/* Status updater */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Update status:</span>
            {STATUS_OPTIONS.map((s) => (
              <button key={s} onClick={() => onStatusChange(incident.id, s)} style={{
                padding: '3px 10px', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 600,
                border: `1px solid ${STATUS_COLOR[s]}44`,
                background: incident.status === s ? `${STATUS_COLOR[s]}22` : 'var(--bg-primary)',
                color: STATUS_COLOR[s], cursor: 'pointer',
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Log form ───────────────────────────────────────────────────────────── */

function LogForm({ category, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '', date: '', severity: 'Minor', location: '',
    shift: '', reportedBy: '', subType: '', description: '', corrective: '',
    status: 'Open',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const subTypeOptions = category === 'spills' ? SPILL_TYPES : TRIP_TYPES;

  function handleSave() {
    if (!form.title || !form.date) return;
    onSave({ ...form, id: Date.now(), category });
  }

  return (
    <div style={{
      padding: '14px', borderRadius: '8px',
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Incident Title *
          </label>
          <input style={inputStyle} value={form.title} onChange={(e) => set('title', e.target.value)}
            placeholder={category === 'spills' ? 'e.g. Oil spill near Belt 4' : 'e.g. Loose cable across aisle 3'} />
        </div>

        <div>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Date *</label>
          <input type="date" style={inputStyle} value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Severity</label>
          <select style={inputStyle} value={form.severity} onChange={(e) => set('severity', e.target.value)}>
            {SEVERITY_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            {category === 'spills' ? 'Spill Type' : 'Trip Hazard Type'}
          </label>
          <select style={inputStyle} value={form.subType} onChange={(e) => set('subType', e.target.value)}>
            <option value="">— Select —</option>
            {subTypeOptions.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Shift</label>
          <select style={inputStyle} value={form.shift} onChange={(e) => set('shift', e.target.value)}>
            <option value="">— Select —</option>
            {SHIFT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Location / Area</label>
          <input style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Inbound — Aisle 2" />
        </div>
        <div>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Reported By</label>
          <input style={inputStyle} value={form.reportedBy} onChange={(e) => set('reportedBy', e.target.value)} placeholder="Name / badge #" />
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description</label>
        <textarea style={{ ...inputStyle, height: '64px', resize: 'vertical' }}
          value={form.description} onChange={(e) => set('description', e.target.value)}
          placeholder="Describe what happened, where, and how..." />
      </div>

      <div>
        <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Corrective Action Taken</label>
        <textarea style={{ ...inputStyle, height: '52px', resize: 'vertical' }}
          value={form.corrective} onChange={(e) => set('corrective', e.target.value)}
          placeholder="What was done to fix or mitigate the hazard..." />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleSave} style={{
          padding: '7px 16px', background: '#FF9900', border: 'none',
          borderRadius: '5px', color: '#000', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
        }}>Save Incident</button>
        <button onClick={onCancel} style={{
          padding: '7px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '5px', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer',
        }}>Cancel</button>
      </div>
    </div>
  );
}

/* ─── Sub-section (Spills / Trip Hazards) ───────────────────────────────── */

function SubSection({ title, icon: Icon, color, category, incidents, onAdd, onRemove, onStatusChange }) {
  const [adding, setAdding] = useState(false);
  const open     = incidents.filter((i) => i.status === 'Open').length;
  const critical = incidents.filter((i) => i.severity === 'Critical' || i.severity === 'Serious').length;

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderTop: `3px solid ${color}`, borderRadius: '10px',
      overflow: 'hidden', marginBottom: '18px',
    }}>
      {/* Section header — plain title, no function square */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon size={16} color={color} />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <StatPill label="Total" value={incidents.length} color={color} />
          <StatPill label="Open" value={open} color="#FF9900" />
          <StatPill label="Serious+" value={critical} color="#ef4444" />
        </div>
      </div>

      <div style={{ padding: '16px 18px' }}>
        {/* Add button */}
        {!adding && (
          <button onClick={() => setAdding(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', marginBottom: '14px',
            background: `${color}18`, border: `1px solid ${color}44`,
            borderRadius: '6px', color, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={13} /> Log {title} Incident
          </button>
        )}

        {adding && (
          <LogForm
            category={category}
            onSave={(inc) => { onAdd(inc); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        )}

        {/* List */}
        {incidents.length === 0 && !adding ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontStyle: 'italic' }}>
            No {title.toLowerCase()} incidents logged yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {incidents.map((inc) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onRemove={onRemove}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Monthly history helpers ────────────────────────────────────────────── */

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function buildMonthGroups(incidents) {
  const map = {};
  incidents.forEach((inc) => {
    if (!inc.date) return;
    const d = new Date(inc.date);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = [];
    map[key].push(inc);
  });
  return Object.entries(map)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, list]) => {
      const [y, m] = key.split('-').map(Number);
      const total  = daysInMonth(y, m - 1);
      // days that had at least one incident
      const daySet = new Set(list.map((i) => i.date));
      const incidentDays = daySet.size;
      const freeDays     = total - incidentDays;
      const freePct      = Math.round((freeDays / total) * 100);
      return { key, year: y, month: m - 1, label: `${MONTH_NAMES[m - 1]} ${y}`, total, incidentDays, freeDays, freePct, incidents: list };
    });
}

/* Read-only incident row */
function ROIncidentRow({ inc }) {
  const sColor = SEVERITY_COLOR[inc.severity] || '#888';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
      borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${sColor}`,
    }}>
      <span style={{
        fontSize: '0.65rem', fontWeight: 700, padding: '1px 7px', borderRadius: '99px',
        background: `${sColor}18`, border: `1px solid ${sColor}44`, color: sColor, flexShrink: 0,
      }}>{inc.severity}</span>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', flex: 1,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inc.title}</span>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '3px' }}>
        <Calendar size={10} />{inc.date}
      </span>
      {inc.category && (
        <span style={{
          fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', flexShrink: 0,
          background: inc.category === 'spills' ? 'rgba(6,182,212,0.12)' : 'rgba(167,139,250,0.12)',
          color: inc.category === 'spills' ? '#06b6d4' : '#a78bfa',
        }}>{inc.category === 'spills' ? 'Spill' : 'Trip'}</span>
      )}
    </div>
  );
}

/* Month card */
function MonthCard({ group }) {
  const [open, setOpen] = useState(false);

  const pieData = [
    { name: 'Accident-Free Days', value: group.freeDays,     color: '#22c55e' },
    { name: 'Days with Incidents', value: group.incidentDays, color: '#ef4444' },
  ];

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '10px', overflow: 'hidden', marginBottom: '10px',
    }}>
      {/* Month header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
          padding: '13px 18px', background: open ? 'var(--bg-elevated)' : 'none',
          border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        {open ? <ChevronDown size={15} color="#ef4444" /> : <ChevronRight size={15} color="var(--text-secondary)" />}
        <Calendar size={14} color="#ef4444" />
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>
          {group.label}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444',
          }}>{group.incidents.length} incident{group.incidents.length !== 1 ? 's' : ''}</span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e',
          }}>{group.freePct}% accident-free</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '20px' }}>

          {/* Left — incident list (read-only) */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Incidents — {group.label}
              <span style={{ fontWeight: 400, marginLeft: 6, color: '#64748b' }}>(read-only data log)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {group.incidents.map((inc) => (
                <ROIncidentRow key={inc.id} inc={inc} />
              ))}
            </div>

            {/* Day summary */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
              {[
                { label: 'Total Days',         value: group.total,        color: '#94a3b8' },
                { label: 'Days w/ Incidents',  value: group.incidentDays, color: '#ef4444' },
                { label: 'Accident-Free Days', value: group.freeDays,     color: '#22c55e' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: '8px 12px', borderRadius: '7px', background: `${color}10`, border: `1px solid ${color}28` }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '3px', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — pie chart */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', textAlign: 'center' }}>
              Day Distribution
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={72}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem', color: '#e2e8f0' }}
                  formatter={(value, name) => [`${value} days`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
              {pieData.map(({ name, value, color }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', flex: 1 }}>{name}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color }}>{Math.round((value / group.total) * 100)}%</span>
                </div>
              ))}
            </div>
            {/* Big % callout */}
            <div style={{
              marginTop: '12px', padding: '10px 16px', borderRadius: '8px', textAlign: 'center',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', width: '100%',
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{group.freePct}%</div>
              <div style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 600, marginTop: '3px' }}>ACCIDENT FREE</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

/* Monthly history section */
function MonthlyHistorySection({ incidents }) {
  const groups = useMemo(() => buildMonthGroups(incidents), [incidents]);

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderTop: '3px solid #22c55e', borderRadius: '10px', overflow: 'hidden', marginBottom: '18px',
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <Calendar size={16} color="#22c55e" />
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Review History</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: 4 }}>
          — read-only data log · click a month to expand
        </span>
      </div>

      <div style={{ padding: '16px 18px' }}>
        {groups.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontStyle: 'italic' }}>
            No incidents logged yet. Records will appear here grouped by month once incidents are saved.
          </div>
        ) : (
          groups.map((g) => <MonthCard key={g.key} group={g} />)
        )}
      </div>
    </div>
  );
}

/* ─── Main view ──────────────────────────────────────────────────────────── */

export default function AccidentsView() {
  const [incidents, setIncidents] = useState([]);

  function addIncident(inc) {
    setIncidents((prev) => [inc, ...prev]);
  }

  function removeIncident(id) {
    if (window.confirm('Remove this incident record?')) {
      setIncidents((prev) => prev.filter((i) => i.id !== id));
    }
  }

  function updateStatus(id, status) {
    setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
  }

  const spills = incidents.filter((i) => i.category === 'spills');
  const trips  = incidents.filter((i) => i.category === 'trips');
  const total  = incidents.length;
  const openCount = incidents.filter((i) => i.status === 'Open').length;
  const seriousCount = incidents.filter((i) => i.severity === 'Serious' || i.severity === 'Critical').length;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Accidents
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, maxWidth: 680 }}>
          Log and track workplace accident incidents by category. All records include severity, location, shift, and corrective action.
        </p>

        {/* Safety reminders */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
          {[
            { label: 'Report all incidents within 1 hour', color: '#FF9900' },
            { label: 'OSHA 300 Log required for recordables', color: '#ef4444' },
            { label: 'Secure area before cleanup', color: '#818cf8' },
          ].map(({ label, color }) => (
            <span key={label} style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '99px',
              border: `1px solid ${color}33`, background: `${color}15`, color,
            }}>⚠ {label}</span>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <StatPill label="Total Incidents" value={total}        color="#FF9900" />
        <StatPill label="Open"            value={openCount}    color="#f97316" />
        <StatPill label="Serious / Critical" value={seriousCount} color="#ef4444" />
        <StatPill label="Spills"          value={spills.length} color="#06b6d4" />
        <StatPill label="Trip Hazards"    value={trips.length}  color="#a78bfa" />
      </div>

      {/* Spills sub-section */}
      <SubSection
        title="Spills"
        icon={Droplets}
        color="#06b6d4"
        category="spills"
        incidents={spills}
        onAdd={addIncident}
        onRemove={removeIncident}
        onStatusChange={updateStatus}
      />

      {/* Trip Hazards sub-section */}
      <SubSection
        title="Trip Hazards"
        icon={AlertTriangle}
        color="#a78bfa"
        category="trips"
        incidents={trips}
        onAdd={addIncident}
        onRemove={removeIncident}
        onStatusChange={updateStatus}
      />

      {/* Monthly review history */}
      <MonthlyHistorySection incidents={incidents} />

    </div>
  );
}
