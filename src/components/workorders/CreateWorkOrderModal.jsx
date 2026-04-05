import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { TECHNICIANS, MACHINE_TYPES, PRIORITIES, MACHINE_STATES } from '../../data/mockWorkOrders.js';

const INITIAL_FORM = {
  machineId: '',
  machineType: 'Conveyor Belt',
  issueTitle: '',
  problemDescription: '',
  priority: 'Medium',
  machineState: 'Degraded',
  status: 'Open',
  assignedTech: '',
  estimatedResolution: '',
};

function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '5px',
        }}
      >
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{hint}</p>}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

export default function CreateWorkOrderModal({ onClose, onCreate }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.machineId.trim()) e.machineId = 'Machine ID is required';
    if (!form.issueTitle.trim()) e.issueTitle = 'Issue title is required';
    if (!form.problemDescription.trim()) e.problemDescription = 'Problem description is required';
    if (!form.assignedTech) e.assignedTech = 'Please assign a technician';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      onCreate({
        ...form,
        machineId: form.machineId.trim().toUpperCase(),
        issueTitle: form.issueTitle.trim(),
        problemDescription: form.problemDescription.trim(),
      });
      setSubmitting(false);
      onClose();
    }, 300);
  }

  function errorStyle(field) {
    return errors[field] ? { borderColor: '#ef4444' } : {};
  }

  return (
    <Modal title="Create New Work Order" onClose={onClose} size="md">
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Field label="Machine ID" required>
            <input
              type="text"
              value={form.machineId}
              onChange={(e) => set('machineId', e.target.value)}
              placeholder="e.g. CONV-A3"
              className="font-mono"
              style={{ ...inputStyle, ...errorStyle('machineId'), textTransform: 'uppercase' }}
              onFocus={(e) => (e.target.style.borderColor = '#FF9900')}
              onBlur={(e) => (e.target.style.borderColor = errors.machineId ? '#ef4444' : 'var(--border)')}
            />
            {errors.machineId && <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '3px' }}>{errors.machineId}</p>}
          </Field>

          <Field label="Machine Type" required>
            <select
              value={form.machineType}
              onChange={(e) => set('machineType', e.target.value)}
              style={selectStyle}
            >
              {MACHINE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Issue Title" required>
          <input
            type="text"
            value={form.issueTitle}
            onChange={(e) => set('issueTitle', e.target.value)}
            placeholder="Brief description of the issue"
            maxLength={120}
            style={{ ...inputStyle, ...errorStyle('issueTitle') }}
            onFocus={(e) => (e.target.style.borderColor = '#FF9900')}
            onBlur={(e) => (e.target.style.borderColor = errors.issueTitle ? '#ef4444' : 'var(--border)')}
          />
          {errors.issueTitle && <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '3px' }}>{errors.issueTitle}</p>}
        </Field>

        <Field label="Problem Description" required>
          <textarea
            value={form.problemDescription}
            onChange={(e) => set('problemDescription', e.target.value)}
            placeholder="Detailed description of the problem, symptoms observed, initial diagnosis..."
            rows={4}
            style={{ ...inputStyle, ...errorStyle('problemDescription'), resize: 'vertical' }}
            onFocus={(e) => (e.target.style.borderColor = '#FF9900')}
            onBlur={(e) => (e.target.style.borderColor = errors.problemDescription ? '#ef4444' : 'var(--border)')}
          />
          {errors.problemDescription && <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '3px' }}>{errors.problemDescription}</p>}
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Field label="Priority" required>
            <select
              value={form.priority}
              onChange={(e) => set('priority', e.target.value)}
              style={selectStyle}
            >
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="Machine State" required>
            <select
              value={form.machineState}
              onChange={(e) => set('machineState', e.target.value)}
              style={selectStyle}
            >
              {MACHINE_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Field label="Assign Technician" required>
            <select
              value={form.assignedTech}
              onChange={(e) => set('assignedTech', e.target.value)}
              style={{ ...selectStyle, ...errorStyle('assignedTech') }}
            >
              <option value="">-- Select technician --</option>
              {TECHNICIANS.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.assignedTech && <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '3px' }}>{errors.assignedTech}</p>}
          </Field>

          <Field label="Est. Resolution" hint="Optional target resolution date">
            <input
              type="datetime-local"
              value={form.estimatedResolution}
              onChange={(e) => set('estimatedResolution', e.target.value)}
              style={{ ...selectStyle, colorScheme: 'dark' }}
            />
          </Field>
        </div>

        {/* Footer buttons */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '8px 20px',
              background: submitting ? 'var(--accent-amazon-dim)' : '#FF9900',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Creating...' : 'Create Work Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
