import { useState, useMemo, useCallback, useEffect } from 'react';

const FILTER_STORAGE_KEY = 'fc-filter-presets';

const DEFAULT_FILTERS = {
  search: '',
  priority: [],
  machineState: [],
  status: [],
  assignedTech: [],
  dateFrom: '',
  dateTo: '',
};

function loadPresets() {
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function savePresets(presets) {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
}

export function useFilters(workOrders) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [presets, setPresets] = useState(loadPresets);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const toggleSort = useCallback((key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  const savePreset = useCallback((name) => {
    const preset = { name, filters };
    setPresets((prev) => {
      const updated = [...prev.filter((p) => p.name !== name), preset];
      savePresets(updated);
      return updated;
    });
  }, [filters]);

  const loadPreset = useCallback((name) => {
    const preset = presets.find((p) => p.name === name);
    if (preset) setFilters(preset.filters);
  }, [presets]);

  const deletePreset = useCallback((name) => {
    setPresets((prev) => {
      const updated = prev.filter((p) => p.name !== name);
      savePresets(updated);
      return updated;
    });
  }, []);

  const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const STATE_ORDER = { Down: 0, Degraded: 1, Unknown: 2, Maintenance: 3, Operational: 4 };
  const STATUS_ORDER = { Open: 0, 'In Progress': 1, 'Pending Parts': 2, Resolved: 3 };

  const filteredAndSorted = useMemo(() => {
    let result = workOrders.filter((wo) => {
      const q = filters.search.toLowerCase();
      if (q) {
        const haystack = `${wo.id} ${wo.machineId} ${wo.issueTitle} ${wo.problemDescription} ${wo.machineType}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.priority.length && !filters.priority.includes(wo.priority)) return false;
      if (filters.machineState.length && !filters.machineState.includes(wo.machineState)) return false;
      if (filters.status.length && !filters.status.includes(wo.status)) return false;
      if (filters.assignedTech.length && !filters.assignedTech.includes(wo.assignedTech)) return false;
      if (filters.dateFrom) {
        if (new Date(wo.createdAt) < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        if (new Date(wo.createdAt) > new Date(filters.dateTo + 'T23:59:59')) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'priority') {
        valA = PRIORITY_ORDER[a.priority] ?? 99;
        valB = PRIORITY_ORDER[b.priority] ?? 99;
      } else if (sortKey === 'machineState') {
        valA = STATE_ORDER[a.machineState] ?? 99;
        valB = STATE_ORDER[b.machineState] ?? 99;
      } else if (sortKey === 'status') {
        valA = STATUS_ORDER[a.status] ?? 99;
        valB = STATUS_ORDER[b.status] ?? 99;
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [workOrders, filters, sortKey, sortDir]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priority.length) count++;
    if (filters.machineState.length) count++;
    if (filters.status.length) count++;
    if (filters.assignedTech.length) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    sortKey,
    sortDir,
    toggleSort,
    filteredAndSorted,
    activeFilterCount,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
  };
}
