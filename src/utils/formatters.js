// Utility functions for formatting and ID generation

export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatRelativeTime(isoString) {
  if (!isoString) return 'N/A';
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(isoString);
}

export function generateWorkOrderId() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `WO-${year}-${random}`;
}

export function generateNoteId() {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function calcAvgResolutionHours(workOrders) {
  const resolved = workOrders.filter((wo) => wo.status === 'Resolved');
  if (resolved.length === 0) return null;
  const totalMs = resolved.reduce((sum, wo) => {
    const created = new Date(wo.createdAt);
    const updated = new Date(wo.updatedAt);
    return sum + (updated - created);
  }, 0);
  const avgMs = totalMs / resolved.length;
  const avgHours = avgMs / (1000 * 60 * 60);
  if (avgHours < 24) return `${avgHours.toFixed(1)}h`;
  return `${(avgHours / 24).toFixed(1)}d`;
}

export function exportToCSV(workOrders) {
  const headers = [
    'WO #',
    'Machine ID',
    'Machine Type',
    'Issue Title',
    'Priority',
    'Machine State',
    'Status',
    'Assigned Tech',
    'Created',
    'Updated',
  ];
  const rows = workOrders.map((wo) => [
    wo.id,
    wo.machineId,
    wo.machineType,
    `"${wo.issueTitle.replace(/"/g, '""')}"`,
    wo.priority,
    wo.machineState,
    wo.status,
    wo.assignedTech,
    formatDateTime(wo.createdAt),
    formatDateTime(wo.updatedAt),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `work-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
