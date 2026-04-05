import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Package } from 'lucide-react';
import WorkOrderRow from './WorkOrderRow.jsx';
import { STATUSES } from '../../data/mockWorkOrders.js';

function SortIcon({ columnKey, sortKey, sortDir }) {
  if (sortKey !== columnKey)
    return <ChevronsUpDown size={11} style={{ opacity: 0.3, flexShrink: 0 }} />;
  return sortDir === 'asc'
    ? <ChevronUp size={11} style={{ color: '#FF9900', flexShrink: 0 }} />
    : <ChevronDown size={11} style={{ color: '#FF9900', flexShrink: 0 }} />;
}

const COLUMNS = [
  { key: 'id', label: 'WO #' },
  { key: 'machineId', label: 'Machine' },
  { key: 'issueTitle', label: 'Issue' },
  { key: 'priority', label: 'Priority' },
  { key: 'machineState', label: 'State' },
  { key: 'status', label: 'Status' },
  { key: 'assignedTech', label: 'Tech' },
  { key: 'updatedAt', label: 'Updated' },
];

// Skeleton row for loading state
function SkeletonRow() {
  return (
    <tr>
      <td style={{ padding: '12px' }}><div className="skeleton" style={{ width: '14px', height: '14px', borderRadius: '3px' }} /></td>
      {[100, 80, 200, 70, 80, 80, 80, 60].map((w, i) => (
        <td key={i} style={{ padding: '10px 12px' }}>
          <div className="skeleton" style={{ width: `${w}px`, height: '14px' }} />
        </td>
      ))}
    </tr>
  );
}

export default function WorkOrderTable({
  workOrders,
  loading,
  sortKey,
  sortDir,
  toggleSort,
  onRowClick,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onBulkUpdate,
}) {
  const [bulkStatus, setBulkStatus] = useState('');
  const allSelected = workOrders.length > 0 && selectedIds.size === workOrders.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <div style={{ position: 'relative' }}>
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            background: 'rgba(255,153,0,0.08)',
            border: '1px solid rgba(255,153,0,0.25)',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: '#FF9900', fontWeight: 600 }}>
            {selectedIds.size} selected
          </span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bulk update status:</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            style={{
              padding: '4px 8px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '5px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">-- Choose status --</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={() => {
              if (bulkStatus) {
                onBulkUpdate([...selectedIds], { status: bulkStatus });
                setBulkStatus('');
              }
            }}
            disabled={!bulkStatus}
            style={{
              padding: '4px 12px',
              background: bulkStatus ? '#FF9900' : 'var(--border)',
              border: 'none',
              borderRadius: '5px',
              color: bulkStatus ? '#000' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: bulkStatus ? 'pointer' : 'not-allowed',
            }}
          >
            Apply
          </button>
        </div>
      )}

      {/* Table wrapper */}
      <div
        style={{
          overflowX: 'auto',
          border: '1px solid var(--border)',
          borderRadius: selectedIds.size > 0 ? '0 0 8px 8px' : '8px',
          background: 'var(--bg-surface)',
        }}
      >
        <table className="wo-table" aria-label="Work orders">
          <thead>
            <tr>
              {/* Select all checkbox */}
              <th style={{ width: '36px', paddingLeft: '12px' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={() => onSelectAll(workOrders.map((wo) => wo.id))}
                  aria-label="Select all work orders"
                  style={{ cursor: 'pointer', accentColor: '#FF9900' }}
                />
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {col.label}
                    <SortIcon columnKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)
            ) : workOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  style={{ padding: '60px 20px', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                    <Package size={40} style={{ opacity: 0.2 }} />
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      No work orders found
                    </div>
                    <div style={{ fontSize: '0.82rem' }}>
                      Try adjusting your filters or create a new work order.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              workOrders.map((wo) => (
                <WorkOrderRow
                  key={wo.id}
                  workOrder={wo}
                  onClick={() => onRowClick(wo)}
                  selected={selectedIds.has(wo.id)}
                  onSelect={() => onSelectRow(wo.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
