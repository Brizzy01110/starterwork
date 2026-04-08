import { useState, useMemo } from 'react';
import { Plus, X, Clock, User, MapPin, Edit2, Save, ChevronDown, ChevronUp, Forklift } from 'lucide-react';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const MEWP_TYPES = [
  'Scissor Lift',
  'Boom Lift — Articulating',
  'Boom Lift — Telescopic',
  'Vertical Mast Lift',
  'Push-Around Lift',
  'Order Picker',
  'Reach Truck',
  'Turret Truck',
  'Counterbalance Forklift',
  'Pallet Jack — Electric',
  'Pallet Jack — Manual',
  'Other',
];

const FLOOR_HAZARD_TYPES = [
  'Pedestrian Near-Miss',
  'Restricted Zone Breach',
  'Speed Violation',
  'Improper Load',
  'Blocked Aisle',
  'Equipment Collision',
  'Surface Damage',
  'Operator Error',
  'Pre-Op Check Skipped',
  'Other',
];

const INSPECTION_STATUS = ['Pass', 'Fail', 'Requires Service'];
const SHIFT_OPTIONS     = ['Day', 'Evening', 'Night', 'Weekend'];
const RENTAL_STATUS     = ['Active', 'Returned', 'Overdue', 'Reserved'];
const VENDOR_OPTIONS    = ['Sunbelt Rentals', 'United Rentals', 'BlueLine Rental', 'H&E Equipment', 'Internal Fleet', 'Other'];

const INSP_COLOR = { Pass: '#22c55e', Fail: '#ef4444', 'Requires Service': '#f59e0b' };
const RENTAL_COLOR = { Active: '#22c55e', Returned: '#818cf8', Overdue: '#ef4444', Reserved: '#FF9900' };

