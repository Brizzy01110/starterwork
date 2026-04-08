import { useState } from 'react';
import { Zap, Menu, X, Bell, MessageSquare } from 'lucide-react';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Header({ onMenuToggle, menuOpen, notifications = [], onClearNotifications, sidebarMode = 'overview', onModeChange }) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  function handleOpen() {
    setOpen((o) => !o);
    if (!open && onClearNotifications) onClearNotifications();
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '52px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            background: '#FF9900',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Zap size={15} color="black" fill="black" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

          {/* Main title */}
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}>
            MT Services
          </div>

          {/* Subtitle group — indented right of main title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px', paddingLeft: '6px', borderLeft: '1px solid var(--border)' }}>

            {/* Overview button */}
            <button
              onClick={() => onModeChange('overview')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                paddingRight: '12px', background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 12px 4px 0', borderRadius: '4px',
                opacity: sidebarMode === 'overview' ? 1 : 0.45,
                transition: 'opacity 0.15s',
              }}
              title="Switch sidebar to Overview"
            >
              <div style={{
                width: '9px', height: '9px',
                background: sidebarMode === 'overview' ? '#FF9900' : '#666',
                borderRadius: '2px', marginBottom: '3px',
                boxShadow: sidebarMode === 'overview' ? '0 0 6px rgba(255,153,0,0.7)' : 'none',
                transition: 'all 0.15s',
              }} />
              <span style={{ fontSize: '0.56rem', color: sidebarMode === 'overview' ? '#FF9900' : 'var(--text-secondary)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>
                Overview
              </span>
            </button>

            {/* Vertical divider */}
            <div style={{ width: '1px', height: '28px', background: 'var(--border)', marginRight: '8px' }} />

            {/* Normal Services button */}
            <button
              onClick={() => onModeChange('services')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 12px 4px 0', borderRadius: '4px',
                opacity: sidebarMode === 'services' ? 1 : 0.45,
                transition: 'opacity 0.15s',
              }}
              title="Switch sidebar to Normal Services"
            >
              <div style={{
                width: '9px', height: '9px',
                background: sidebarMode === 'services' ? '#818cf8' : '#666',
                borderRadius: '2px', marginBottom: '3px',
                boxShadow: sidebarMode === 'services' ? '0 0 6px rgba(129,140,248,0.7)' : 'none',
                transition: 'all 0.15s',
              }} />
              <span style={{ fontSize: '0.56rem', color: sidebarMode === 'services' ? '#818cf8' : 'var(--text-secondary)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>
                Normal Services
              </span>
            </button>

            {/* Vertical divider */}
            <div style={{ width: '1px', height: '28px', background: 'var(--border)', marginRight: '8px' }} />

            {/* Accidents button */}
            <button
              onClick={() => onModeChange('accidents')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 4px 4px 0', borderRadius: '4px',
                opacity: sidebarMode === 'accidents' ? 1 : 0.45,
                transition: 'opacity 0.15s',
              }}
              title="Switch sidebar to Accidents"
            >
              <div style={{
                width: '9px', height: '9px',
                background: sidebarMode === 'accidents' ? '#ef4444' : '#666',
                borderRadius: '2px', marginBottom: '3px',
                boxShadow: sidebarMode === 'accidents' ? '0 0 6px rgba(239,68,68,0.7)' : 'none',
                transition: 'all 0.15s',
              }} />
              <span style={{ fontSize: '0.56rem', color: sidebarMode === 'accidents' ? '#ef4444' : 'var(--text-secondary)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>
                Accidents
              </span>
            </button>

            {/* Vertical divider */}
            <div style={{ width: '1px', height: '28px', background: 'var(--border)', marginRight: '8px' }} />

            {/* MEWP button */}
            <button
              onClick={() => onModeChange('mewp')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 4px 4px 0', borderRadius: '4px',
                opacity: sidebarMode === 'mewp' ? 1 : 0.45,
                transition: 'opacity 0.15s',
              }}
              title="Switch sidebar to MEWP"
            >
              <div style={{
                width: '9px', height: '9px',
                background: sidebarMode === 'mewp' ? '#06b6d4' : '#666',
                borderRadius: '2px', marginBottom: '3px',
                boxShadow: sidebarMode === 'mewp' ? '0 0 6px rgba(6,182,212,0.7)' : 'none',
                transition: 'all 0.15s',
              }} />
              <span style={{ fontSize: '0.56rem', color: sidebarMode === 'mewp' ? '#06b6d4' : 'var(--text-secondary)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>
                MEWP
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '99px',
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#22c55e', letterSpacing: '0.04em' }}>LIVE</span>
        </div>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleOpen}
            style={{
              position: 'relative', background: 'none', border: 'none',
              color: unread > 0 ? '#FF9900' : 'var(--text-secondary)',
              cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#FF9900', color: '#000',
                fontSize: '0.55rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          {open && (
            <>
              {/* Backdrop */}
              <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={() => setOpen(false)} />
              {/* Dropdown */}
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                width: '320px', background: 'var(--bg-surface)',
                border: '1px solid var(--border)', borderRadius: '10px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.5)', zIndex: 49, overflow: 'hidden',
              }}>
                <div style={{
                  padding: '10px 14px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button onClick={onClearNotifications}
                      style={{ background: 'none', border: 'none', fontSize: '0.68rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Clear all
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 14px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    No notifications yet
                  </div>
                ) : (
                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{
                        padding: '10px 14px', borderBottom: '1px solid rgba(42,48,64,0.5)',
                        background: n.read ? 'none' : 'rgba(255,153,0,0.04)',
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                      }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(255,153,0,0.12)', border: '1px solid rgba(255,153,0,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <MessageSquare size={13} color="#FF9900" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF9900', fontFamily: 'monospace' }}>
                              {n.woId}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{timeAgo(n.ts)}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                            <strong>{n.author}</strong> added a note
                          </div>
                          <div style={{
                            fontSize: '0.72rem', color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            "{n.preview}"
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="mobile-menu-btn"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
