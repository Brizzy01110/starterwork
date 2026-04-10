import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generateWorkOrderId, generateNoteId } from '../utils/formatters.js';

// Map Supabase row (snake_case) -> app object (camelCase)
function fromDb(row) {
  return {
    id: row.id,
    machineId: row.machine_id,
    machineType: row.machine_type,
    issueTitle: row.issue_title,
    problemDescription: row.problem_description,
    priority: row.priority,
    machineState: row.machine_state,
    status: row.status,
    assignedTech: row.assigned_tech,
    estimatedResolution: row.estimated_resolution,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: row.notes || [],
    errorCodes: row.error_codes || [],
  };
}

// Map app object (camelCase) -> Supabase row (snake_case)
function toDb(wo) {
  return {
    id: wo.id,
    machine_id: wo.machineId,
    machine_type: wo.machineType,
    issue_title: wo.issueTitle,
    problem_description: wo.problemDescription,
    priority: wo.priority,
    machine_state: wo.machineState,
    status: wo.status,
    assigned_tech: wo.assignedTech,
    estimated_resolution: wo.estimatedResolution || null,
    created_at: wo.createdAt,
    updated_at: wo.updatedAt,
    notes: wo.notes,
    error_codes: wo.errorCodes,
  };
}

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [connStatus, setConnStatus] = useState('connecting'); // 'connected' | 'connecting' | 'disconnected'
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error('Supabase fetch error:', error.message);
      setConnStatus('disconnected');
    } else if (data) {
      setWorkOrders(data.map(fromDb));
      setLastRefreshed(new Date());
      setConnStatus('connected');
    }
    setDbLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAll();

    // Real-time subscription
    const channel = supabase
      .channel('work_orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_orders' },
        (payload) => {
          setLastRefreshed(new Date());
          if (payload.eventType === 'INSERT') {
            setWorkOrders((prev) => [fromDb(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setWorkOrders((prev) =>
              prev.map((wo) => (wo.id === payload.new.id ? fromDb(payload.new) : wo))
            );
          } else if (payload.eventType === 'DELETE') {
            setWorkOrders((prev) => prev.filter((wo) => wo.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnStatus('connected');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setConnStatus('disconnected');
        else setConnStatus('connecting');
      });

    // Auto-refresh every 30s as fallback
    const refreshInterval = setInterval(fetchAll, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, [fetchAll]);

  const createWorkOrder = useCallback(async (data) => {
    const now = new Date().toISOString();
    const newWO = {
      id: generateWorkOrderId(),
      ...data,
      createdAt: now,
      updatedAt: now,
      notes: [],
      errorCodes: [],
    };
    const { error } = await supabase.from('work_orders').insert(toDb(newWO));
    if (error) {
      console.error('Supabase insert error:', error.message);
      return { error };
    }
    return { error: null };
  }, []);

  const updateWorkOrder = useCallback(async (id, payload) => {
    const dbPayload = {};
    if (payload.machineId !== undefined) dbPayload.machine_id = payload.machineId;
    if (payload.machineType !== undefined) dbPayload.machine_type = payload.machineType;
    if (payload.issueTitle !== undefined) dbPayload.issue_title = payload.issueTitle;
    if (payload.problemDescription !== undefined) dbPayload.problem_description = payload.problemDescription;
    if (payload.priority !== undefined) dbPayload.priority = payload.priority;
    if (payload.machineState !== undefined) dbPayload.machine_state = payload.machineState;
    if (payload.status !== undefined) dbPayload.status = payload.status;
    if (payload.assignedTech !== undefined) dbPayload.assigned_tech = payload.assignedTech;
    if (payload.estimatedResolution !== undefined) dbPayload.estimated_resolution = payload.estimatedResolution;
    dbPayload.updated_at = new Date().toISOString();
    await supabase.from('work_orders').update(dbPayload).eq('id', id);
  }, []);

  const addNote = useCallback(async (id, noteText, author = 'Technician') => {
    const wo = workOrders.find((w) => w.id === id);
    if (!wo) return;
    const newNote = {
      id: generateNoteId(),
      author,
      timestamp: new Date().toISOString(),
      note: noteText,
    };
    const updatedNotes = [...wo.notes, newNote];
    await supabase
      .from('work_orders')
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, [workOrders]);

  const deleteWorkOrder = useCallback(async (id) => {
    await supabase.from('work_orders').delete().eq('id', id);
  }, []);

  const bulkUpdate = useCallback(async (ids, payload) => {
    const dbPayload = {};
    if (payload.status !== undefined) dbPayload.status = payload.status;
    if (payload.priority !== undefined) dbPayload.priority = payload.priority;
    if (payload.machineState !== undefined) dbPayload.machine_state = payload.machineState;
    if (payload.assignedTech !== undefined) dbPayload.assigned_tech = payload.assignedTech;
    dbPayload.updated_at = new Date().toISOString();
    await supabase.from('work_orders').update(dbPayload).in('id', ids);
  }, []);

  const resetToMockData = useCallback(() => {
    // No-op — mock data removed; reset is not needed with a real DB
  }, []);

  return {
    workOrders,
    dbLoading,
    connStatus,
    lastRefreshed,
    manualRefresh: fetchAll,
    createWorkOrder,
    updateWorkOrder,
    addNote,
    deleteWorkOrder,
    bulkUpdate,
    resetToMockData,
  };
}