const inputStyle = {
  padding: '7px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border)',
  borderRadius: '5px', color: 'var(--text-primary)', fontSize: '0.8rem',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

/* ─── Shared helpers ─────────────────────────────────────────────────────── */

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
      border: `1px solid ${color}44`, background: `${color}18`, color, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 90, padding: '12px 14px', borderRadius: '8px',
      background: `${color}10`, border: `1px solid ${color}28`,
    }}>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function SectionHeader({ title, color, icon: Icon, children }) {
  return (
    <div style={{
      padding: '14px 18px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-elevated)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={16} color={color} />
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 1 — FLOOR OPERATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function FloorOpCard({ op, onRemove }) {
  const [open, setOpen] = useState(false);
  const ic = INSP_COLOR[op.inspectionStatus] || '#888';

  return (
    <div style={{
      borderRadius: '8px', background: 'var(--bg-elevated)',
      border: '1px solid var(--border)', borderLeft: `3px solid ${ic}`, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}
      >
        <Badge label={op.equipmentType} color="#FF9900" />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          {op.unitId || 'No Unit ID'}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          <Badge label={op.inspectionStatus} color={ic} />
          {op.hazard && <Badge label={op.hazard} color="#f97316" />}
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={10} />{op.date}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onRemove(op.id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex' }}>
            <X size={13} />
          </button>
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {op.operator && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><User size={11} style={{ marginRight: 4 }} />{op.operator}</div>}
            {op.location && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><MapPin size={11} style={{ marginRight: 4 }} />{op.location}</div>}
            {op.shift    && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Shift: <strong style={{ color: 'var(--text-primary)' }}>{op.shift}</strong></div>}
            {op.hoursUsed && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hours Used: <strong style={{ color: 'var(--text-primary)' }}>{op.hoursUsed}h</strong></div>}
          </div>
          {op.notes && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0,
              padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              {op.notes}
            </p>
          )}
          {op.hazardDetail && (
            <div style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.25)' }}>
              <div style={{ fontSize: '0.65rem', color: '#f97316', fontWeight: 700, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hazard Detail</div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{op.hazardDetail}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FloorOpsSection({ ops, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    date: '', unitId: '', equipmentType: '', operator: '', location: '',
    shift: '', hoursUsed: '', inspectionStatus: 'Pass', hazard: '', hazardDetail: '', notes: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const passCount = ops.filter((o) => o.inspectionStatus === 'Pass').length;
  const failCount = ops.filter((o) => o.inspectionStatus === 'Fail').length;
  const svcCount  = ops.filter((o) => o.inspectionStatus === 'Requires Service').length;
  const hazCount  = ops.filter((o) => o.hazard).length;

  function handleSave() {
    if (!form.date || !form.equipmentType) return;
    onAdd({ ...form, id: Date.now() });
    setForm({ date: '', unitId: '', equipmentType: '', operator: '', location: '',
      shift: '', hoursUsed: '', inspectionStatus: 'Pass', hazard: '', hazardDetail: '', notes: '' });
    setAdding(false);
  }

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderTop: '3px solid #FF9900', borderRadius: '10px', overflow: 'hidden', marginBottom: '18px',
    }}>
      <SectionHeader title="Floor Operations" color="#FF9900" icon={Forklift}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <StatPill label="Total Logs" value={ops.length}   color="#FF9900" />
          <StatPill label="Pass"       value={passCount}    color="#22c55e" />
          <StatPill label="Fail"       value={failCount}    color="#ef4444" />
          <StatPill label="Need Svc"   value={svcCount}     color="#f59e0b" />
          <StatPill label="Hazards"    value={hazCount}     color="#f97316" />
        </div>
      </SectionHeader>

      <div style={{ padding: '16px 18px' }}>
        {!adding && (
          <button onClick={() => setAdding(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', marginBottom: '14px',
            background: 'rgba(255,153,0,0.12)', border: '1px solid rgba(255,153,0,0.35)',
            borderRadius: '6px', color: '#FF9900', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={13} /> Log Floor Operation
          </button>
        )}

        {adding && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Date *</label>
                <input type="date" style={inputStyle} value={form.date} onChange={(e) => set('date', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Equipment Type *</label>
                <select style={inputStyle} value={form.equipmentType} onChange={(e) => set('equipmentType', e.target.value)}>
                  <option value="">— Select —</option>
                  {MEWP_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Unit ID</label>
                <input style={inputStyle} value={form.unitId} onChange={(e) => set('unitId', e.target.value)} placeholder="e.g. SL-04 / FL-112" />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Operator</label>
                <input style={inputStyle} value={form.operator} onChange={(e) => set('operator', e.target.value)} placeholder="Name / badge #" />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Location / Area</label>
                <input style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Dock 3 / Inbound" />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Shift</label>
                <select style={inputStyle} value={form.shift} onChange={(e) => set('shift', e.target.value)}>
                  <option value="">— Select —</option>
                  {SHIFT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Hours Used</label>
                <input type="number" min="0" step="0.5" style={inputStyle} value={form.hoursUsed} onChange={(e) => set('hoursUsed', e.target.value)} placeholder="e.g. 4.5" />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pre-Op Inspection</label>
                <select style={inputStyle} value={form.inspectionStatus} onChange={(e) => set('inspectionStatus', e.target.value)}>
                  {INSPECTION_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Hazard Observed</label>
                <select style={inputStyle} value={form.hazard} onChange={(e) => set('hazard', e.target.value)}>
                  <option value="">— None —</option>
                  {FLOOR_HAZARD_TYPES.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            {form.hazard && (
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Hazard Detail</label>
                <textarea style={{ ...inputStyle, height: '52px', resize: 'vertical' }} value={form.hazardDetail} onChange={(e) => set('hazardDetail', e.target.value)} placeholder="Describe the hazard observed..." />
              </div>
            )}
            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes</label>
              <textarea style={{ ...inputStyle, height: '52px', resize: 'vertical' }} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Any additional notes..." />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} style={{ padding: '7px 16px', background: '#FF9900', border: 'none', borderRadius: '5px', color: '#000', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                Save Log
              </button>
              <button onClick={() => setAdding(false)} style={{ padding: '7px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {ops.length === 0 && !adding ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontStyle: 'italic' }}>No floor operation logs yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ops.map((op) => <FloorOpCard key={op.id} op={op} onRemove={onRemove} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 2 — RENTALS TABLE
   ═══════════════════════════════════════════════════════════════════════════ */

function RentalRow({ rental, onRemove, onStatusChange }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(rental.status);
  const sc = RENTAL_COLOR[rental.status] || '#888';

  function saveStatus() {
    onStatusChange(rental.id, status);
    setEditing(false);
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={td}><span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#FF9900', fontWeight: 700 }}>{rental.unitId || '—'}</span></td>
      <td style={td}>{rental.equipmentType}</td>
      <td style={td}>{rental.vendor}</td>
      <td style={td}>{rental.startDate}</td>
      <td style={td}>{rental.endDate || '—'}</td>
      <td style={td}>
        {rental.dailyRate ? `$${Number(rental.dailyRate).toLocaleString()}/day` : '—'}
      </td>
      <td style={td}>
        {editing ? (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              style={{ ...inputStyle, width: 'auto', padding: '3px 6px', fontSize: '0.72rem' }}>
              {RENTAL_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button onClick={saveStatus} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', display: 'flex' }}><Save size={13} /></button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Badge label={rental.status} color={sc} />
            <Edit2 size={10} color="var(--text-secondary)" />
          </button>
        )}
      </td>
      <td style={td}>{rental.notes || '—'}</td>
      <td style={{ ...td, textAlign: 'center' }}>
        <button onClick={() => onRemove(rental.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
          <X size={13} />
        </button>
      </td>
    </tr>
  );
}

const th = { fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' };
const td = { fontSize: '0.78rem', color: 'var(--text-primary)', padding: '9px 12px', verticalAlign: 'middle' };

function RentalsSection({ rentals, onAdd, onRemove, onStatusChange }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ unitId: '', equipmentType: '', vendor: '', startDate: '', endDate: '', dailyRate: '', status: 'Active', notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const active   = rentals.filter((r) => r.status === 'Active').length;
  const overdue  = rentals.filter((r) => r.status === 'Overdue').length;
  const total    = rentals.length;

  // Total cost for active rentals (days × rate)
  const activeCost = rentals.filter((r) => r.status === 'Active' && r.dailyRate && r.startDate).reduce((sum, r) => {
    const days = Math.max(1, Math.ceil((Date.now() - new Date(r.startDate)) / 86400000));
    return sum + days * Number(r.dailyRate);
  }, 0);

  function handleSave() {
    if (!form.equipmentType || !form.vendor || !form.startDate) return;
    onAdd({ ...form, id: Date.now() });
    setForm({ unitId: '', equipmentType: '', vendor: '', startDate: '', endDate: '', dailyRate: '', status: 'Active', notes: '' });
    setAdding(false);
  }

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderTop: '3px solid #818cf8', borderRadius: '10px', overflow: 'hidden', marginBottom: '18px',
    }}>
      <SectionHeader title="Rental Equipment" color="#818cf8" icon={Forklift}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <StatPill label="Total"    value={total}   color="#818cf8" />
          <StatPill label="Active"   value={active}  color="#22c55e" />
          <StatPill label="Overdue"  value={overdue} color="#ef4444" />
          <StatPill label="Est. Cost (Active)" value={`$${activeCost.toLocaleString()}`} color="#FF9900" />
        </div>
      </SectionHeader>

      <div style={{ padding: '16px 18px' }}>
        {!adding && (
          <button onClick={() => setAdding(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', marginBottom: '14px',
            background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.35)',
            borderRadius: '6px', color: '#818cf8', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={13} /> Add Rental
          </button>
        )}

        {adding && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Equipment Type *</label>
                <select style={inputStyle} value={form.equipmentType} onChange={(e) => set('equipmentType', e.target.value)}>
                  <option value="">— Select —</option>
                  {MEWP_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Unit ID / Asset Tag</label>
                <input style={inputStyle} value={form.unitId} onChange={(e) => set('unitId', e.target.value)} placeholder="e.g. RT-2241" />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Vendor *</label>
                <select style={inputStyle} value={form.vendor} onChange={(e) => set('vendor', e.target.value)}>
                  <option value="">— Select —</option>
                  {VENDOR_OPTIONS.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Daily Rate ($)</label>
                <input type="number" min="0" style={inputStyle} value={form.dailyRate} onChange={(e) => set('dailyRate', e.target.value)} placeholder="e.g. 250" />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Start Date *</label>
                <input type="date" style={inputStyle} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>End / Return Date</label>
                <input type="date" style={inputStyle} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Status</label>
                <select style={inputStyle} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {RENTAL_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes</label>
                <input style={inputStyle} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="PO #, contact, special conditions..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} style={{ padding: '7px 16px', background: '#818cf8', border: 'none', borderRadius: '5px', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                Save Rental
              </button>
              <button onClick={() => setAdding(false)} style={{ padding: '7px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {rentals.length === 0 && !adding ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontStyle: 'italic' }}>No rental equipment logged yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  {['Unit ID', 'Equipment', 'Vendor', 'Start', 'End / Return', 'Daily Rate', 'Status', 'Notes', ''].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rentals.map((r) => (
                  <RentalRow key={r.id} rental={r} onRemove={onRemove} onStatusChange={onStatusChange} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

export default function MEWPView() {
  const [floorOps, setFloorOps]   = useState([]);
  const [rentals,  setRentals]    = useState([]);

  function addFloorOp(op)       { setFloorOps((p) => [op, ...p]); }
  function removeFloorOp(id)    { setFloorOps((p) => p.filter((o) => o.id !== id)); }

  function addRental(r)         { setRentals((p) => [r, ...p]); }
  function removeRental(id)     { setRentals((p) => p.filter((r) => r.id !== id)); }
  function updateRentalStatus(id, status) {
    setRentals((p) => p.map((r) => r.id === id ? { ...r, status } : r));
  }

  const totalEquip   = floorOps.length + rentals.length;
  const activeRental = rentals.filter((r) => r.status === 'Active').length;
  const failedPreOp  = floorOps.filter((o) => o.inspectionStatus === 'Fail').length;
  const hazardCount  = floorOps.filter((o) => o.hazard).length;

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          MEWP
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, maxWidth: 700 }}>
          Mobile Elevating Work Platform tracking — log floor operations with pre-op inspection results, observed hazards,
          and manage the rental equipment table including vendor, rate, and return status.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
          {[
            { label: 'Pre-Op inspection required before every use', color: '#FF9900' },
            { label: 'ANSI/SAIA A92 — MEWP Standards', color: '#818cf8' },
            { label: 'Operator must be certified', color: '#22c55e' },
          ].map(({ label, color }) => (
            <span key={label} style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '99px',
              border: `1px solid ${color}33`, background: `${color}15`, color,
            }}>⚠ {label}</span>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <StatPill label="Total Logs"      value={floorOps.length} color="#FF9900" />
        <StatPill label="Active Rentals"  value={activeRental}    color="#22c55e" />
        <StatPill label="Failed Pre-Ops"  value={failedPreOp}     color="#ef4444" />
        <StatPill label="Hazards Logged"  value={hazardCount}     color="#f97316" />
        <StatPill label="Rental Records"  value={rentals.length}  color="#818cf8" />
      </div>

      <FloorOpsSection
        ops={floorOps}
        onAdd={addFloorOp}
        onRemove={removeFloorOp}
      />

      <RentalsSection
        rentals={rentals}
        onAdd={addRental}
        onRemove={removeRental}
        onStatusChange={updateRentalStatus}
      />

    </div>
  );
}
