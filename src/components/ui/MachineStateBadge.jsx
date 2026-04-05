// Color-coded machine state badge

const STATE_STYLES = {
  Operational: {
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.35)',
    color: '#22c55e',
    dot: '#22c55e',
    pulse: true,
  },
  Degraded: {
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    color: '#f59e0b',
    dot: '#f59e0b',
  },
  Down: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    color: '#ef4444',
    dot: '#ef4444',
  },
  Maintenance: {
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.35)',
    color: '#818cf8',
    dot: '#6366f1',
  },
  Unknown: {
    bg: 'rgba(107, 114, 128, 0.12)',
    border: 'rgba(107, 114, 128, 0.35)',
    color: '#9ca3af',
    dot: '#6b7280',
  },
};

export default function MachineStateBadge({ state, size = 'sm' }) {
  const style = STATE_STYLES[state] || STATE_STYLES.Unknown;
  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '0.68rem' : '0.78rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        borderRadius: '4px',
        padding,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
      aria-label={`Machine state: ${state}`}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: style.dot,
          flexShrink: 0,
        }}
      />
      {state}
    </span>
  );
}
