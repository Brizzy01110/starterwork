import { Cpu, AlertTriangle } from 'lucide-react';
import PriorityBadge from '../ui/PriorityBadge.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function MachineStateCard({ machineId, machineType, workOrders, onCardClick }) {
  const activeWOs = workOrders.filter((wo) => wo.machineId === machineId && wo.status !== 'Resolved');
  const latestWO = workOrders
    .filter((wo) => wo.machineId === machineId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

  const criticalWO = activeWOs.find((wo) => wo.priority === 'Critical');
  const highestPriority = criticalWO || activeWOs.find((wo) => wo.priority === 'High') || activeWOs[0];

  return (
    <div
      onClick={() => latestWO && onCardClick(latestWO)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${criticalWO ? 'rgba(255,59,59,0.3)' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '12px',
        cursor: latestWO ? 'pointer' : 'default',
        transition: 'border-color 0.15s, background 0.15s',
        marginBottom: '8px',
      }}
      onMouseEnter={(e) => { if (latestWO) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
      onMouseLeave={(e) => { if (latestWO) e.currentTarget.style.background = 'var(--bg-surface)'; }}
      role={latestWO ? 'button' : undefined}
      tabIndex={latestWO ? 0 : undefined}
      onKeyDown={(e) => { if (latestWO && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onCardClick(latestWO); } }}
      aria-label={`${machineId} - ${activeWOs.length} active work orders`}
    >
      {/* Machine ID + type */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={13} color="var(--text-secondary)" />
          <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {machineId}
          </span>
        </div>
        {criticalWO && <AlertTriangle size={13} color="#ff3b3b" />}
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {machineType}
      </div>

      {/* WO count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          Active WOs:
        </span>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: activeWOs.length > 0 ? '#FF9900' : '#22c55e',
          }}
        >
          {activeWOs.length}
        </span>
      </div>

      {/* Highest priority badge */}
      {highestPriority && (
        <div style={{ marginBottom: '6px' }}>
          <PriorityBadge priority={highestPriority.priority} size="sm" />
        </div>
      )}

      {/* Latest issue */}
      {latestWO && (
        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            borderTop: '1px solid var(--border)',
            paddingTop: '6px',
            marginTop: '6px',
          }}
          title={latestWO.issueTitle}
        >
          {latestWO.issueTitle}
        </div>
      )}

      {/* Updated time */}
      {latestWO && (
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '3px', opacity: 0.7 }}>
          {formatRelativeTime(latestWO.updatedAt)}
        </div>
      )}
    </div>
  );
}
