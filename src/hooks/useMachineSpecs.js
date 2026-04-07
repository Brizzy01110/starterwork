import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

function fromDb(row) {
  return {
    machineId: row.machine_id,
    machineType: row.machine_type,
    partNumbers: row.part_numbers || [],
    voltage: row.voltage || '',
    motorSize: row.motor_size || '',
    phase: row.phase || '',
    manufacturer: row.manufacturer || '',
    websites: row.websites || [],
    notes: row.notes || '',
  };
}

export function useMachineSpecs() {
  const [specs, setSpecs] = useState([]);

  useEffect(() => {
    supabase.from('machine_specs').select('*').then(({ data }) => {
      if (data) setSpecs(data.map(fromDb));
    });

    const channel = supabase
      .channel('machine_specs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machine_specs' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setSpecs((prev) => {
            const next = prev.filter((s) => s.machineId !== payload.new.machine_id);
            return [...next, fromDb(payload.new)];
          });
        } else if (payload.eventType === 'DELETE') {
          setSpecs((prev) => prev.filter((s) => s.machineId !== payload.old.machine_id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const upsertSpec = useCallback(async (machineId, machineType, data) => {
    const row = {
      machine_id: machineId,
      machine_type: machineType,
      part_numbers: data.partNumbers || [],
      voltage: data.voltage || '',
      motor_size: data.motorSize || '',
      phase: data.phase || '',
      manufacturer: data.manufacturer || '',
      websites: data.websites || [],
      notes: data.notes || '',
    };
    const { error } = await supabase.from('machine_specs').upsert(row, { onConflict: 'machine_id' });
    if (error) console.error('Spec upsert error:', error.message);
  }, []);

  const getSpec = useCallback((machineId) => {
    return specs.find((s) => s.machineId === machineId) || null;
  }, [specs]);

  return { specs, upsertSpec, getSpec };
}
