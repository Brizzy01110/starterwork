import { useReducer, useEffect, useCallback } from 'react';
import { mockWorkOrders } from '../data/mockWorkOrders.js';
import { generateWorkOrderId, generateNoteId } from '../utils/formatters.js';

const STORAGE_KEY = 'fc-work-orders';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveToStorage(workOrders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workOrders));
  } catch {
    // ignore storage errors
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload;

    case 'CREATE': {
      const newWO = {
        id: generateWorkOrderId(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
        errorCodes: [],
      };
      return [newWO, ...state];
    }

    case 'UPDATE': {
      return state.map((wo) =>
        wo.id === action.id
          ? { ...wo, ...action.payload, updatedAt: new Date().toISOString() }
          : wo
      );
    }

    case 'ADD_NOTE': {
      const note = {
        id: generateNoteId(),
        author: action.author,
        timestamp: new Date().toISOString(),
        note: action.note,
      };
      return state.map((wo) =>
        wo.id === action.id
          ? { ...wo, notes: [...wo.notes, note], updatedAt: new Date().toISOString() }
          : wo
      );
    }

    case 'DELETE': {
      return state.filter((wo) => wo.id !== action.id);
    }

    case 'BULK_UPDATE': {
      const ids = new Set(action.ids);
      return state.map((wo) =>
        ids.has(wo.id)
          ? { ...wo, ...action.payload, updatedAt: new Date().toISOString() }
          : wo
      );
    }

    default:
      return state;
  }
}

export function useWorkOrders() {
  const [workOrders, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const stored = loadFromStorage();
    dispatch({ type: 'INIT', payload: stored || mockWorkOrders });
  }, []);

  useEffect(() => {
    if (workOrders.length > 0) {
      saveToStorage(workOrders);
    }
  }, [workOrders]);

  const createWorkOrder = useCallback((data) => {
    dispatch({ type: 'CREATE', payload: data });
  }, []);

  const updateWorkOrder = useCallback((id, payload) => {
    dispatch({ type: 'UPDATE', id, payload });
  }, []);

  const addNote = useCallback((id, note, author = 'Technician') => {
    dispatch({ type: 'ADD_NOTE', id, note, author });
  }, []);

  const deleteWorkOrder = useCallback((id) => {
    dispatch({ type: 'DELETE', id });
  }, []);

  const bulkUpdate = useCallback((ids, payload) => {
    dispatch({ type: 'BULK_UPDATE', ids, payload });
  }, []);

  const resetToMockData = useCallback(() => {
    dispatch({ type: 'INIT', payload: mockWorkOrders });
  }, []);

  return {
    workOrders,
    createWorkOrder,
    updateWorkOrder,
    addNote,
    deleteWorkOrder,
    bulkUpdate,
    resetToMockData,
  };
}
