import MachineStateCard from './MachineStateCard.jsx';
import { Activity, AlertTriangle, WrenchIcon, HelpCircle, CheckCircle2 } from 'lucide-react';

const COLUMNS = [
  {
    state: 'Down',
    label: 'Down',
    icon: AlertTriangle,
    color: '#ef4444',
    border: 'rgba(239,68,68,0.25)',
    bg: 'rgba(239,68,68,0.04)',
  },
  {
    state: 'Degraded',
    label: 'Degraded',
    icon: Activity,
    color: '#f59e0b',
    border: 'rgba(245,158,11,0.25)',
    bg: 'rgba(245,158,11,0.04)',
  },
  {
    state: 'Maintenance',
    label: 'Maintenance',
    icon: WrenchIcon,
    color: '#6366f1',
    border: 'rgba(99,102,241,0.25)',
    bg: 'rgba(99,102,241,0.04)',
  },
  {
    state: 'Unknown',
    label: 'Unknown',
    icon: HelpCircle,
    color: '#6b7280',
    border: 'rgba(107,114,128,0.25)',
    bg: 'rgba(107,114,128,0.04)',
  },
  {
    state: 'Operational',
    label: 'Operational',
    icon: CheckCircle2,
    color: '#22c55e',
    border: 'rgba(34,197,94,0.25)',
    bg: 'rgba(34,197,94,0.04)',
  },
];

function getMachinesInState(workOrders, state) {
  // Collect unique machines in this state
  const machineMap = new Map();
  workOrders.forEach((wo) => {
    if (wo.machineState === state) {
      if (!machineMap.has(wo.machineId)) {
        machineMap.set(wo.machineId, { machineId: wo.machineId, machineType: wo.machineType });
      }
    }
  });
  return [...machineMap.values()];
}

export default function MachineStateBoard({ workOrders, onCardClick }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        alignItems: 'start',
      }}
    >
      {COLUMNS.map((col) => {
        const machines = getMachinesInState(workOrders, col.state);
        const Icon = col.icon;

        return (
          <div
            key={col.state}
            style={{
              background: col.bg,
              border: `1px solid ${col.border}`,
              borderRadius: '10px',
              padding: '12px',
              minHeight: '120px',
            }}
          >
            {/* Column header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={13} color={col.color} />
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: col.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {col.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: col.color,
                  background: `${col.color}22`,
                  border: `1px solid ${col.color}44`,
                  borderRadius: '99px',
                  padding: '1px 8px',
                }}
              >
                {machines.length}
              </span>
            </div>

            {/* Machine cards */}
            {machines.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px 8px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  opacity: 0.6,
                }}
              >
                No machines
              </div>
            ) : (
              machines.map((machine) => (
                <MachineStateCard
                  key={machine.machineId}
                  machineId={machine.machineId}
                  machineType={machine.machineType}
                  workOrders={workOrders}
                  onCardClick={onCardClick}
                />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
