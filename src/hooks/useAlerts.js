import { useEffect, useRef, useCallback } from 'react';

// Top US carriers tried in parallel — only the right one delivers to the handset
const TOP_CARRIERS = ['vtext.com', 'txt.att.net', 'tmomail.net'];

const STORAGE_KEY = 'mts_alert_settings';
const FIRED_KEY   = 'mts_fired_alerts';
const PERM_KEY    = 'mts_sms_perm';

// ── Settings persistence ────────────────────────────────────────────────────
export function loadAlertSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultSettings(); }
  catch { return defaultSettings(); }
}
export function saveAlertSettings(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function defaultSettings() {
  return {
    pushEnabled:     false,
    emailEnabled:    false,
    smsEnabled:      false,
    alertEmail:      '',
    alertPhone:      '',
    formspreeId:     'REPLACE_WITH_FORM_ID',
    machineDown:     true,
    criticalCreated: true,
    highCreated:     true,
    overdueHours:    8,
    overdueEnabled:  true,
  };
}

// ── SMS permission helpers ─────────────────────────────────────────────────
export function loadSMSPerm() {
  try { return JSON.parse(localStorage.getItem(PERM_KEY)) || null; }
  catch { return null; }
}
export function saveSMSPerm(obj) {
  localStorage.setItem(PERM_KEY, JSON.stringify(obj));
}
function genToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

/**
 * Sends an opt-in permission request SMS to the given phone number.
 * Tries the top 3 US carriers in parallel — only the matching one delivers.
 * The message contains a tap-to-allow link and "Reply GO / NO" instructions.
 */
export async function sendSMSPermissionRequest(phone, formspreeId) {
  if (!phone || !formspreeId || formspreeId.includes('REPLACE')) {
    return { error: 'Phone number and Formspree ID are required.' };
  }
  const digits   = phone.replace(/\D/g, '');
  const token    = genToken();
  const appUrl   = window.location.origin;
  const allowUrl = `${appUrl}?sms_allow=${token}`;
  const denyUrl  = `${appUrl}?sms_deny=${token}`;

  saveSMSPerm({ token, phone: digits, status: 'pending', sentAt: Date.now() });

  const message =
    `MT Services: Allow maintenance alerts on this number?\n\n` +
    `✅ ALLOW: ${allowUrl}\n` +
    `❌ DENY:  ${denyUrl}\n\n` +
    `Or reply GO to allow / NO to decline.`;

  const results = await Promise.allSettled(
    TOP_CARRIERS.map((carrier) =>
      fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _replyto: `${digits}@${carrier}`,
          subject: 'MT Services: Allow Alerts?',
          message,
          alert_type: 'SMS_PERMISSION',
        }),
      })
    )
  );

  const ok = results.some((r) => r.status === 'fulfilled');
  return ok ? { token } : { error: 'Failed to send — check your Formspree ID.' };
}

// ── Fired-alert deduplication ──────────────────────────────────────────────
function loadFired() {
  try { return new Set(JSON.parse(localStorage.getItem(FIRED_KEY)) || []); }
  catch { return new Set(); }
}
function saveFired(set) {
  localStorage.setItem(FIRED_KEY, JSON.stringify([...set].slice(-200)));
}

// ── Notification helpers ───────────────────────────────────────────────────
function fireBrowserNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body, tag, icon: '/favicon.svg', badge: '/favicon.svg', requireInteraction: true,
  });
  setTimeout(() => n.close(), 12000);
}

async function sendEmailAlert(settings, subject, body) {
  if (!settings.formspreeId || settings.formspreeId.includes('REPLACE')) return;
  try {
    await fetch(`https://formspree.io/f/${settings.formspreeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _replyto: settings.alertEmail || 'noreply@glob-mts.net',
        subject,
        message: body,
        alert_type: 'AUTOMATED_ALERT',
      }),
    });
  } catch (e) { console.warn('Email alert failed:', e.message); }
}

/**
 * Sends alert SMS to the phone number via the top 3 carrier gateways in
 * parallel. Only the correct carrier delivers — others silently bounce.
 * Every message includes the app link and "Reply GO to acknowledge".
 */
async function sendSMSAlert(settings, subject, body) {
  if (!settings.alertPhone || !settings.formspreeId || settings.formspreeId.includes('REPLACE')) return;
  const digits = settings.alertPhone.replace(/\D/g, '');
  const appUrl = window.location.origin;

  const fullMsg =
    `🔔 ${subject}\n` +
    `${body}\n\n` +
    `View dashboard: ${appUrl}\n` +
    `Reply GO to acknowledge / NO to dismiss`;

  await Promise.allSettled(
    TOP_CARRIERS.map((carrier) =>
      fetch(`https://formspree.io/f/${settings.formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _replyto: `${digits}@${carrier}`,
          subject,
          message: fullMsg,
          alert_type: 'SMS_ALERT',
        }),
      }).catch(() => {})
    )
  );
}

// ── Main alert hook ────────────────────────────────────────────────────────
export function useAlerts(workOrders, settings) {
  const fired  = useRef(loadFired());
  const prevWOs = useRef([]);

  const dispatch = useCallback(async (id, title, body) => {
    if (fired.current.has(id)) return;
    fired.current.add(id);
    saveFired(fired.current);

    if (settings.pushEnabled) {
      fireBrowserNotification(`⚠ MT Services: ${title}`, body, id);
    }
    if (settings.emailEnabled && settings.alertEmail) {
      await sendEmailAlert(settings, `[MT Services Alert] ${title}`, body);
    }
    if (settings.smsEnabled && settings.alertPhone) {
      await sendSMSAlert(settings, `[MTS] ${title}`, body);
    }
  }, [settings]);

  useEffect(() => {
    const prev    = prevWOs.current;
    const prevIds = new Set(prev.map((w) => w.id));

    workOrders.forEach((wo) => {
      const isNew    = !prevIds.has(wo.id);
      const priority = (wo.priority || '').toLowerCase();

      if (settings.machineDown && wo.machineState === 'Down') {
        dispatch(`down-${wo.id}`, `Machine Down — ${wo.machineId}`, `${wo.machineId} is offline. WO ${wo.id}: ${wo.issueTitle}`);
      }
      if (isNew && settings.criticalCreated && priority === 'critical') {
        dispatch(`critical-${wo.id}`, `Critical Issue — ${wo.machineId}`, `WO ${wo.id}: ${wo.issueTitle}`);
      }
      if (isNew && settings.highCreated && priority === 'high') {
        dispatch(`high-${wo.id}`, `High Priority — ${wo.machineId}`, `WO ${wo.id}: ${wo.issueTitle}`);
      }
    });

    prevWOs.current = workOrders;
  }, [workOrders, dispatch, settings]);

  useEffect(() => {
    if (!settings.overdueEnabled) return;
    function checkOverdue() {
      const threshold = (settings.overdueHours || 8) * 3_600_000;
      workOrders
        .filter((w) => !['resolved', 'Resolved', 'closed'].includes(w.status))
        .forEach((wo) => {
          const age    = Date.now() - new Date(wo.createdAt).getTime();
          const dayKey = `overdue-${wo.id}-${new Date().toISOString().slice(0, 10)}`;
          if (age >= threshold) {
            dispatch(dayKey, `Overdue WO — ${wo.machineId}`, `WO ${wo.id} open for ${(age / 3_600_000).toFixed(1)}h: ${wo.issueTitle}`);
          }
        });
    }
    checkOverdue();
    const t = setInterval(checkOverdue, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [workOrders, settings, dispatch]);
}
