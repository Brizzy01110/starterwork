// Color-coded priority badge component

const PRIORITY_STYLES = {
  Critical: {
    bg: 'rgba(255, 59, 59, 0.15)',
    border: 'rgba(255, 59, 59, 0.4)',
    color: '#ff5c5c',
    dot: '#ff3b3b',
  },
  High: {
    bg: 'rgba(255, 122, 0, 0.15)',
    border: 'rgba(255, 122, 0, 0.4)',
    color: '#ff8c2a',
    dot: '#ff7a00',
  },
  Medium: {
    bg: 'rgba(245, 197, 24, 0.12)',
    border: 'rgba(245, 197, 24, 0.35)',
    color: '#f5c518',
    dot: '#f5c518',
  },
  Low: {
    bg: 'rgba(76, 175, 142, 0.12)',
    border: 'rgba(76, 175, 142, 0.35)',
    color: '#4caf8e',
    dot: '#4caf8e',
  },
};

export default function PriorityBadge({ priority, size = 'sm' }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Low;
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
      aria-label={`Priority: ${priority}`}
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
      {priority}
    </span>
  );
}
