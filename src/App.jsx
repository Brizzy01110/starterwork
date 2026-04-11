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
import SystemDashboard from './components/ui/SystemDashboard.jsx';
import AlertSettingsPanel from './components/ui/AlertSettingsPanel.jsx';
import TourModal from './components/ui/TourModal.jsx';
import DowntimeView from './components/ui/DowntimeView.jsx';
import PMSchedulerView from './components/ui/PMSchedulerView.jsx';
import PartsInventoryView from './components/ui/PartsInventoryView.jsx';
import ShiftHandoffView from './components/ui/ShiftHandoffView.jsx';
import TechScorecardView from './components/ui/TechScorecardView.jsx';
import MachineHealthView from './components/ui/MachineHealthView.jsx';
import UserManagementView from './components/ui/UserManagementView.jsx';
import LoginScreen from './components/auth/LoginScreen.jsx';
import { ToastContainer, useToast } from './components/ui/Toast.jsx';
import { useWorkOrders } from './hooks/useWorkOrders.js';
import { useAlerts, loadAlertSettings, saveAlertSettings, loadSMSPerm, saveSMSPerm } from './hooks/useAlerts.js';
import { useFilters } from './hooks/useFilters.js';
import { useMachineSpecs } from './hooks/useMachineSpecs.js';
import { useAuth, ROLE_ACCESS } from './hooks/useAuth.js';
import { exportToCSV } from './utils/formatters.js';
import { Plus, Download, TableIcon, LayoutGrid, BarChart2, Zap, ShieldCheck, History, FlaskConical, TriangleAlert, Forklift, DollarSign, Wrench, Package, ClipboardList, User, Activity, Monitor, Users } from 'lucide-react';

