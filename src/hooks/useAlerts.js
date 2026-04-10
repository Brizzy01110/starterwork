import { useEffect, useRef, useCallback } from 'react';

// Carrier SMS email gateways
export const CARRIERS = [
  { label: 'Verizon',    gateway: 'vtext.com' },
  { label: 'AT&T',       gateway: 'txt.att.net' },
  { label: 'T-Mobile',   gateway: 'tmomail.net' },
  { label: 'Sprint',     gateway: 'messaging.sprintpcs.com' },
  { label: 'Metro PCS',  gateway: 'mymetropcs.com' },
  { label: 'US Cellular',gateway: 'email.uscc.net' },
  { label: 'Boost',      gateway: 'sms.myboostmobile.com' },
  { label: 'Cricket',    gateway: 'mms.cricketwireless.net' },
];

const STORAGE_KEY = 'mts_alert_settings';
const FIRED_KEY   = 'mts_fired_alerts';

export function loadAlertSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultSettings();
  } catch { return defaultSettings(); }
}

export function saveAlertSettings(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function defaultSettings() {
  return {
    pushEnabled:      false,
    emailEnabled:     false,
    smsEnabled:       false,
    alertEmail:       '',
    alertPhone:       '',
    alertCarrier:     'vtext.com',
    formspreeId:      'REPLACE_WITH_FORM_ID', // reuse IT form or create separate
    machineDown:      true,
    criticalCreated:  true,
    highCreated:      true,
    overdueHours:     8,   // alert if WO open > N hours
    overdueEnabled:   true,
  };
}

function loadFired() {
  try { return new Set(JSON.parse(localStorage.getItem(FIRED_KEY)) || []); }
  catch { return new Set(); }
}

function saveFired(set) {
  // Keep last 200 IDs to avoid unbounded growth
  const arr = [...set].slice(-200);
  localStorage.setItem(FIRED_KEY, JSON.stringify(arr));
}

async function requestPushPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function fireBrowserNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body,
    tag,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    requireInteraction: true,
  });
  // Auto-close after 12s
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
  } catch (e) {
    console.warn('Alert email failed:', e.message);
  }
}

async function sendSMSAlert(settings, subject, body) {
  if (!settings.alertPhone || !settings.alertCarrier || !settings.formspreeId || settings.formspreeId.includes('REPLACE')) return;
  const smsEmail = `${settings.alertPhone.replace(/\D/g, '')}@${settings.alertCarrier}`;
  try {
    await fetch(`https://formspree.io/f/${settings.formspreeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _replyto: smsEmail,
        subject,
        message: `${subject} — ${body}`,
        alert_type: 'SMS_ALERT',
      }),
    });
  } catch (e) {
    console.warn('SMS alert failed:', e.message);
  }
}

export function useAlerts(workOrders, settings) {
  const fired = useRef(loadFired());
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

  // Watch for new WOs and state changes
  useEffect(() => {
    const prev = prevWOs.current;
    const prevIds = new Set(prev.map((w) => w.id));

    workOrders.forEach((wo) => {
      const isNew = !prevIds.has(wo.id);
      const priority = (wo.priority || '').toLowerCase();

      // Machine down alert
      if (settings.machineDown && wo.machineState === 'Down') {
        dispatch(
          `down-${wo.id}`,
          `Machine Down — ${wo.machineId}`,
          `${wo.machineId} is offline. WO ${wo.id}: ${wo.issueTitle}`
        );
      }

      // Critical WO created
      if (isNew && settings.criticalCreated && priority === 'critical') {
        dispatch(
          `critical-${wo.id}`,
          `Critical Issue — ${wo.machineId}`,
          `WO ${wo.id}: ${wo.issueTitle}`
        );
      }

      // High priority WO created
      if (isNew && settings.highCreated && priority === 'high') {
        dispatch(
          `high-${wo.id}`,
          `High Priority Issue — ${wo.machineId}`,
          `WO ${wo.id}: ${wo.issueTitle}`
        );
      }
    });

    prevWOs.current = workOrders;
  }, [workOrders, dispatch, settings]);

  // Overdue check — runs every 5 minutes
  useEffect(() => {
    if (!settings.overdueEnabled) return;

    function checkOverdue() {
      const threshold = (settings.overdueHours || 8) * 3600000;
      workOrders
        .filter((w) => w.status !== 'resolved' && w.status !== 'Resolved' && w.status !== 'closed')
        .forEach((wo) => {
          const age = Date.now() - new Date(wo.createdAt).getTime();
          if (age >= threshold) {
            // Fire once per 24h cycle using a date-stamped key
            const dayKey = `overdue-${wo.id}-${new Date().toISOString().slice(0, 10)}`;
            dispatch(
              dayKey,
              `Overdue WO — ${wo.machineId}`,
              `WO ${wo.id} has been open for ${(age / 3600000).toFixed(1)}h: ${wo.issueTitle}`
            );
          }
        });
    }

    checkOverdue();
    const t = setInterval(checkOverdue, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [workOrders, settings, dispatch]);
}
