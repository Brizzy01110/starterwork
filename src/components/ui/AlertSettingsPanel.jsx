import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Shield, CheckCircle2, X, AlertTriangle, Clock, Zap, Send, RefreshCw } from 'lucide-react';
import { saveAlertSettings, loadAlertSettings, sendSMSPermissionRequest, loadSMSPerm } from '../../hooks/useAlerts.js';

export default function AlertSettingsPanel({ onClose }) {
  const [s, setS] = useState(loadAlertSettings);
  const [saved, setSaved] = useState(false);
  const [pushStatus, setPushStatus] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [permState, setPermState] = useState(() => loadSMSPerm());
  const [permSending, setPermSending] = useState(false);
  const [permError, setPermError] = useState('');

  function set(key, val) { setS((prev) => ({ ...prev, [key]: val })); }

  async function handleEnablePush() {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPushStatus(result);
    if (result === 'granted') set('pushEnabled', true);
  }

  async function handleRequestPerm() {
    setPermSending(true);
    setPermError('');
    const result = await sendSMSPermissionRequest(s.alertPhone, s.formspreeId);
    setPermSending(false);
    if (result.error) {
      setPermError(result.error);
    } else {
      setPermState(loadSMSPerm());
    }
  }

  function handleSave() {
    saveAlertSettings(s);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose?.(); }, 1400);
  }

  const pushColor = pushStatus === 'granted' ? '#22c55e' : pushStatus === 'denied' ? '#ef4444' : '#FF9900';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />

      <div style={{
        position: 'relative', width: '520px', maxWidth: '95vw', maxHeight: '90vh',
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: '14px', boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,153,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,153,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} color="#FF9900" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Alert Settings</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Push notifications, email & SMS alerts</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* ── PUSH NOTIFICATIONS ── */}
          <section style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Smartphone size={14} color="#818cf8" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Browser Push Notifications</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '10px', border: `1px solid ${pushColor}33` }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Browser Permission</div>
                <div style={{ fontSize: '0.68rem', color: pushColor, marginTop: '2px', fontWeight: 600 }}>
                  {pushStatus === 'granted' ? '✓ Granted — notifications active' : pushStatus === 'denied' ? '✗ Blocked — reset in browser settings' : pushStatus === 'unsupported' ? 'Not supported in this browser' : 'Not yet requested'}
                </div>
              </div>
              {pushStatus !== 'granted' && pushStatus !== 'denied' && pushStatus !== 'unsupported' && (
                <button onClick={handleEnablePush}
                  style={{ padding: '7px 14px', borderRadius: '6px', background: '#818cf8', border: 'none', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                  Enable
                </button>
              )}
              {pushStatus === 'granted' && <CheckCircle2 size={18} color="#22c55e" />}
            </div>

            <Toggle label="Send push notifications" value={s.pushEnabled && pushStatus === 'granted'} onChange={(v) => set('pushEnabled', v)} disabled={pushStatus !== 'granted'} />
          </section>

          {/* ── EMAIL ALERTS ── */}
          <section style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Mail size={14} color="#06b6d4" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Alerts</span>
            </div>
            <Toggle label="Send email alerts" value={s.emailEnabled} onChange={(v) => set('emailEnabled', v)} />
            {s.emailEnabled && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Field label="Alert Email Address" value={s.alertEmail} onChange={(v) => set('alertEmail', v)} placeholder="you@example.com" type="email" />
                <Field label="Formspree Form ID" value={s.formspreeId} onChange={(v) => set('formspreeId', v)} placeholder="e.g. xabcd123" />
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', padding: '6px 10px', background: 'rgba(6,182,212,0.06)', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.2)' }}>
                  Uses your Formspree form to send automated alert emails. Same form ID as the IT support ticket.
                </div>
              </div>
            )}
          </section>

          {/* ── SMS ALERTS ── */}
          <section style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <MessageSquare size={14} color="#22c55e" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>SMS Alerts</span>
            </div>
            <Toggle label="Send SMS text alerts" value={s.smsEnabled} onChange={(v) => set('smsEnabled', v)} />

            {s.smsEnabled && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* Phone number only — no carrier dropdown */}
                <Field
                  label="Phone Number"
                  value={s.alertPhone}
                  onChange={(v) => set('alertPhone', v)}
                  placeholder="10-digit number e.g. 5551234567"
                />

                {/* Permission status badge */}
                {permState && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '9px 12px', borderRadius: '8px',
                    background: permState.status === 'granted' ? 'rgba(34,197,94,0.08)' : permState.status === 'denied' ? 'rgba(239,68,68,0.08)' : 'rgba(255,153,0,0.08)',
                    border: `1px solid ${permState.status === 'granted' ? 'rgba(34,197,94,0.3)' : permState.status === 'denied' ? 'rgba(239,68,68,0.3)' : 'rgba(255,153,0,0.3)'}`,
                  }}>
                    {permState.status === 'granted'
                      ? <CheckCircle2 size={14} color="#22c55e" />
                      : permState.status === 'denied'
                      ? <X size={14} color="#ef4444" />
                      : <RefreshCw size={14} color="#FF9900" style={{ animation: 'spin-slow 3s linear infinite' }} />
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: permState.status === 'granted' ? '#22c55e' : permState.status === 'denied' ? '#ef4444' : '#FF9900' }}>
                        {permState.status === 'granted' ? 'Permission Granted — alerts active'
                          : permState.status === 'denied' ? 'Permission Denied — not sending'
                          : 'Awaiting response — link sent'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {permState.status === 'pending' ? 'Recipient needs to tap the link or reply GO' : `Phone: ${permState.phone}`}
                      </div>
                    </div>
                    {permState.status !== 'granted' && (
                      <button
                        onClick={handleRequestPerm}
                        disabled={permSending || !s.alertPhone || !s.formspreeId || s.formspreeId.includes('REPLACE')}
                        style={{ padding: '4px 10px', borderRadius: '5px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.68rem', cursor: 'pointer' }}>
                        Resend
                      </button>
                    )}
                  </div>
                )}

                {/* Request permission button — shown when no perm sent yet */}
                {!permState && (
                  <button
                    onClick={handleRequestPerm}
                    disabled={permSending || !s.alertPhone || !s.formspreeId || s.formspreeId.includes('REPLACE')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                      padding: '10px', borderRadius: '8px',
                      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)',
                      color: '#22c55e', fontSize: '0.8rem', fontWeight: 700,
                      cursor: permSending ? 'not-allowed' : 'pointer',
                      opacity: (!s.alertPhone || !s.formspreeId || s.formspreeId.includes('REPLACE')) ? 0.45 : 1,
                    }}
                  >
                    {permSending
                      ? <><RefreshCw size={14} style={{ animation: 'spin-slow 1s linear infinite' }} /> Sending…</>
                      : <><Send size={14} /> Send Permission Request</>
                    }
                  </button>
                )}

                {permError && (
                  <div style={{ fontSize: '0.72rem', color: '#ef4444', padding: '7px 10px', background: 'rgba(239,68,68,0.07)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {permError}
                  </div>
                )}

                {/* How it works */}
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', padding: '8px 11px', background: 'rgba(34,197,94,0.04)', borderRadius: '7px', border: '1px solid rgba(34,197,94,0.18)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>How it works: </strong>
                  Tap <em>Send Permission Request</em> to text the number a quick opt-in link.
                  The recipient taps <strong style={{ color: '#22c55e' }}>ALLOW</strong> (or replies <strong style={{ color: '#22c55e' }}>GO</strong>) to confirm,
                  or <strong style={{ color: '#ef4444' }}>DENY</strong> (or replies <strong style={{ color: '#ef4444' }}>NO</strong>) to decline.
                  Every alert includes a link back to the dashboard. No carrier selection needed.
                </div>
              </div>
            )}
          </section>

          {/* ── ALERT RULES ── */}
          <section style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Shield size={14} color="#FF9900" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alert Rules</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <RuleRow icon={Zap} color="#ef4444" label="Machine goes Down" value={s.machineDown} onChange={(v) => set('machineDown', v)} />
              <RuleRow icon={AlertTriangle} color="#dc2626" label="Critical priority WO created" value={s.criticalCreated} onChange={(v) => set('criticalCreated', v)} />
              <RuleRow icon={AlertTriangle} color="#f97316" label="High priority WO created" value={s.highCreated} onChange={(v) => set('highCreated', v)} />
              <RuleRow icon={Clock} color="#FF9900" label="Overdue work orders" value={s.overdueEnabled} onChange={(v) => set('overdueEnabled', v)} />
            </div>

            {s.overdueEnabled && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Alert if open longer than</span>
                <input type="number" min={1} max={72} value={s.overdueHours}
                  onChange={(e) => set('overdueHours', Number(e.target.value))}
                  style={{ width: '60px', padding: '5px 8px', borderRadius: '5px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', textAlign: 'center' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>hours</span>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave}
            style={{ padding: '8px 20px', borderRadius: '7px', background: saved ? '#22c55e' : '#FF9900', border: 'none', color: '#000', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}>
            {saved ? <><CheckCircle2 size={14} /> Saved!</> : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ fontSize: '0.82rem', color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{label}</span>
      <button onClick={() => !disabled && onChange(!value)}
        style={{
          width: '40px', height: '22px', borderRadius: '99px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: value && !disabled ? '#FF9900' : 'var(--bg-elevated)',
          position: 'relative', transition: 'background 0.2s', opacity: disabled ? 0.5 : 1,
          boxShadow: value && !disabled ? '0 0 8px rgba(255,153,0,0.4)' : 'none',
        }}>
        <div style={{
          width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '3px', transition: 'left 0.2s',
          left: value && !disabled ? '21px' : '3px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }} />
    </div>
  );
}

function RuleRow({ icon: Icon, color, label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--bg-elevated)', borderRadius: '7px', borderLeft: `3px solid ${value ? color : 'var(--border)'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={13} color={value ? color : 'var(--text-secondary)'} />
        <span style={{ fontSize: '0.8rem', color: value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
      </div>
      <button onClick={() => onChange(!value)}
        style={{
          width: '36px', height: '20px', borderRadius: '99px', border: 'none', cursor: 'pointer',
          background: value ? color : 'rgba(255,255,255,0.08)',
          position: 'relative', transition: 'background 0.2s',
          boxShadow: value ? `0 0 6px ${color}66` : 'none',
        }}>
        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: value ? '19px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  );
}
