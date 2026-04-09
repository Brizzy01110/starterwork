import { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import StatsSummaryBar from './components/ui/StatsSummaryBar.jsx';
import FilterBar from './components/ui/FilterBar.jsx';
import WorkOrderTable from './components/workorders/WorkOrderTable.jsx';
import WorkOrderDetailPanel from './components/workorders/WorkOrderDetailPanel.jsx';
import CreateWorkOrderModal from './components/workorders/CreateWorkOrderModal.jsx';
import MachineStateBoard from './components/board/MachineStateBoard.jsx';
import AnalyticsView from './components/ui/AnalyticsView.jsx';
import WiringDiagramsView from './components/ui/WiringDiagramsView.jsx';
import SafetyView from './components/ui/SafetyView.jsx';
import HistoryView from './components/workorders/HistoryView.jsx';
import ProductAnalysisView from './components/ui/ProductAnalysisView.jsx';
import AccidentsView from './components/ui/AccidentsView.jsx';
import MEWPView from './components/ui/MEWPView.jsx';
import { ToastContainer, useToast } from './components/ui/Toast.jsx';
import { useWorkOrders } from './hooks/useWorkOrders.js';
import { useFilters } from './hooks/useFilters.js';
import { useMachineSpecs } from './hooks/useMachineSpecs.js';
import { exportToCSV } from './utils/formatters.js';
import { Plus, Download, TableIcon, LayoutGrid, BarChart2, Zap, ShieldCheck, History, FlaskConical, TriangleAlert, Forklift } from 'lucide-react';

export default function App() {
  const { workOrders, dbLoading, createWorkOrder, updateWorkOrder, addNote, deleteWorkOrder, bulkUpdate, resetToMockData } = useWorkOrders();
  const { upsertSpec, getSpec } = useMachineSpecs();
  const {
    filters, updateFilter, resetFilters, sortKey, sortDir, toggleSort,
    filteredAndSorted, activeFilterCount, presets, savePreset, loadPreset, deletePreset,
  } = useFilters(workOrders);

  const { toasts, addToast, dismissToast } = useToast();

  const [activeView, setActiveView] = useState('table');
  const [selectedWO, setSelectedWO] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('overview');
  const [notifications, setNotifications] = useState([]);

  // Keep selectedWO in sync with latest data
  useEffect(() => {
    if (selectedWO) {
      const updated = workOrders.find((wo) => wo.id === selectedWO.id);
      if (updated) setSelectedWO(updated);
    }
  }, [workOrders]);

  const handleCreate = useCallback(async (data) => {
    const { error } = await createWorkOrder(data);
    if (error) {
      addToast(`Failed to create work order: ${error.message}`, 'error');
    } else {
      addToast(`Work order created: ${data.issueTitle}`, 'success');
    }
  }, [createWorkOrder, addToast]);

  const handleUpdate = useCallback((id, payload) => {
    updateWorkOrder(id, payload);
    addToast('Work order updated.', 'success');
  }, [updateWorkOrder, addToast]);

  const handleAddNote = useCallback((id, note, author) => {
    addNote(id, note, author);
    addToast(`${author} responded on ${id}.`, 'success');
    setNotifications((prev) => [
      { id: Date.now(), woId: id, author, preview: note, ts: Date.now(), read: false },
      ...prev,
    ]);
  }, [addNote, addToast]);

  const handleDelete = useCallback((id) => {
    deleteWorkOrder(id);
  }, [deleteWorkOrder]);

  const handleBulkUpdate = useCallback((ids, payload) => {
    bulkUpdate(ids, payload);
    setSelectedIds(new Set());
    addToast(`${ids.length} work orders updated.`, 'success');
  }, [bulkUpdate, addToast]);

  const handleReset = useCallback(() => {
    if (window.confirm('Clear all work orders? This cannot be undone.')) {
      resetToMockData();
      setSelectedIds(new Set());
      setSelectedWO(null);
      addToast('All work orders cleared.', 'info');
    }
  }, [resetToMockData, addToast]);

  function handleSelectRow(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSelectAll(ids) {
    if (selectedIds.size === ids.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  }

  const VIEW_ICONS = { table: TableIcon, board: LayoutGrid, charts: BarChart2, wiring: Zap, safety: ShieldCheck, history: History, defects: FlaskConical, accidents: TriangleAlert, mewp: Forklift };
  const VIEW_LABELS = { table: 'Table', board: 'Board', charts: 'Analytics', wiring: 'Wiring', safety: 'Safety', history: 'History', defects: 'Defects', accidents: 'Accidents', mewp: 'MEWP' };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Behind-content circular MTS watermark */}
      <svg
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 520, height: 520, pointerEvents: 'none', zIndex: 0, userSelect: 'none', opacity: 0.13 }}
        viewBox="0 0 520 520"
        aria-hidden="true"
      >
        <circle cx="260" cy="260" r="240" fill="none" stroke="#FF9900" strokeWidth="2.5" strokeDasharray="8 10" />
        <circle cx="260" cy="260" r="200" fill="none" stroke="#FF9900" strokeWidth="1" strokeDasharray="4 8" />
        <text x="260" y="285" textAnchor="middle" fill="#FF9900" fontSize="130" fontWeight="900" fontFamily="Inter,system-ui,sans-serif" letterSpacing="-4">MTS</text>
        <text x="260" y="340" textAnchor="middle" fill="#FF9900" fontSize="26" fontWeight="700" fontFamily="Inter,system-ui,sans-serif" letterSpacing="6">MT SERVICES</text>
        <text x="260" y="375" textAnchor="middle" fill="#FF9900" fontSize="16" fontWeight="500" fontFamily="Inter,system-ui,sans-serif" letterSpacing="3">GREBRYSON GABRIEL</text>
        <text x="260" y="190" textAnchor="middle" fill="#FF9900" fontSize="14" fontFamily="Inter,system-ui,sans-serif" letterSpacing="2">© 2026</text>
      </svg>

      <Header
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        menuOpen={sidebarOpen}
        notifications={notifications}
        onClearNotifications={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        sidebarMode={sidebarMode}
        onModeChange={setSidebarMode}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onReset={handleReset}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sidebarMode={sidebarMode}
        />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            minWidth: 0,
          }}
        >
          {!dbLoading && <StatsSummaryBar workOrders={workOrders} />}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  padding: '3px',
                  gap: '2px',
                }}
                role="tablist"
                aria-label="View selector"
              >
                {['table', 'board', 'charts', 'wiring', 'safety', 'history', 'defects', 'accidents', 'mewp'].map((view) => {
                  const Icon = VIEW_ICONS[view];
                  const active = activeView === view;
                  return (
                    <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      role="tab"
                      aria-selected={active}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 10px',
                        borderRadius: '5px',
                        background: active ? '#FF9900' : 'none',
                        border: 'none',
                        color: active ? '#000' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: active ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Icon size={13} />
                      <span className="view-label">{VIEW_LABELS[view]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { exportToCSV(filteredAndSorted); addToast('CSV exported.', 'success'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                aria-label="Export to CSV"
              >
                <Download size={13} />
                <span className="view-label">Export CSV</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  background: '#FF9900',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#000',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e68900')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FF9900')}
                aria-label="Create new work order"
              >
                <Plus size={15} />
                New WO
              </button>
            </div>
          </div>

          {activeView === 'table' && (
            <>
              {!dbLoading && (
                <FilterBar
                  filters={filters}
                  updateFilter={updateFilter}
                  resetFilters={resetFilters}
                  activeFilterCount={activeFilterCount}
                  resultCount={filteredAndSorted.length}
                  totalCount={workOrders.length}
                  presets={presets}
                  savePreset={savePreset}
                  loadPreset={loadPreset}
                  deletePreset={deletePreset}
                />
              )}
              <WorkOrderTable
                workOrders={filteredAndSorted}
                loading={dbLoading}
                sortKey={sortKey}
                sortDir={sortDir}
                toggleSort={toggleSort}
                onRowClick={(wo) => setSelectedWO(wo)}
                selectedIds={selectedIds}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
                onBulkUpdate={handleBulkUpdate}
              />
            </>
          )}

          {activeView === 'board' && (
            <MachineStateBoard
              workOrders={workOrders}
              onCardClick={(wo) => setSelectedWO(wo)}
            />
          )}

          {activeView === 'charts' && (
            <AnalyticsView workOrders={workOrders} />
          )}

          {activeView === 'wiring' && (
            <WiringDiagramsView />
          )}

          {activeView === 'safety' && (
            <SafetyView />
          )}

          {activeView === 'history' && (
            <HistoryView workOrders={workOrders} />
          )}

          {activeView === 'defects' && (
            <ProductAnalysisView workOrders={workOrders} />
          )}

          {activeView === 'accidents' && (
            <AccidentsView />
          )}

          {activeView === 'mewp' && (
            <MEWPView />
          )}
        </main>
      </div>

      {selectedWO && (
        <WorkOrderDetailPanel
          workOrder={selectedWO}
          allWorkOrders={workOrders}
          machineSpec={selectedWO ? getSpec(selectedWO.machineId) : null}
          onClose={() => setSelectedWO(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAddNote={handleAddNote}
          onSaveSpec={upsertSpec}
          onToast={addToast}
        />
      )}

      {showCreateModal && (
        <CreateWorkOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <style>{`
        @media (max-width: 640px) {
          .view-label { display: none; }
        }
      `}</style>
    </div>
  );
}
