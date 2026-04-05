// Work order status badge

const STATUS_STYLES = {
  Open: {
    bg: 'rgba(255, 153, 0, 0.12)',
    border: 'rgba(255, 153, 0, 0.35)',
    color: '#FF9900',
  },
  'In Progress': {
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.35)',
    color: '#818cf8',
  },
  Resolved: {
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.35)',
    color: '#22c55e',
  },
  'Pending Parts': {
    bg: 'rgba(245, 197, 24, 0.12)',
    border: 'rgba(245, 197, 24, 0.35)',
    color: '#f5c518',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Open;
  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '0.68rem' : '0.78rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        borderRadius: '4px',
        padding,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}
