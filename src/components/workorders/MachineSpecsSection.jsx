import { useState, useEffect } from 'react';
import { Plus, X, Save, ExternalLink } from 'lucide-react';

const PHASE_OPTIONS = ['', '1-Phase', '3-Phase', 'DC', 'Other'];

export default function MachineSpecsSection({ machineId, machineType, spec, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    partNumbers: [],
    voltage: '',
    motorSize: '',
    phase: '',
    manufacturer: '',
    websites: [],
    notes: '',
  });
  const [newPart, setNewPart] = useState('');
  const [newSite, setNewSite] = useState('');

  useEffect(() => {
    if (spec) {
      setForm({
        partNumbers: spec.partNumbers || [],
        voltage: spec.voltage || '',
        motorSize: spec.motorSize || '',
        phase: spec.phase || '',
        manufacturer: spec.manufacturer || '',
        websites: spec.websites || [],
        notes: spec.notes || '',
      });
    }
  }, [spec]);

  function addPart() {
    const val = newPart.trim();
    if (val && !form.partNumbers.includes(val)) {
      setForm((f) => ({ ...f, partNumbers: [...f.partNumbers, val] }));
    }
    setNewPart('');
  }

  function removePart(p) {
    setForm((f) => ({ ...f, partNumbers: f.partNumbers.filter((x) => x !== p) }));
  }

  function addSite() {
    const val = newSite.trim();
    if (val && !form.websites.includes(val)) {
      setForm((f) => ({ ...f, websites: [...f.websites, val] }));
    }
    setNewSite('');
  }

  function removeSite(s) {
    setForm((f) => ({ ...f, websites: f.websites.filter((x) => x !== s) }));
  }

  async function handleSave() {
    await onSave(machineId, machineType, form);
    setEditing(false);
  }

  const inputStyle = {
    padding: '6px 10px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '5px',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const hasData = spec && (
    spec.partNumbers?.length || spec.voltage || spec.motorSize ||
    spec.phase || spec.manufacturer || spec.websites?.length || spec.notes
  );

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          Specs for <strong style={{ color: 'var(--text-primary)' }}>{machineId}</strong>
        </span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              fontSize: '0.72rem', padding: '3px 10px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            {hasData ? 'Edit' : '+ Add Specs'}
          </button>
        )}
      </div>

      {/* Read view */}
      {!editing && hasData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {spec.manufacturer && (
            <SpecRow label="Manufacturer">{spec.manufacturer}</SpecRow>
          )}
          {spec.voltage && (
            <SpecRow label="Voltage">{spec.voltage}</SpecRow>
          )}
          {spec.motorSize && (
            <SpecRow label="Motor Size">{spec.motorSize}</SpecRow>
          )}
          {spec.phase && (
            <SpecRow label="Phase">{spec.phase}</SpecRow>
          )}
          {spec.partNumbers?.length > 0 && (
            <SpecRow label="Part Numbers">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {spec.partNumbers.map((p) => (
                  <span key={p} style={{ padding: '2px 7px', background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.25)', borderRadius: '4px', fontSize: '0.72rem', color: '#FF9900', fontFamily: 'monospace' }}>
                    {p}
                  </span>
                ))}
              </div>
            </SpecRow>
          )}
          {spec.websites?.length > 0 && (
            <SpecRow label="References">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {spec.websites.map((url) => (
                  <a key={url} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#60a5fa', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                    <ExternalLink size={11} />
                    {url}
                  </a>
                ))}
              </div>
            </SpecRow>
          )}
          {spec.notes && (
            <SpecRow label="Notes">{spec.notes}</SpecRow>
          )}
        </div>
      )}

      {!editing && !hasData && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontStyle: 'italic' }}>
          No specs added yet. Click "+ Add Specs" to add part numbers, voltage, motor info, and reference links.
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Manufacturer / Vendor</label>
              <input style={inputStyle} value={form.manufacturer} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} placeholder="e.g. Siemens" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Voltage Rating</label>
              <input style={inputStyle} value={form.voltage} onChange={(e) => setForm((f) => ({ ...f, voltage: e.target.value }))} placeholder="e.g. 480V AC" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Motor Size</label>
              <input style={inputStyle} value={form.motorSize} onChange={(e) => setForm((f) => ({ ...f, motorSize: e.target.value }))} placeholder="e.g. 5 HP / 3.7 kW" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Phase</label>
              <select style={inputStyle} value={form.phase} onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value }))}>
                {PHASE_OPTIONS.map((p) => <option key={p} value={p}>{p || '— Select phase —'}</option>)}
              </select>
            </div>
          </div>

          {/* Part numbers */}
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Part Numbers</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '6px' }}>
              {form.partNumbers.map((p) => (
                <span key={p} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.25)', borderRadius: '4px', fontSize: '0.72rem', color: '#FF9900', fontFamily: 'monospace' }}>
                  {p}
                  <button onClick={() => removePart(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF9900', padding: 0, display: 'flex' }}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={newPart} onChange={(e) => setNewPart(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPart()} placeholder="Type part # and press Enter" />
              <button onClick={addPart} style={{ padding: '6px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-secondary)', cursor: 'pointer' }}><Plus size={14} /></button>
            </div>
          </div>

          {/* Websites */}
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Reference Websites / Manuals</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
              {form.websites.map((url) => (
                <span key={url} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#60a5fa' }}>
                  <ExternalLink size={11} />
                  {url}
                  <button onClick={() => removeSite(url)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex', marginLeft: 'auto' }}><X size={11} /></button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={newSite} onChange={(e) => setNewSite(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSite()} placeholder="e.g. siemens.com/manuals/conveyor" />
              <button onClick={addSite} style={{ padding: '6px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-secondary)', cursor: 'pointer' }}><Plus size={14} /></button>
            </div>
          </div>

          {/* Internal notes */}
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Internal Notes</label>
            <textarea
              style={{ ...inputStyle, height: '60px', resize: 'vertical' }}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional notes about this machine..."
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#FF9900', border: 'none', borderRadius: '5px', color: '#000', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Save size={13} /> Save Specs
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{ padding: '7px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '4px 0', borderBottom: '1px solid rgba(42,48,64,0.5)' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', textAlign: 'right' }}>{children}</span>
    </div>
  );
}
