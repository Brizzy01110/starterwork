import { LayoutList, LayoutGrid, BarChart2, RotateCcw, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'table', label: 'Work Orders', icon: LayoutList },
  { id: 'board', label: 'Machine Board', icon: LayoutGrid },
  { id: 'charts', label: 'Analytics', icon: BarChart2 },
  { id: 'wiring', label: 'Wiring Diagrams', icon: Zap },
];

export default function Sidebar({ activeView, onViewChange, onReset, isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 15,
            display: 'none',
          }}
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav
        style={{
          width: '200px',
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 8px',
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        aria-label="Main navigation"
      >
        <div style={{ marginBottom: '4px', padding: '0 8px 8px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Views
          </span>
        </div>

        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => { onViewChange(id); onClose(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '6px',
                background: active ? 'rgba(255,153,0,0.12)' : 'none',
                border: active ? '1px solid rgba(255,153,0,0.25)' : '1px solid transparent',
                color: active ? '#FF9900' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s',
                marginBottom: '2px',
              }}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; } }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}

        {/* Reset data */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              background: 'none',
              border: '1px solid transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              width: '100%',
              transition: 'color 0.15s',
            }}
            title="Reset all data to mock defaults"
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <RotateCcw size={12} />
            Reset Data
          </button>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 52px;
            left: -200px;
            bottom: 0;
            z-index: 16;
            transition: left 0.25s ease;
          }
          .sidebar.sidebar-open {
            left: 0;
          }
          .sidebar-backdrop {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
