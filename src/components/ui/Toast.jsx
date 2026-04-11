import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#FF9900',
};

export function Toast({ id, message, type = 'info', onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const Icon = ICONS[type] || Info;

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(id), 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'var(--bg-elevated)',
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${COLORS[type]}`,
        borderRadius: '8px',
        padding: '12px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: '260px',
        maxWidth: '360px',
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
      }}
      className={exiting ? 'toast-exit' : 'toast-enter'}
    >
      <Icon size={16} color={COLORS[type]} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(id), 300); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: '2px' }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// Hook for managing toasts
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