export default function App() {
  const { currentUser, users, login, logout, addUser, updateUser, deleteUser } = useAuth();
  const { workOrders, dbLoading, connStatus, lastRefreshed, manualRefresh, createWorkOrder, updateWorkOrder, addNote, deleteWorkOrder, bulkUpdate, resetToMockData } = useWorkOrders();
  const { upsertSpec, getSpec } = useMachineSpecs();
  const {
    filters, updateFilter, resetFilters, sortKey, sortDir, toggleSort,
    filteredAndSorted, activeFilterCount, presets, savePreset, loadPreset, deletePreset,
  } = useFilters(workOrders);

  const { toasts, addToast, dismissToast } = useToast();

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedWO, setSelectedWO] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [alertSettings, setAlertSettings] = useState(loadAlertSettings);
  const [showTour, setShowTour] = useState(() => !localStorage.getItem('mts_tour_done'));

  useAlerts(workOrders, alertSettings);

  // Handle SMS permission token from URL (?sms_allow=TOKEN or ?sms_deny=TOKEN)
  useEffect(() => {
    const params     = new URLSearchParams(window.location.search);
    const allowToken = params.get('sms_allow');
    const denyToken  = params.get('sms_deny');
    if (!allowToken && !denyToken) return;
    const perm = loadSMSPerm();
    if (perm && (perm.token === allowToken || perm.token === denyToken)) {
      const granted = perm.token === allowToken;
      saveSMSPerm({ ...perm, status: granted ? 'granted' : 'denied', respondedAt: Date.now() });
      const current = loadAlertSettings();
      saveAlertSettings({ ...current, smsEnabled: granted });
      setAlertSettings((prev) => ({ ...prev, smsEnabled: granted }));
    }
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

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

  const VIEW_ICONS  = { dashboard: Monitor, table: TableIcon, board: LayoutGrid, charts: BarChart2, wiring: Zap, safety: ShieldCheck, history: History, defects: FlaskConical, accidents: TriangleAlert, mewp: Forklift, downtime: DollarSign, pm: Wrench, parts: Package, handoff: ClipboardList, scorecard: User, health: Activity, users: Users };
  const VIEW_LABELS = { dashboard: 'Dashboard', table: 'Table', board: 'Board', charts: 'Analytics', wiring: 'Wiring', safety: 'Safety', history: 'History', defects: 'Defects', accidents: 'Accidents', mewp: 'MEWP', downtime: 'Downtime', pm: 'PM Schedule', parts: 'Parts', handoff: 'Handoff', scorecard: 'Scorecards', health: 'Health', users: 'User Management' };

  // Gate: redirect to dashboard if current view is not allowed for this role
  const role = currentUser?.role || 'operator';
  const allowed = ROLE_ACCESS[role] || [];
  useEffect(() => {
    if (!allowed.includes(activeView)) setActiveView('dashboard');
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show login screen if not authenticated
  if (!currentUser) {
    return <LoginScreen onLogin={login} />;
  }

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
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 520, height: 520, pointerEvents: 'none', zIndex: 0, userSelect: 'none', opacity: 0.07 }}
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
        connStatus={connStatus}
        lastRefreshed={lastRefreshed}
        onManualRefresh={manualRefresh}
        onOpenAlerts={() => setShowAlertSettings(true)}
        onOpenTour={() => setShowTour(true)}
        currentUser={currentUser}
        onLogout={logout}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onReset={handleReset}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sidebarMode={sidebarMode}
          currentUser={currentUser}
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
          {/* Page title bar */}
          <div className="page-titlebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {(() => { const Icon = VIEW_ICONS[activeView]; return Icon ? <Icon size={16} color="#FF9900" /> : null; })()}
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{VIEW_LABELS[activeView]}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>MT Services · Active Work Orders System</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {(activeView === 'table' || activeView === 'dashboard') && (
                <button
                  onClick={() => { exportToCSV(filteredAndSorted); addToast('CSV exported.', 'success'); }}
                  className="btn-secondary"
                  aria-label="Export to CSV"
                >
                  <Download size={13} />
                  <span className="hide-xs">Export</span>
                </button>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
                aria-label="Create new work order"
              >
                <Plus size={14} />
                <span>New WO</span>
              </button>
            </div>
          </div>

          {activeView === 'dashboard' && !dbLoading && <StatsSummaryBar workOrders={workOrders} />}

          {activeView === 'dashboard' && (
            <SystemDashboard workOrders={workOrders} connStatus={connStatus} lastRefreshed={lastRefreshed} />
          )}

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

          {activeView === 'downtime' && (
            <DowntimeView workOrders={workOrders} />
          )}

          {activeView === 'pm' && (
            <PMSchedulerView />
          )}

          {activeView === 'parts' && (
            <PartsInventoryView />
          )}

          {activeView === 'handoff' && (
            <ShiftHandoffView workOrders={workOrders} />
          )}

          {activeView === 'scorecard' && (
            <TechScorecardView workOrders={workOrders} />
          )}

          {activeView === 'health' && (
            <MachineHealthView workOrders={workOrders} />
          )}

          {activeView === 'users' && role === 'admin' && (
            <UserManagementView
              users={users}
              currentUser={currentUser}
              onAdd={addUser}
              onUpdate={updateUser}
              onDelete={deleteUser}
            />
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

      {showAlertSettings && (
        <AlertSettingsPanel
          onClose={() => {
            setAlertSettings(loadAlertSettings());
            setShowAlertSettings(false);
          }}
        />
      )}

      {showTour && (
        <TourModal
          onClose={() => {
            localStorage.setItem('mts_tour_done', '1');
            setShowTour(false);
          }}
          onNavigate={setActiveView}
        />
      )}

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {[
          { id: 'dashboard', icon: Monitor, label: 'Dashboard' },
          { id: 'table',     icon: TableIcon, label: 'Work Orders' },
          { id: 'downtime',  icon: DollarSign, label: 'Downtime' },
          { id: 'health',    icon: Activity,   label: 'Health' },
          { id: 'handoff',   icon: ClipboardList, label: 'Handoff' },
        ].map(({ id, icon: Icon, label }) => {
          const active = activeView === id;
          return (
            <button key={id} onClick={() => setActiveView(id)} className={`mobile-nav-btn${active ? ' active' : ''}`}>
              <Icon size={20} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        /* ── Page title bar ── */
        .page-titlebar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0 4px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 4px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .btn-primary {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 7px;
          background: #FF9900; border: none;
          color: #000; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #e68900; }
        .btn-secondary {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 12px; border-radius: 7px;
          background: var(--bg-elevated); border: 1px solid var(--border);
          color: var(--text-secondary); font-size: 0.78rem; font-weight: 500;
          cursor: pointer; transition: color 0.15s;
          white-space: nowrap;
        }
        .btn-secondary:hover { color: var(--text-primary); }

        /* ── Mobile bottom nav (hidden on desktop) ── */
        .mobile-bottom-nav { display: none; }

        /* ── Responsive breakpoints ── */
        @media (max-width: 768px) {
          /* Show mobile bottom nav */
          .mobile-bottom-nav {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            height: 60px;
            background: var(--bg-surface);
            border-top: 1px solid var(--border);
            z-index: 50;
            justify-content: space-around;
            align-items: stretch;
          }
          .mobile-nav-btn {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 3px; background: none; border: none;
            color: var(--text-secondary); font-size: 0.58rem;
            font-weight: 600; cursor: pointer;
            text-transform: uppercase; letter-spacing: 0.04em;
            padding: 6px 2px;
            transition: color 0.15s;
          }
          .mobile-nav-btn.active { color: #FF9900; }
          .mobile-nav-btn.active svg { filter: drop-shadow(0 0 4px #FF9900); }

          /* Push content above bottom nav */
          main { padding-bottom: 72px !important; }

          /* Hide desktop sidebar on mobile */
          .sidebar { display: none !important; }

          /* Stack stats bar */
          .stats-bar { flex-direction: column !important; }

          /* Full-width cards on mobile */
          [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .hide-xs { display: none !important; }
          .page-titlebar { padding: 8px 0 4px; }
          main { padding: 10px 10px 72px !important; }
        }
      `}</style>
    </div>
  );
}
