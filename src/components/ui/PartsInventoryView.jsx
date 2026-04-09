import { useState } from 'react';
import { Package, AlertTriangle, Plus, Search, Edit2, Check, X } from 'lucide-react';

const INITIAL_PARTS = [
  { id: 'p001', name: 'MDR Belt 24"', partNum: 'BLT-24-MDR', machine: 'MDR', qty: 3, minQty: 5, location: 'Shelf A1', vendor: 'Hytrol', unitCost: 42 },
  { id: 'p002', name: 'ACIM Bearing 6205', partNum: 'BRG-6205', machine: 'ACIM', qty: 12, minQty: 6, location: 'Shelf B3', vendor: 'SKF', unitCost: 18 },
  { id: 'p003', name: 'Servo Drive Fuse 10A', partNum: 'FUS-10A-SRV', machine: 'Servo', qty: 2, minQty: 8, location: 'Panel Cabinet', vendor: 'Bussmann', unitCost: 6 },
  { id: 'p004', name: 'Conveyor Roller 1.9"', partNum: 'RLR-19-STD', machine: 'Conveyor', qty: 20, minQty: 10, location: 'Shelf A4', vendor: 'Omni', unitCost: 14 },
  { id: 'p005', name: 'BLDC Motor 24V', partNum: 'MTR-24V-BLDC', machine: 'BLDC', qty: 1, minQty: 3, location: 'Cage C1', vendor: 'Bodine', unitCost: 210 },
  { id: 'p006', name: 'Scanner Lens Wipe Kit', partNum: 'CLN-SCAN-KIT', machine: 'Scanner', qty: 15, minQty: 5, location: 'Tool Crib', vendor: 'Zebra', unitCost: 4 },
  { id: 'p007', name: 'Pancake Motor Brush Set', partNum: 'BRS-PCK-STD', machine: 'Pancake', qty: 0, minQty: 4, location: 'Shelf D2', vendor: 'Leeson', unitCost: 28 },
  { id: 'p008', name: 'E-Stop Button NO', partNum: 'BTN-ESTOP-NO', machine: 'General', qty: 6, minQty: 4, location: 'Electrical Room', vendor: 'Schmersal', unitCost: 22 },
];

function stockStatus(part) {
  if (part.qty === 0) return 'out';
  if (part.qty < part.minQty) return 'low';
  return 'ok';
}

const STATUS_COLOR = { out: '#dc2626', low: '#FF9900', ok: '#22c55e' };
const STATUS_LABEL = { out: 'OUT OF STOCK', low: 'LOW STOCK', ok: 'IN STOCK' };

export default function PartsInventoryView() {
  const [parts, setParts] = useState(INITIAL_PARTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [form, setForm] = useState({ name: '', partNum: '', machine: '', qty: '', minQty: '', location: '', vendor: '', unitCost: '' });

  function addPart(e) {
    e.preventDefault();
    setParts((prev) => [{ ...form, id: `p-${Date.now()}`, qty: Number(form.qty), minQty: Number(form.minQty), unitCost: Number(form.unitCost) }, ...prev]);
    setForm({ name: '', partNum: '', machine: '', qty: '', minQty: '', location: '', vendor: '', unitCost: '' });
    setShowForm(false);
  }

  function saveQty(id) {
    setParts((prev) => prev.map((p) => p.id === id ? { ...p, qty: Math.max(0, Number(editQty)) } : p));
    setEditId(null);
  }

  const filtered = parts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.partNum.toLowerCase().includes(q) || p.machine.toLowerCase().includes(q);
    const st = stockStatus(p);
    const matchStatus = filterStatus === 'All' || st === filterStatus;
    return matchSearch && matchStatus;
  });

  const out = parts.filter((p) => stockStatus(p) === 'out').length;
  const low = parts.filter((p) => stockStatus(p) === 'low').length;
  const totalValue = parts.reduce((acc, p) => acc + p.qty * p.unitCost, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
        {[
          { label: 'Out of Stock', value: out, color: '#dc2626' },
          { label: 'Low Stock', value: low, color: '#FF9900' },
          { label: 'Total Parts', value: parts.length, color: '#818cf8' },
          { label: 'Inventory Value', value: `$${totalValue.toLocaleString()}`, color: '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: `1px solid ${color}33`, borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color, fontFamily: 'monospace' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parts, part #, machine…"
            style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
          />
        </div>
        {['All', 'out', 'low', 'ok'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding: '5px 11px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
              background: filterStatus === s ? (STATUS_COLOR[s] || '#818cf8') : 'var(--bg-elevated)',
              borderColor: filterStatus === s ? (STATUS_COLOR[s] || '#818cf8') : 'var(--border)',
              color: filterStatus === s ? '#fff' : 'var(--text-secondary)',
            }}>
            {s === 'All' ? 'All' : STATUS_LABEL[s]}
          </button>
        ))}
        <button onClick={() => setShowForm((v) => !v)}
          style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '6px', background: '#22c55e', border: 'none', color: '#000', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Plus size={13} /> Add Part
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addPart} style={{ background: 'var(--bg-surface)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            { key: 'name', label: 'Part Name', placeholder: 'e.g. MDR Belt 24"', flex: '2 1 200px' },
            { key: 'partNum', label: 'Part #', placeholder: 'e.g. BLT-24-MDR', flex: '1 1 140px' },
            { key: 'machine', label: 'Machine Type', placeholder: 'e.g. MDR', flex: '1 1 120px' },
            { key: 'location', label: 'Storage Location', placeholder: 'e.g. Shelf A1', flex: '1 1 130px' },
            { key: 'vendor', label: 'Vendor', placeholder: 'e.g. Hytrol', flex: '1 1 120px' },
            { key: 'qty', label: 'Qty On Hand', placeholder: '0', flex: '1 1 90px' },
            { key: 'minQty', label: 'Min Qty', placeholder: '5', flex: '1 1 80px' },
            { key: 'unitCost', label: 'Unit Cost ($)', placeholder: '0.00', flex: '1 1 100px' },
          ].map(({ key, label, placeholder, flex }) => (
            <div key={key} style={{ flex }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <button type="submit" style={{ padding: '7px 16px', borderRadius: '6px', background: '#22c55e', border: 'none', color: '#000', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Save Part</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '7px 12px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Parts table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={15} color="#22c55e" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Parts Inventory — {filtered.length} items</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Status', 'Part Name', 'Part #', 'Machine', 'Location', 'Vendor', 'Qty', 'Min', 'Unit $', 'Total $'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const st = stockStatus(p);
                const color = STATUS_COLOR[st];
                return (
                  <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', borderLeft: `3px solid ${color}` }}>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 700, background: `${color}20`, color, whiteSpace: 'nowrap' }}>
                        {st === 'out' ? <AlertTriangle size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> : null}
                        {STATUS_LABEL[st]}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.partNum}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{p.machine}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{p.location}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{p.vendor}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {editId === p.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)}
                            style={{ width: '52px', padding: '3px 6px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid #818cf8', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none' }} />
                          <button onClick={() => saveQty(p.id)} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', padding: '2px' }}><Check size={13} /></button>
                          <button onClick={() => setEditId(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}><X size={13} /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: st === 'out' ? '#dc2626' : st === 'low' ? '#FF9900' : 'var(--text-primary)' }}>{p.qty}</span>
                          <button onClick={() => { setEditId(p.id); setEditQty(String(p.qty)); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}><Edit2 size={11} /></button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{p.minQty}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>${p.unitCost}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>${(p.qty * p.unitCost).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
