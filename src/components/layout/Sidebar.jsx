import { LayoutList, LayoutGrid, BarChart2, RotateCcw, Zap, ShieldCheck, History, FlaskConical, TriangleAlert, Forklift, DollarSign, Wrench, Package, ClipboardList, User, Activity, Monitor, Users } from 'lucide-react';
import { ROLE_ACCESS, ROLE_COLORS, ROLE_LABELS } from '../../hooks/useAuth.js';

const NAV_GROUPS = {
  overview: [
    { id: 'dashboard', label: 'System Dashboard', icon: Monitor  },
    { id: 'table',     label: 'Work Orders',       icon: LayoutList },
    { id: 'board',     label: 'Machine Board',     icon: LayoutGrid },
    { id: 'charts',    label: 'Analytics',         icon: BarChart2  },
    { id: 'history',   label: 'History',           icon: History    },
    { id: 'downtime',  label: 'Downtime Cost',     icon: DollarSign },
    { id: 'scorecard', label: 'Tech Scorecards',   icon: User       },
    { id: 'health',    label: 'Machine Health',    icon: Activity   },
    { id: 'handoff',   label: 'Shift Handoff',     icon: ClipboardList },
    { id: 'users',     label: 'User Management',   icon: Users      },
  ],
  services: [
    { id: 'wiring',  label: 'Wiring Diagrams', icon: Zap         },
    { id: 'safety',  label: 'Safety / MT',     icon: ShieldCheck },
    { id: 'defects', label: 'Defect Analysis', icon: FlaskConical },
    { id: 'pm',      label: 'PM Scheduler',    icon: Wrench      },
    { id: 'parts',   label: 'Parts Inventory', icon: Package     },
  ],
  accidents: [
    { id: 'accidents', label: 'Accidents', icon: TriangleAlert },
  ],
  mewp: [
    { id: 'mewp', label: 'MEWP', icon: Forklift },
  ],
};

const GROUP_META = {
  overview:  { label: 'Overview',        color: '#FF9900' },
  services:  { label: 'Normal Services', color: '#818cf8' },
  accidents: { label: 'Accidents',       color: '#ef4444' },
  mewp:      { label: 'MEWP',            color: '#06b6d4' },
};

export default function Sidebar({ activeView, onViewChange, onReset, isOpen, onClose, sidebarMode = 'overview', currentUser }) {
  const role       = currentUser?.role || 'operator';
  const allowed    = ROLE_ACCESS[role] || [];
  const allItems   = NAV_GROUPS[sidebarMode] || NAV_GROUPS.overview;
  // Filter out views the current role cannot access
  const items      = allItems.filter((item) => allowed.includes(item.id));
  const meta       = GROUP_META[sidebarMode];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 15, display: 'none' }}
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav
        style={{
          width: '200px', flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '12px 8px',
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Group header */}
        <div style={{ marginBottom: '4px', padding: '0 8px 8px', borderBottom: `1px solid ${meta.color}44`, display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: meta.color, boxShadow: `0 0 5px ${meta.color}88`, flexShrink: 0 }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {meta.label}
          </span>
        </div>

        {/* Nav items */}
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          const isAdmin = id === 'users';
          return (
            <button
              key={id}
              onClick={() => { onViewChange(id); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '6px',
                background: active ? `${meta.color}1e` : 'none',
                border: active ? `1px solid ${meta.color}44` : '1px solid transparent',
                color: active ? meta.color : isAdmin ? '#ef4444' : 'var(--text-secondary)',
                fontSize: '0.82rem', fontWeight: active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all 0.15s', marginBottom: '2px',
              }}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = isAdmin ? '#ef4444' : 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = isAdmin ? '#ef4444' : 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; } }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}

        {items.length === 0 && (
          <div style={{ padding: '12px 10px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            No views available
          </div>
        )}

        {/* Bottom: role badge + reset */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Role badge */}
          {currentUser && (
            <div style={{ padding: '7px 10px', borderRadius: '7px', background: `${ROLE_COLORS[role]}0d`, border: `1px solid ${ROLE_COLORS[role]}30`, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: ROLE_COLORS[role], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {ROLE_LABELS[role]}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </div>
              {currentUser.position && (
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.position}
                </div>
              )}
            </div>
          )}

          {/* Reset (admin only) */}
          {role === 'admin' && (
            <button
              onClick={onReset}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '6px', background: 'none', border: '1px solid transparent', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', width: '100%', transition: 'color 0.15s' }}
              title="Reset all data to mock defaults"
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <RotateCcw size={12} /> Reset Data
            </button>
          )}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { position: fixed; top: 52px; left: -200px; bottom: 0; z-index: 16; transition: left 0.25s ease; }
          .sidebar.sidebar-open { left: 0; }
          .sidebar-backdrop { display: block !important; }
        }
      `}</style>
    </>
  );
}
