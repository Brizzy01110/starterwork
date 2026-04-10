import { useState } from 'react';
import { Zap, Menu, X, Bell, MessageSquare, HelpCircle, Send, Loader, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// ─── Formspree endpoint ───────────────────────────────────────────────────────
// 1. Go to https://formspree.io  →  sign up (free)
// 2. Create a new form, set the destination email to grebryson@glob-mts.net
// 3. Copy the form ID (e.g. "xpwzjqkb") and replace REPLACE_WITH_FORM_ID below
const FORMSPREE_URL = 'https://formspree.io/f/mgopbgyp';
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Header({ onMenuToggle, menuOpen, notifications = [], onClearNotifications, sidebarMode = 'overview', onModeChange, connStatus = 'connecting', lastRefreshed = null, onManualRefresh, onOpenAlerts }) {
  const [open, setOpen] = useState(false);
  const [itOpen, setItOpen] = useState(false);
  const [itName, setItName] = useState('');
  const [itTitle, setItTitle] = useState('');
  const [itDesc, setItDesc] = useState('');
  const [itStatus, setItStatus] = useState('idle'); // idle | sending | success | error
  const unread = notifications.filter((n) => !n.read).length;

  async function handleItSubmit(e) {
    e.preventDefault();
    setItStatus('sending');
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          technician: itName,
          subject: `[IT Request] ${itTitle}`,
          message: itDesc,
          _replyto: 'noreply@glob-mts.net',
        }),
      });
      if (res.ok) {
        setItStatus('success');
        setTimeout(() => { setItOpen(false); setItName(''); setItTitle(''); setItDesc(''); setItStatus('idle'); }, 2400);
      } else {
        setItStatus('error');
      }
    } catch {
      setItStatus('error');
    }
  }

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

          {/* Main title + IT button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>MT Services</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>Active Work Orders · System Status · Downtime Alerts</span>
            </div>
            <button
              onClick={() => setItOpen(true)}
              title="Submit an IT support ticket"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '3px 8px', borderRadius: '5px',
                background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.3)',
                color: '#818cf8', fontSize: '0.65rem', fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(129,140,248,0.22)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(129,140,248,0.12)'; }}
            >
              <HelpCircle size={11} />
              IT
            </button>
          </div>

          {/* Subtitle group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px', paddingLeft: '6px', borderLeft: '1px solid var(--border)' }}>

            <button
              onClick={() => onModeChange('overview')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                background: 'none', border: 'none', cursor: 'pointer',
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

            <div style={{ width: '1px', height: '28px', background: 'var(--border)', marginRight: '8px' }} />

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

            <div style={{ width: '1px', height: '28px', background: 'var(--border)', marginRight: '8px' }} />

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

            <div style={{ width: '1px', height: '28px', background: 'var(--border)', marginRight: '8px' }} />

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
        {/* Alert settings button */}
        <button
          onClick={onOpenAlerts}
          title="Alert settings"
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FF9900'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Bell size={16} />
        </button>

        {/* Real-time connection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onManualRefresh}
            title="Refresh now"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '3px', display: 'flex', borderRadius: '4px' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <RefreshCw size={13} />
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px',
            background: connStatus === 'connected' ? 'rgba(34,197,94,0.1)' : connStatus === 'connecting' ? 'rgba(255,153,0,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${connStatus === 'connected' ? 'rgba(34,197,94,0.2)' : connStatus === 'connecting' ? 'rgba(255,153,0,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '99px',
            cursor: 'default',
          }}
            title={lastRefreshed ? `Last updated: ${lastRefreshed.toLocaleTimeString()}` : 'Connecting…'}
          >
            {connStatus === 'connected' ? (
              <Wifi size={11} color="#22c55e" />
            ) : connStatus === 'connecting' ? (
              <Loader size={11} color="#FF9900" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <WifiOff size={11} color="#ef4444" />
            )}
            <span style={{
              fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em',
              color: connStatus === 'connected' ? '#22c55e' : connStatus === 'connecting' ? '#FF9900' : '#ef4444',
            }}>
              {connStatus === 'connected' ? 'LIVE' : connStatus === 'connecting' ? 'SYNC…' : 'OFFLINE'}
            </span>
          </div>
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
              <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={() => setOpen(false)} />
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
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
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
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF9900', fontFamily: 'monospace' }}>{n.woId}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{timeAgo(n.ts)}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                            <strong>{n.author}</strong> added a note
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

      {/* ── IT Support Request Modal ── */}
      {itOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} onClick={() => { setItOpen(false); setItStatus('idle'); }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '440px', maxWidth: '94vw',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.65)',
            zIndex: 201, overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '1px solid var(--border)',
              background: 'rgba(129,140,248,0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={16} color="#818cf8" />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>IT Support Ticket</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '1px' }}>Submits directly to grebryson@glob-mts.net</div>
                </div>
              </div>
              <button onClick={() => { setItOpen(false); setItStatus('idle'); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}>
                <X size={16} />
              </button>
            </div>

            {/* Success state */}
            {itStatus === 'success' ? (
              <div style={{ padding: '44px 18px', textAlign: 'center' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                }}>
                  <Send size={22} color="#818cf8" />
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Ticket Submitted!</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Your request has been sent to IT.</div>
              </div>
            ) : (
              <form onSubmit={handleItSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Technician name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                    Technician Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itName}
                    onChange={(e) => setItName(e.target.value)}
                    placeholder="Your full name"
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '7px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#818cf8'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>

                {/* Issue title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                    Issue Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itTitle}
                    onChange={(e) => setItTitle(e.target.value)}
                    placeholder="e.g. Scanner offline, System login error…"
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '7px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#818cf8'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                    Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    required
                    value={itDesc}
                    onChange={(e) => setItDesc(e.target.value)}
                    placeholder="Describe the issue — what happened, when it started, which machine or system is affected…"
                    rows={5}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '7px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none',
                      resize: 'vertical', fontFamily: 'inherit',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#818cf8'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>

                {/* Not configured warning */}
                {FORMSPREE_URL.includes('REPLACE_WITH_FORM_ID') && (
                  <div style={{
                    padding: '9px 12px', borderRadius: '7px',
                    background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.3)',
                    fontSize: '0.75rem', color: '#f5c518', lineHeight: 1.5,
                  }}>
                    <strong>Setup needed:</strong> Go to <span style={{ fontFamily: 'monospace' }}>formspree.io</span>, create a free form pointed at <span style={{ fontFamily: 'monospace' }}>grebryson@glob-mts.net</span>, then paste your form ID into <span style={{ fontFamily: 'monospace' }}>Header.jsx</span> line 7.
                  </div>
                )}

                {/* Error banner */}
                {itStatus === 'error' && !FORMSPREE_URL.includes('REPLACE_WITH_FORM_ID') && (
                  <div style={{
                    padding: '9px 12px', borderRadius: '7px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    fontSize: '0.78rem', color: '#ef4444',
                  }}>
                    Submission failed. Please try again.
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '2px' }}>
                  <button
                    type="submit"
                    disabled={itStatus === 'sending' || FORMSPREE_URL.includes('REPLACE_WITH_FORM_ID')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '9px 18px', borderRadius: '7px',
                      background: (itStatus === 'sending' || FORMSPREE_URL.includes('REPLACE_WITH_FORM_ID')) ? 'rgba(129,140,248,0.4)' : '#818cf8',
                      border: 'none', color: '#fff', fontSize: '0.84rem', fontWeight: 700,
                      cursor: (itStatus === 'sending' || FORMSPREE_URL.includes('REPLACE_WITH_FORM_ID')) ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (itStatus !== 'sending' && !FORMSPREE_URL.includes('REPLACE_WITH_FORM_ID')) e.currentTarget.style.background = '#6366f1'; }}
                    onMouseLeave={(e) => { if (itStatus !== 'sending' && !FORMSPREE_URL.includes('REPLACE_WITH_FORM_ID')) e.currentTarget.style.background = '#818cf8'; }}
                  >
                    {itStatus === 'sending' ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                    {itStatus === 'sending' ? 'Sending…' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
