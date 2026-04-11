import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, ShieldCheck, UserCheck, Wrench } from 'lucide-react';
import { ROLE_COLORS, ROLE_LABELS, ROLE_ACCESS } from '../../hooks/useAuth.js';

const BLANK = { username: '', password: '', name: '', role: 'operator', position: '' };

const ROLE_ICON = { admin: ShieldCheck, manager: UserCheck, operator: Wrench };

// What each role can and cannot see — for the info panel
const ROLE_SCOPE = {
  admin:    { can: 'Full access — all views, user management, reset data', cannot: 'Nothing restricted' },
  manager:  { can: 'Dashboard, Work Orders, Downtime, Health, PM, Parts, Handoff, Scorecards, Analytics, History, Safety, Accidents, MEWP, Wiring', cannot: 'User Management' },
  operator: { can: 'Dashboard, Work Orders, Machine Board, Health, PM, Shift Handoff, Wiring, Safety, MEWP', cannot: 'Analytics, History, Downtime Costs, Scorecards, Parts Inventory, Defects, Accidents' },
};

export default function UserManagementView({ users, currentUser, onAdd, onUpdate, onDelete }) {
  const [mode,     setMode]    = useState('list');   // list | add | edit
  const [editId,   setEditId]  = useState(null);
  const [form,     setForm]    = useState(BLANK);
  const [showPw,   setShowPw]  = useState(false);
  const [errors,   setErrors]  = useState({});
  const [filter,   setFilter]  = useState('all');    // all | admin | manager | operator

  /* ── Form helpers ── */
  function startAdd() {
    setForm(BLANK);
    setErrors({});
    setShowPw(false);
    setMode('add');
  }

  function startEdit(u) {
    setForm({ username: u.username, password: u.password, name: u.name, role: u.role, position: u.position || '' });
    setEditId(u.id);
    setErrors({});
    setShowPw(false);
    setMode('edit');
  }

  function cancel() {
    setMode('list');
    setEditId(null);
  }

  function validate() {
    const e = {};
    if (!form.name.trim())     e.name     = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password)        e.password = 'Password is required';
    if (form.password && form.password.length < 4) e.password = 'Password must be at least 4 characters';
    // Check username uniqueness
    const taken = users.some((u) => u.username === form.username.trim() && u.id !== editId);
    if (taken) e.username = 'Username already taken';
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (mode === 'edit') {
      onUpdate(editId, { ...form, username: form.username.trim(), name: form.name.trim() });
    } else {
      onAdd({ ...form, username: form.username.trim(), name: form.name.trim() });
    }
    cancel();
  }

  function field(key, label, placeholder, type = 'text') {
    return (
      <div>
        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>
          {label}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={type === 'password' ? (showPw ? 'text' : 'password') : type}
            value={form[key]}
            onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: '' })); }}
            placeholder={placeholder}
            style={{
              width: '100%', padding: type === 'password' ? '9px 36px 9px 11px' : '9px 11px',
              borderRadius: '7px',
              background: 'var(--bg-elevated)',
              border: `1px solid ${errors[key] ? '#ef4444' : 'var(--border)'}`,
              color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none',
            }}
            onFocus={(e)  => { if (!errors[key]) e.target.style.borderColor = '#FF9900'; }}
            onBlur={(e)   => { if (!errors[key]) e.target.style.borderColor = 'var(--border)'; }}
          />
          {type === 'password' && (
            <button type="button" onClick={() => setShowPw((v) => !v)} tabIndex={-1}
              style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          )}
        </div>
        {errors[key] && <div style={{ fontSize: '0.68rem', color: '#ef4444', marginTop: '3px' }}>{errors[key]}</div>}
      </div>
    );
  }

  const visible = filter === 'all' ? users : users.filter((u) => u.role === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>User Management</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Admin only — create accounts, assign roles, set passwords
          </div>
        </div>
        {mode === 'list' && (
          <button onClick={startAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '7px', background: '#FF9900', border: 'none', color: '#000', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={14} /> Add User
          </button>
        )}
      </div>

      {/* ── Role scope info cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {(['admin', 'manager', 'operator']).map((r) => {
          const color = ROLE_COLORS[r];
          const Icon  = ROLE_ICON[r];
          return (
            <div key={r} style={{ background: 'var(--bg-surface)', border: `1px solid ${color}30`, borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                <div style={{ width: 26, height: 26, borderRadius: '7px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={13} color={color} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ROLE_LABELS[r]}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>✓ </span>{ROLE_SCOPE[r].can}
              </div>
              {ROLE_SCOPE[r].cannot !== 'Nothing restricted' && (
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: '4px' }}>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>✕ </span>{ROLE_SCOPE[r].cannot}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add / Edit form ── */}
      {(mode === 'add' || mode === 'edit') && (
        <div style={{ background: 'var(--bg-surface)', border: `1px solid ${mode === 'add' ? '#FF990044' : '#818cf844'}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {mode === 'add' ? 'New User' : 'Edit User'}
            </div>
            <button onClick={cancel} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {field('name',     'Full Name',        'e.g. John Smith')}
            {field('username', 'Username',         'e.g. jsmith')}
            {field('password', 'Password',         'Enter password', 'password')}
            {field('position', 'Position / Title', 'e.g. Maintenance Technician')}
          </div>

          {/* Role select */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Role</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['admin', 'manager', 'operator'].map((r) => {
                const color    = ROLE_COLORS[r];
                const selected = form.role === r;
                return (
                  <button key={r} type="button" onClick={() => setForm((f) => ({ ...f, role: r }))}
                    style={{ flex: 1, padding: '9px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', border: selected ? `2px solid ${color}` : '2px solid var(--border)', background: selected ? `${color}12` : 'var(--bg-elevated)', color: selected ? color : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700 }}>
                    {ROLE_LABELS[r]}
                    <div style={{ fontSize: '0.6rem', fontWeight: 400, marginTop: '2px', opacity: 0.75 }}>
                      {ROLE_ACCESS[r].length} views
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} style={{ padding: '8px 18px', borderRadius: '7px', background: '#FF9900', border: 'none', color: '#000', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              {mode === 'edit' ? 'Save Changes' : 'Create User'}
            </button>
            <button onClick={cancel} style={{ padding: '8px 14px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {['all', 'admin', 'manager', 'operator'].map((f) => {
          const active = filter === f;
          const color  = f === 'all' ? '#FF9900' : ROLE_COLORS[f];
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 14px', borderRadius: '99px', border: active ? `1px solid ${color}` : '1px solid var(--border)', background: active ? `${color}14` : 'none', color: active ? color : 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>
              {f === 'all' ? `All (${users.length})` : `${ROLE_LABELS[f]} (${users.filter(u => u.role === f).length})`}
            </button>
          );
        })}
      </div>

      {/* ── User table ── */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Username', 'Position', 'Role', 'Access', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '10px 14px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => {
              const color = ROLE_COLORS[u.role];
              const isMe  = u.id === currentUser.id;
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.name}
                      {isMe && <span style={{ marginLeft: '6px', fontSize: '0.58rem', color: '#FF9900', fontWeight: 700, verticalAlign: 'middle' }}>YOU</span>}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{u.username}</td>
                  <td style={{ padding: '11px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.position || '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.63rem', fontWeight: 700, background: `${color}15`, border: `1px solid ${color}44`, color }}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {ROLE_ACCESS[u.role].length} views
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.63rem', fontWeight: 700, background: u.active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: u.active ? '#22c55e' : '#ef4444' }}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <button onClick={() => startEdit(u)} title="Edit user"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', borderRadius: '5px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.68rem', cursor: 'pointer' }}>
                        <Edit2 size={11} /> Edit
                      </button>
                      {!isMe && (
                        <button onClick={() => onUpdate(u.id, { active: !u.active })} title={u.active ? 'Disable account' : 'Enable account'}
                          style={{ padding: '4px 9px', borderRadius: '5px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.68rem', cursor: 'pointer' }}>
                          {u.active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                      {!isMe && (
                        <button onClick={() => { if (window.confirm(`Permanently delete ${u.name}?`)) onDelete(u.id); }}
                          title="Delete user"
                          style={{ padding: '4px 7px', borderRadius: '5px', background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
