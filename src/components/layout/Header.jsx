import { useState, useEffect } from 'react';
import { Zap, Menu, X, Bell, MessageSquare, HelpCircle, Send, Loader, RefreshCw, Wifi, WifiOff, Compass, LogOut, Download } from 'lucide-react';
import { ROLE_COLORS, ROLE_LABELS } from '../../hooks/useAuth.js';

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

export default function Header({ onMenuToggle, menuOpen, notifications = [], onClearNotifications, sidebarMode = 'overview', onModeChange, connStatus = 'connecting', lastRefreshed = null, onManualRefresh, onOpenAlerts, onOpenTour, currentUser, onLogout }) {
  const [open, setOpen] = useState(false);
  const [itOpen, setItOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  // Detect platform for tailored instructions
  const ua = navigator.userAgent;
  const isIOS     = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  const isSafari  = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault();
      setInstallPrompt(e);
    }
    function onAppInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);
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
              <span className="header-logo-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>MT Services</span>
              <span className="header-subtitle" style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>Active Work Orders · System Status · Downtime Alerts</span>
            </div>
            <button
              onClick={() => setItOpen(true)}
              title="Submit an IT support ticket"
              className="header-it-support"
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
          <div className="header-mode-group" style={{ display: 'flex', alignItems: 'center', gap: '0px', paddingLeft: '6px', borderLeft: '1px solid var(--border)' }}>

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
        {/* Install App — always visible unless already running as installed app */}
        {!isInStandaloneMode && !installed && (
          <button
            id="pwa-install-btn"
            className="header-install-btn"
            onClick={async () => {
              if (installPrompt) {
                // Android / Chrome / Edge — native prompt available
                installPrompt.prompt();
                const { outcome } = await installPrompt.userChoice;
                if (outcome === 'accepted') setInstalled(true);
                setInstallPrompt(null);
              } else {
                // iOS or fallback — show instructions modal
                setInstallOpen(true);
              }
            }}
            title="Install MT Services as an app"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '5px',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#22c55e', fontSize: '0.65rem', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }}
          >
            <Download size={11} />
            <span className="header-conn-label">Install App</span>
          </button>
        )}

        {/* Tour button */}
        <button
          onClick={onOpenTour}
          title="Take a tour"
          className="header-tour-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '5px',
            background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.25)',
            color: '#FF9900', fontSize: '0.65rem', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,153,0,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,153,0,0.1)'; }}
        >
          <Compass size={11} />
          <span className="header-conn-label">Tour</span>
        </button>

        {/* Alert settings button */}
        <button
          onClick={onOpenAlerts}
          title="Alert settings"
          className="header-it-btn"
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FF9900'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Bell size={16} />
        </button>

        {/* Real-time connection status */}
        <div className="header-conn-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            <span className="header-conn-label" style={{
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
                position: 'fixed', top: '54px', right: '8px',
                width: 'min(320px, calc(100vw - 16px))', background: 'var(--bg-surface)',
                border: '1px solid var(--border)', borderRadius: '10px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.12)', zIndex: 49, overflow: 'hidden',
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
                        padding: '10px 14px', borderBottom: '1px solid var(--border)',
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

        {/* User badge + logout */}
        {currentUser && (
          <div className="header-user-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '4px 10px', borderRadius: '8px',
              background: `${ROLE_COLORS[currentUser.role]}10`,
              border: `1px solid ${ROLE_COLORS[currentUser.role]}33`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }} className="header-conn-label">
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: ROLE_COLORS[currentUser.role], textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                  {ROLE_LABELS[currentUser.role]}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              className="header-logout-btn"
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px', display: 'flex', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="mobile-menu-btn"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Install App Modal ── */}
      {installOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} onClick={() => setInstallOpen(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '420px', maxWidth: '94vw',
            background: 'var(--bg-surface)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '14px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            zIndex: 201, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'rgba(34,197,94,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '9px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={17} color="#000" />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Install MT Services</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '1px' }}>Add to your home screen — works like a native app</div>
                </div>
              </div>
              <button onClick={() => setInstallOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* iOS / Safari */}
              <div style={{ borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', background: 'rgba(0,122,255,0.06)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🍎</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>iPhone / iPad (Safari)</span>
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { n: 1, text: 'Open this page in Safari (not Chrome)' },
                    { n: 2, text: 'Tap the Share button at the bottom of the screen  ↑' },
                    { n: 3, text: 'Scroll down and tap "Add to Home Screen"' },
                    { n: 4, text: 'Tap "Add" in the top-right corner' },
                  ].map(({ n, text }) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,122,255,0.12)', border: '1px solid rgba(0,122,255,0.25)', color: '#007AFF', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.55, paddingTop: '2px' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Android */}
              <div style={{ borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', background: 'rgba(52,168,83,0.06)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🤖</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Android (Chrome)</span>
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { n: 1, text: 'Open this page in Chrome' },
                    { n: 2, text: 'Tap the three-dot menu  ⋮  in the top-right' },
                    { n: 3, text: 'Tap "Add to Home screen"' },
                    { n: 4, text: 'Tap "Add" to confirm' },
                  ].map(({ n, text }) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(52,168,83,0.12)', border: '1px solid rgba(52,168,83,0.25)', color: '#34A853', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.55, paddingTop: '2px' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Windows */}
              <div style={{ borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', background: 'rgba(0,120,212,0.06)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🪟</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Windows (Chrome or Edge)</span>
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { n: 1, text: 'Open this page in Chrome or Edge' },
                    { n: 2, text: 'Click the install icon  ⊕  in the address bar (right side)' },
                    { n: 3, text: 'Click "Install" in the popup' },
                    { n: 4, text: 'MT Services opens as its own desktop window' },
                  ].map(({ n, text }) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,120,212,0.12)', border: '1px solid rgba(0,120,212,0.25)', color: '#0078D4', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.55, paddingTop: '2px' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ── IT Support Request Modal ── */}
      {itOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} onClick={() => { setItOpen(false); setItStatus('idle'); }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '440px', maxWidth: '94vw',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Hamburger: hidden on desktop, visible on mobile */
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; align-items: center; }
        }

        @media (max-width: 640px) {
          .header-mode-group  { display: none !important; }
          .header-subtitle    { display: none !important; }
          .header-conn-label  { display: none !important; }
          .header-it-support  { display: none !important; }
        }
        @media (max-width: 480px) {
          .header-install-btn { display: none !important; }
          .header-tour-btn    { display: none !important; }
          .header-it-btn      { display: none !important; }
          .header-conn-wrap   { display: none !important; }
          .header-user-badge  { display: none !important; }
          .header-logout-btn  { display: none !important; }
        }
        @media (max-width: 430px) {
          header { padding: 0 10px !important; }
          .header-logo-title { font-size: 0.88rem !important; }
        }
      `}</style>
    </header>
  );
}
