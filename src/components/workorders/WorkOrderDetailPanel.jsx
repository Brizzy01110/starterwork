import { useState } from 'react';
import { X, ChevronRight, AlertTriangle, Wrench, CheckCircle, ArrowUpCircle, Bell } from 'lucide-react';
import PriorityBadge from '../ui/PriorityBadge.jsx';
import MachineStateBadge from '../ui/MachineStateBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import TechNoteTimeline from './TechNoteTimeline.jsx';
import { formatDateTime, formatDate } from '../../utils/formatters.js';
import { TECHNICIANS, PRIORITIES, MACHINE_STATES, STATUSES } from '../../data/mockWorkOrders.js';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '10px',
          paddingBottom: '6px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '5px 0',
        borderBottom: '1px solid rgba(42,48,64,0.5)',
      }}
    >
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', textAlign: 'right' }}>{children}</span>
    </div>
  );
}

export default function WorkOrderDetailPanel({ workOrder, onClose, onUpdate, onAddNote, onToast }) {
  const [editingField, setEditingField] = useState(null);
  const [fieldVal, setFieldVal] = useState('');

  if (!workOrder) return null;

  function startEdit(field, currentVal) {
    setEditingField(field);
    setFieldVal(currentVal);
  }

  function commitEdit(field) {
    onUpdate(workOrder.id, { [field]: fieldVal });
    setEditingField(null);
  }

  function handleAction(action) {
    switch (action) {
      case 'close':
        onUpdate(workOrder.id, { status: 'Resolved', machineState: 'Operational' });
        onToast('Work order closed and marked resolved.', 'success');
        break;
      case 'escalate':
        onUpdate(workOrder.id, { priority: 'Critical' });
        onToast('Work order escalated to Critical priority.', 'info');
        break;
      case 'notify':
        onToast(`Technician ${workOrder.assignedTech} has been notified.`, 'info');
        break;
      default:
        break;
    }
  }

  const inlineSelectStyle = {
    padding: '4px 8px',
    background: 'var(--bg-elevated)',
    border: '1px solid #FF9900',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    outline: 'none',
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 30,
        }}
        className="fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(580px, 100vw)',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
        className="slide-in-right"
        role="region"
        aria-label="Work order details"
      >
        {/* Panel header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span
                className="font-mono"
                style={{ fontSize: '0.8rem', color: '#FF9900', fontWeight: 700 }}
              >
                {workOrder.id}
              </span>
              <ChevronRight size={12} color="var(--text-secondary)" />
              <span
                className="font-mono"
                style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
              >
                {workOrder.machineId}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                {workOrder.machineType}
              </span>
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {workOrder.issueTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close detail panel"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Badges row */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          <PriorityBadge priority={workOrder.priority} size="md" />
          <MachineStateBadge state={workOrder.machineState} size="md" />
          <StatusBadge status={workOrder.status} size="md" />
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => handleAction('close')}
            disabled={workOrder.status === 'Resolved'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              background: workOrder.status === 'Resolved' ? 'var(--bg-elevated)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${workOrder.status === 'Resolved' ? 'var(--border)' : 'rgba(34,197,94,0.35)'}`,
              borderRadius: '6px',
              color: workOrder.status === 'Resolved' ? 'var(--text-secondary)' : '#22c55e',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: workOrder.status === 'Resolved' ? 'not-allowed' : 'pointer',
            }}
          >
            <CheckCircle size={13} />
            Close WO
          </button>
          <button
            onClick={() => handleAction('escalate')}
            disabled={workOrder.priority === 'Critical'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              background: workOrder.priority === 'Critical' ? 'var(--bg-elevated)' : 'rgba(255,59,59,0.1)',
              border: `1px solid ${workOrder.priority === 'Critical' ? 'var(--border)' : 'rgba(255,59,59,0.35)'}`,
              borderRadius: '6px',
              color: workOrder.priority === 'Critical' ? 'var(--text-secondary)' : '#ff3b3b',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: workOrder.priority === 'Critical' ? 'not-allowed' : 'pointer',
            }}
          >
            <ArrowUpCircle size={13} />
            Escalate
          </button>
          <button
            onClick={() => handleAction('notify')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              background: 'rgba(255,153,0,0.1)',
              border: '1px solid rgba(255,153,0,0.35)',
              borderRadius: '6px',
              color: '#FF9900',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Bell size={13} />
            Notify Tech
          </button>
        </div>

        {/* Main content */}
        <div style={{ padding: '16px 20px', flex: 1 }}>
          {/* Details section */}
          <Section title="Work Order Details">
            <InfoRow label="Status">
              {editingField === 'status' ? (
                <select
                  value={fieldVal}
                  onChange={(e) => setFieldVal(e.target.value)}
                  onBlur={() => commitEdit('status')}
                  autoFocus
                  style={inlineSelectStyle}
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <button
                  onClick={() => startEdit('status', workOrder.status)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <StatusBadge status={workOrder.status} size="sm" />
                </button>
              )}
            </InfoRow>
            <InfoRow label="Priority">
              {editingField === 'priority' ? (
                <select
                  value={fieldVal}
                  onChange={(e) => setFieldVal(e.target.value)}
                  onBlur={() => commitEdit('priority')}
                  autoFocus
                  style={inlineSelectStyle}
                >
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              ) : (
                <button
                  onClick={() => startEdit('priority', workOrder.priority)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <PriorityBadge priority={workOrder.priority} size="sm" />
                </button>
              )}
            </InfoRow>
            <InfoRow label="Machine State">
              {editingField === 'machineState' ? (
                <select
                  value={fieldVal}
                  onChange={(e) => setFieldVal(e.target.value)}
                  onBlur={() => commitEdit('machineState')}
                  autoFocus
                  style={inlineSelectStyle}
                >
                  {MACHINE_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <button
                  onClick={() => startEdit('machineState', workOrder.machineState)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <MachineStateBadge state={workOrder.machineState} size="sm" />
                </button>
              )}
            </InfoRow>
            <InfoRow label="Assigned Tech">
              {editingField === 'assignedTech' ? (
                <select
                  value={fieldVal}
                  onChange={(e) => setFieldVal(e.target.value)}
                  onBlur={() => commitEdit('assignedTech')}
                  autoFocus
                  style={inlineSelectStyle}
                >
                  {TECHNICIANS.map((t) => <option key={t}>{t}</option>)}
                </select>
              ) : (
                <button
                  onClick={() => startEdit('assignedTech', workOrder.assignedTech)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    textDecoration: 'underline dotted',
                  }}
                >
                  {workOrder.assignedTech}
                </button>
              )}
            </InfoRow>
            <InfoRow label="Created">{formatDateTime(workOrder.createdAt)}</InfoRow>
            <InfoRow label="Last Updated">{formatDateTime(workOrder.updatedAt)}</InfoRow>
            {workOrder.estimatedResolution && (
              <InfoRow label="Est. Resolution">{formatDateTime(workOrder.estimatedResolution)}</InfoRow>
            )}
          </Section>

          {/* Problem description */}
          <Section title="Problem Description">
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                lineHeight: 1.65,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px',
              }}
            >
              {workOrder.problemDescription}
            </p>
          </Section>

          {/* Error codes */}
          {workOrder.errorCodes && workOrder.errorCodes.length > 0 && (
            <Section title="Error Codes">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {workOrder.errorCodes.map((code) => (
                  <span
                    key={code}
                    className="font-mono"
                    style={{
                      padding: '3px 8px',
                      background: 'rgba(255,59,59,0.1)',
                      border: '1px solid rgba(255,59,59,0.25)',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      color: '#ff8080',
                    }}
                  >
                    {code}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Attachments placeholder */}
          <Section title="Attachments">
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: '6px',
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
              }}
            >
              <Wrench size={20} style={{ marginBottom: '6px', opacity: 0.4 }} />
              <div>Photo uploads and error log attachments</div>
              <div style={{ fontSize: '0.72rem', marginTop: '4px', opacity: 0.6 }}>Connect to file storage API to enable</div>
            </div>
          </Section>

          {/* Tech notes timeline */}
          <Section title="Activity Timeline">
            <TechNoteTimeline
              workOrderId={workOrder.id}
              notes={workOrder.notes || []}
              onAddNote={onAddNote}
            />
          </Section>
        </div>
      </div>
    </>
  );
}
