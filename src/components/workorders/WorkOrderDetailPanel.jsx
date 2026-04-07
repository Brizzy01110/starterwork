import { useState } from 'react';
import { X, ChevronRight, Wrench, CheckCircle, ArrowUpCircle, Bell, Trash2, Sparkles } from 'lucide-react';
import PriorityBadge from '../ui/PriorityBadge.jsx';
import MachineStateBadge from '../ui/MachineStateBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import TechNoteTimeline from './TechNoteTimeline.jsx';
import MachineSpecsSection from './MachineSpecsSection.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { TECHNICIANS, PRIORITIES, MACHINE_STATES, STATUSES } from '../../data/mockWorkOrders.js';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '5px 0', borderBottom: '1px solid rgba(42,48,64,0.5)' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', textAlign: 'right' }}>{children}</span>
    </div>
  );
}

function generateAISolution(machineType, machineId, issueTitle, problemDescription, similarIssues, machineSpec) {
  const total = similarIssues.length + 1;

  // --- Analyze notes across all similar work orders ---
  const allNotes = similarIssues.flatMap((wo) => wo.notes || []);
  const noteTexts = allNotes.map((n) => n.note?.toLowerCase() || '');
  const allText = [problemDescription?.toLowerCase() || '', ...noteTexts].join(' ');

  // Extract action words from notes (things techs did)
  const actionPatterns = [
    { pattern: /replaced?\s+([\w\s-]+)/gi, label: 'Replaced' },
    { pattern: /tightened?\s+([\w\s-]+)/gi, label: 'Tightened' },
    { pattern: /adjusted?\s+([\w\s-]+)/gi, label: 'Adjusted' },
    { pattern: /cleaned?\s+([\w\s-]+)/gi, label: 'Cleaned' },
    { pattern: /reset\s+([\w\s-]+)/gi, label: 'Reset' },
    { pattern: /calibrat\w+\s+([\w\s-]+)/gi, label: 'Calibrated' },
    { pattern: /lubricate?d?\s+([\w\s-]+)/gi, label: 'Lubricated' },
    { pattern: /rebooted?\s+([\w\s-]+)/gi, label: 'Rebooted' },
    { pattern: /updated?\s+([\w\s-]+)/gi, label: 'Updated' },
    { pattern: /inspected?\s+([\w\s-]+)/gi, label: 'Inspected' },
  ];

  const actionsFound = [];
  actionPatterns.forEach(({ pattern, label }) => {
    const matches = [...allText.matchAll(pattern)];
    matches.forEach((m) => {
      const item = m[1]?.trim().split(/\s+/).slice(0, 3).join(' ');
      if (item && item.length > 2) actionsFound.push(`${label} ${item}`);
    });
  });

  // Extract part numbers mentioned in notes (P/N, PN, #, model numbers)
  const partPattern = /(?:p\/n|pn|part\s*#?|model)\s*[:\-]?\s*([A-Z0-9][-A-Z0-9]{3,})/gi;
  const notedParts = [...allText.matchAll(partPattern)].map((m) => m[1]).filter(Boolean);

  // Resolution rate
  const resolvedCount = similarIssues.filter((wo) => wo.status === 'Resolved').length;
  const resolvedPct = Math.round(((resolvedCount + (issueTitle ? 0 : 1)) / total) * 100);

  // Tech who handled most
  const techCounts = {};
  similarIssues.forEach((wo) => { if (wo.assignedTech) techCounts[wo.assignedTech] = (techCounts[wo.assignedTech] || 0) + 1; });
  const topTech = Object.entries(techCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Most recent resolved note
  const resolvedWOs = similarIssues.filter((wo) => wo.status === 'Resolved' && wo.notes?.length > 0);
  const lastResolutionNote = resolvedWOs.length > 0
    ? resolvedWOs[resolvedWOs.length - 1].notes[resolvedWOs[resolvedWOs.length - 1].notes.length - 1]?.note
    : null;

  // --- Machine spec info ---
  const specLines = [];
  if (machineSpec) {
    if (machineSpec.voltage) specLines.push(`Voltage: ${machineSpec.voltage}`);
    if (machineSpec.motorSize) specLines.push(`Motor size: ${machineSpec.motorSize}`);
    if (machineSpec.phase) specLines.push(`Phase: ${machineSpec.phase}`);
    if (machineSpec.manufacturer) specLines.push(`Manufacturer: ${machineSpec.manufacturer}`);
    if (machineSpec.partNumbers?.length) specLines.push(`Cataloged parts: ${machineSpec.partNumbers.join(', ')}`);
  }

  // --- Root cause map per machine type ---
  const rootCauseMap = {
    'Conveyor Belt': `Recurring belt system failure (${total} total work orders on this machine type). Pattern analysis of tech notes suggests mechanical wear, misalignment, or inadequate PM intervals as the primary driver.`,
    'Sorter': `Sorter has failed ${total} times. Note analysis points to sensor calibration drift, firmware instability, or divert arm wear as the most likely systemic cause.`,
    'Robotic Arm': `${total} work orders on robotic arms indicate encoder drift, joint wear, or improper power-cycle homing procedures as the root cause.`,
    'Scanner': `Scanner has gone offline ${total} times. Notes and history suggest network instability, firmware issues, or lens degradation.`,
    'Label Printer': `${total} printer work orders indicate printhead wear, ribbon misfeeds, or recurring firmware bugs.`,
    'Pallet Jack': `${total} pallet jack issues suggest hydraulic fluid depletion, fork damage, or battery degradation (if electric).`,
  };

  const fixMap = {
    'Conveyor Belt': ['Perform full belt tension audit and re-tension to spec.', 'Replace worn rollers (inspect for >10% wear).', 'Increase lubrication frequency.', 'Install belt tracking sensors to detect misalignment early.', 'Schedule OEM inspection if issues persist beyond 2 weeks.'],
    'Sorter': ['Re-calibrate all divert arm sensors and run a full sort test cycle.', 'Update PLC/sorter firmware to latest stable version.', 'Clean all photo-eye sensors — replace any with lens scratches.', 'Review PLC watchdog timeout settings.', 'Add sorter performance to daily AM checklist.'],
    'Robotic Arm': ['Run a full homing sequence and re-teach all waypoints.', 'Check and replace encoder batteries if applicable.', 'Inspect all joint connections for loose wiring or backlash.', 'Review power cycle procedures with operators.', 'Submit position error logs to OEM if pattern continues.'],
    'Scanner': ['Swap scanner with spare unit — send original for firmware reflash.', 'Check network switch port for packet loss (>1% = replace).', 'Assign a static IP to eliminate DHCP dropout.', 'Clean lens with IPA wipes.', 'Add scanner uptime to daily monitoring.'],
    'Label Printer': ['Replace printhead if quality has degraded.', 'Calibrate media and ribbon feed sensors.', 'Clean platen roller and media path with IPA.', 'Update printer firmware — re-test all label formats.', 'Switch to higher-grade ribbon if smearing is the complaint.'],
    'Pallet Jack': ['Check hydraulic fluid — top off or replace.', 'Inspect forks for cracks — tag out if found.', 'Test battery capacity (electric) — replace if below 70%.', 'Shorten PM interval from quarterly to monthly.', 'Retrain operators on proper load limits.'],
  };

  const rootCause = rootCauseMap[machineType] || `${total} work orders on this machine type indicate a recurring systemic issue. Manual inspection and OEM consultation recommended.`;
  const steps = fixMap[machineType] || ['Conduct full inspection with a senior technician.', 'Review all past notes for shared symptoms.', 'Contact OEM with the recurring pattern.', 'Increase PM frequency until root cause is confirmed.'];

  // --- Build output ---
  let out = `Root Cause:\n${rootCause}`;

  if (specLines.length > 0) {
    out += `\n\nMachine Specs on Record (${machineId}):\n${specLines.map((l) => `• ${l}`).join('\n')}`;
  }

  if (actionsFound.length > 0) {
    const unique = [...new Set(actionsFound)].slice(0, 6);
    out += `\n\nActions Logged by Techs Across ${total} Work Orders:\n${unique.map((a) => `• ${a}`).join('\n')}`;
  }

  if (notedParts.length > 0) {
    const unique = [...new Set(notedParts)];
    out += `\n\nPart Numbers Mentioned in Notes:\n${unique.map((p) => `• ${p}`).join('\n')}`;
  }

  if (lastResolutionNote) {
    out += `\n\nMost Recent Successful Resolution Note:\n"${lastResolutionNote}"`;
  }

  out += `\n\n${resolvedPct}% of past occurrences were resolved`;
  if (topTech) out += ` — ${topTech} has handled the most cases`;
  out += `.`;

  out += `\n\nRecommended Fix:\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;

  if (machineSpec?.websites?.length > 0) {
    out += `\n\nReference Manuals / Websites:\n${machineSpec.websites.map((w) => `• ${w}`).join('\n')}`;
  }

  return out;
}

export default function WorkOrderDetailPanel({ workOrder, allWorkOrders, machineSpec, onClose, onUpdate, onDelete, onAddNote, onSaveSpec, onToast }) {
  const [editingField, setEditingField] = useState(null);
  const [fieldVal, setFieldVal] = useState('');
  const [aiSolution, setAiSolution] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (!workOrder) return null;

  const similarIssues = (allWorkOrders || []).filter(
    (wo) => wo.id !== workOrder.id && wo.machineType === workOrder.machineType
  );
  const showAI = similarIssues.length >= 9;

  function startEdit(field, currentVal) {
    setEditingField(field);
    setFieldVal(currentVal);
  }

  function commitEdit(field) {
    onUpdate(workOrder.id, { [field]: fieldVal });
    setEditingField(null);
  }

  function handleDelete() {
    if (window.confirm(`Delete work order ${workOrder.id}? This cannot be undone.`)) {
      onDelete(workOrder.id);
      onClose();
      onToast(`Work order ${workOrder.id} deleted.`, 'info');
    }
  }

  function handleAISolution() {
    setAiLoading(true);
    setAiSolution(null);
    setTimeout(() => {
      const solution = generateAISolution(
        workOrder.machineType,
        workOrder.machineId,
        workOrder.issueTitle,
        workOrder.problemDescription,
        similarIssues,
        machineSpec
      );
      setAiSolution(solution);
      setAiLoading(false);
    }, 800);
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
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }} className="fade-in" onClick={onClose} aria-hidden="true" />

      <div
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(600px, 100vw)', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', zIndex: 40, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
        className="slide-in-right"
        role="region"
        aria-label="Work order details"
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', position: 'sticky', top: 0, zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: '#FF9900', fontWeight: 700 }}>{workOrder.id}</span>
              <ChevronRight size={12} color="var(--text-secondary)" />
              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{workOrder.machineId}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border)' }}>{workOrder.machineType}</span>
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{workOrder.issueTitle}</h2>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button onClick={handleDelete} aria-label="Delete" title="Delete work order"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', padding: '5px 7px', borderRadius: '5px', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={15} />
            </button>
            <button onClick={onClose} aria-label="Close"
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          <PriorityBadge priority={workOrder.priority} size="md" />
          <MachineStateBadge state={workOrder.machineState} size="md" />
          <StatusBadge status={workOrder.status} size="md" />
          {similarIssues.length > 0 && (
            <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: '99px', background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.3)', color: '#FF9900' }}>
              {similarIssues.length + 1}× on {workOrder.machineType}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <button onClick={() => handleAction('close')} disabled={workOrder.status === 'Resolved'}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: workOrder.status === 'Resolved' ? 'var(--bg-elevated)' : 'rgba(34,197,94,0.1)', border: `1px solid ${workOrder.status === 'Resolved' ? 'var(--border)' : 'rgba(34,197,94,0.35)'}`, borderRadius: '6px', color: workOrder.status === 'Resolved' ? 'var(--text-secondary)' : '#22c55e', fontSize: '0.78rem', fontWeight: 600, cursor: workOrder.status === 'Resolved' ? 'not-allowed' : 'pointer' }}>
            <CheckCircle size={13} />Close WO
          </button>
          <button onClick={() => handleAction('escalate')} disabled={workOrder.priority === 'Critical'}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: workOrder.priority === 'Critical' ? 'var(--bg-elevated)' : 'rgba(255,59,59,0.1)', border: `1px solid ${workOrder.priority === 'Critical' ? 'var(--border)' : 'rgba(255,59,59,0.35)'}`, borderRadius: '6px', color: workOrder.priority === 'Critical' ? 'var(--text-secondary)' : '#ff3b3b', fontSize: '0.78rem', fontWeight: 600, cursor: workOrder.priority === 'Critical' ? 'not-allowed' : 'pointer' }}>
            <ArrowUpCircle size={13} />Escalate
          </button>
          <button onClick={() => handleAction('notify')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.35)', borderRadius: '6px', color: '#FF9900', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
            <Bell size={13} />Notify Tech
          </button>
          {showAI && (
            <button onClick={handleAISolution} disabled={aiLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: '6px', color: '#a78bfa', fontSize: '0.78rem', fontWeight: 600, cursor: aiLoading ? 'wait' : 'pointer' }}>
              <Sparkles size={13} />
              {aiLoading ? 'Analyzing…' : 'AI Solution'}
            </button>
          )}
        </div>

        {/* AI output */}
        {aiSolution && (
          <div style={{ margin: '16px 20px 0', padding: '14px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={13} color="#a78bfa" />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                AI Analysis — {similarIssues.length + 1} occurrences on {workOrder.machineType}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
              {aiSolution}
            </p>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '16px 20px', flex: 1 }}>
          <Section title="Work Order Details">
            <InfoRow label="Status">
              {editingField === 'status' ? (
                <select value={fieldVal} onChange={(e) => setFieldVal(e.target.value)} onBlur={() => commitEdit('status')} autoFocus style={inlineSelectStyle}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <button onClick={() => startEdit('status', workOrder.status)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <StatusBadge status={workOrder.status} size="sm" />
                </button>
              )}
            </InfoRow>
            <InfoRow label="Priority">
              {editingField === 'priority' ? (
                <select value={fieldVal} onChange={(e) => setFieldVal(e.target.value)} onBlur={() => commitEdit('priority')} autoFocus style={inlineSelectStyle}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              ) : (
                <button onClick={() => startEdit('priority', workOrder.priority)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <PriorityBadge priority={workOrder.priority} size="sm" />
                </button>
              )}
            </InfoRow>
            <InfoRow label="Machine State">
              {editingField === 'machineState' ? (
                <select value={fieldVal} onChange={(e) => setFieldVal(e.target.value)} onBlur={() => commitEdit('machineState')} autoFocus style={inlineSelectStyle}>
                  {MACHINE_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <button onClick={() => startEdit('machineState', workOrder.machineState)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <MachineStateBadge state={workOrder.machineState} size="sm" />
                </button>
              )}
            </InfoRow>
            <InfoRow label="Assigned Tech">
              {editingField === 'assignedTech' ? (
                <select value={fieldVal} onChange={(e) => setFieldVal(e.target.value)} onBlur={() => commitEdit('assignedTech')} autoFocus style={inlineSelectStyle}>
                  {TECHNICIANS.map((t) => <option key={t}>{t}</option>)}
                </select>
              ) : (
                <button onClick={() => startEdit('assignedTech', workOrder.assignedTech)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-primary)', fontSize: '0.82rem', textDecoration: 'underline dotted' }}>
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

          <Section title="Problem Description">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.65, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
              {workOrder.problemDescription}
            </p>
          </Section>

          {workOrder.errorCodes?.length > 0 && (
            <Section title="Error Codes">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {workOrder.errorCodes.map((code) => (
                  <span key={code} className="font-mono" style={{ padding: '3px 8px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.25)', borderRadius: '4px', fontSize: '0.72rem', color: '#ff8080' }}>
                    {code}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Machine Specs */}
          <Section title="Machine Specs & References">
            <MachineSpecsSection
              machineId={workOrder.machineId}
              machineType={workOrder.machineType}
              spec={machineSpec}
              onSave={onSaveSpec}
            />
          </Section>

          <Section title="Attachments">
            <div style={{ border: '2px dashed var(--border)', borderRadius: '6px', padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              <Wrench size={20} style={{ marginBottom: '6px', opacity: 0.4 }} />
              <div>Photo uploads and error log attachments</div>
              <div style={{ fontSize: '0.72rem', marginTop: '4px', opacity: 0.6 }}>Connect to file storage API to enable</div>
            </div>
          </Section>

          <Section title="Activity Timeline">
            <TechNoteTimeline workOrderId={workOrder.id} notes={workOrder.notes || []} onAddNote={onAddNote} />
          </Section>
        </div>
      </div>
    </>
  );
}
