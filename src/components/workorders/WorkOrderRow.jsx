import PriorityBadge from '../ui/PriorityBadge.jsx';
import MachineStateBadge from '../ui/MachineStateBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function WorkOrderRow({ workOrder, onClick, selected, onSelect }) {
  return (
    <tr
      onClick={onClick}
      style={{
        cursor: 'pointer',
        background: selected ? 'rgba(255,153,0,0.06)' : 'transparent',
      }}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      aria-label={`Work order ${workOrder.id}: ${workOrder.issueTitle}`}
    >
      {/* Checkbox */}
      <td style={{ width: '36px', paddingLeft: '12px' }} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select work order ${workOrder.id}`}
          style={{ cursor: 'pointer', accentColor: '#FF9900' }}
        />
      </td>

      {/* WO # */}
      <td>
        <span
          className="font-mono"
          style={{ fontSize: '0.78rem', color: '#FF9900', fontWeight: 600 }}
        >
          {workOrder.id}
        </span>
      </td>

      {/* Machine */}
      <td>
        <span
          className="font-mono"
          style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}
        >
          {workOrder.machineId}
        </span>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
          {workOrder.machineType}
        </div>
      </td>

      {/* Issue */}
      <td style={{ maxWidth: '240px' }}>
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '240px',
          }}
          title={workOrder.issueTitle}
        >
          {workOrder.issueTitle}
        </div>
        {workOrder.errorCodes && workOrder.errorCodes.length > 0 && (
          <span
            className="font-mono"
            style={{ fontSize: '0.65rem', color: '#ff8080', background: 'rgba(255,59,59,0.08)', padding: '1px 5px', borderRadius: '3px' }}
          >
            {workOrder.errorCodes[0]}
            {workOrder.errorCodes.length > 1 && ` +${workOrder.errorCodes.length - 1}`}
          </span>
        )}
      </td>

      {/* Priority */}
      <td><PriorityBadge priority={workOrder.priority} /></td>

      {/* Machine state */}
      <td><MachineStateBadge state={workOrder.machineState} /></td>

      {/* Status */}
      <td><StatusBadge status={workOrder.status} /></td>

      {/* Tech */}
      <td>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {workOrder.assignedTech}
        </span>
      </td>

      {/* Updated */}
      <td>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {formatRelativeTime(workOrder.updatedAt)}
        </span>
      </td>
    </tr>
  );
}
