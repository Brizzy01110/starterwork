import { useState } from 'react';
import { Zap, Menu, X, Bell, MessageSquare } from 'lucide-react';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Header({ onMenuToggle, menuOpen, notifications = [], onClearNotifications }) {
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
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            MT Services
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            Data Logs
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
