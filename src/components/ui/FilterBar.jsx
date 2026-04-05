import { useState } from 'react';
import { Search, SlidersHorizontal, X, Bookmark, ChevronDown } from 'lucide-react';
import { PRIORITIES, MACHINE_STATES, STATUSES, TECHNICIANS } from '../../data/mockWorkOrders.js';

function MultiSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 10px',
          background: value.length ? 'rgba(255,153,0,0.1)' : 'var(--bg-elevated)',
          border: `1px solid ${value.length ? 'rgba(255,153,0,0.4)' : 'var(--border)'}`,
          borderRadius: '6px',
          color: value.length ? '#FF9900' : 'var(--text-secondary)',
          fontSize: '0.78rem',
          fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}{value.length > 0 && ` (${value.length})`}
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 20,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px',
              minWidth: '160px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
            className="slide-in-up"
            role="listbox"
            aria-multiselectable="true"
          >
            {options.map((opt) => {
              const selected = value.includes(opt);
              return (
                <button
                  key={opt}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(
                      selected ? value.filter((v) => v !== opt) : [...value, opt]
                    );
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '6px 8px',
                    background: selected ? 'rgba(255,153,0,0.1)' : 'none',
                    border: 'none',
                    borderRadius: '5px',
                    color: selected ? '#FF9900' : 'var(--text-primary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'none'; }}
                >
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      border: `1.5px solid ${selected ? '#FF9900' : 'var(--border)'}`,
                      borderRadius: '3px',
                      background: selected ? '#FF9900' : 'none',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selected && (
                      <svg width="8" height="8" viewBox="0 0 8 8">
                        <path d="M1 4l2 2 4-4" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </span>
                  {opt}
                </button>
              );
            })}
            {value.length > 0 && (
              <button
                onClick={() => onChange([])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '6px 8px',
                  background: 'none',
                  border: 'none',
                  borderTop: '1px solid var(--border)',
                  marginTop: '4px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <X size={10} /> Clear
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function FilterBar({
  filters,
  updateFilter,
  resetFilters,
  activeFilterCount,
  resultCount,
  totalCount,
  presets,
  savePreset,
  loadPreset,
  deletePreset,
}) {
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Search + filter controls */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 200px',
            minWidth: '180px',
            maxWidth: '320px',
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search WO #, machine, keyword..."
            aria-label="Search work orders"
            style={{
              width: '100%',
              padding: '7px 10px 7px 30px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#FF9900')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <MultiSelect
          label="Priority"
          options={PRIORITIES}
          value={filters.priority}
          onChange={(v) => updateFilter('priority', v)}
        />
        <MultiSelect
          label="State"
          options={MACHINE_STATES}
          value={filters.machineState}
          onChange={(v) => updateFilter('machineState', v)}
        />
        <MultiSelect
          label="Status"
          options={STATUSES}
          value={filters.status}
          onChange={(v) => updateFilter('status', v)}
        />
        <MultiSelect
          label="Tech"
          options={TECHNICIANS}
          value={filters.assignedTech}
          onChange={(v) => updateFilter('assignedTech', v)}
        />

        {/* Date range */}
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => updateFilter('dateFrom', e.target.value)}
          aria-label="From date"
          style={{
            padding: '7px 8px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', alignSelf: 'center' }}>to</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => updateFilter('dateTo', e.target.value)}
          aria-label="To date"
          style={{
            padding: '7px 8px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        />

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 10px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '6px',
              color: '#ef4444',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <X size={12} />
            Clear ({activeFilterCount})
          </button>
        )}

        {/* Presets */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <button
            onClick={() => setShowPresets((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            aria-label="Filter presets"
          >
            <Bookmark size={12} />
            Presets
          </button>

          {showPresets && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowPresets(false)} />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  zIndex: 20,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px',
                  minWidth: '220px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
                className="slide-in-up"
              >
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Save current filters</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name..."
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => { if (presetName.trim()) { savePreset(presetName.trim()); setPresetName(''); } }}
                    disabled={!presetName.trim()}
                    style={{
                      padding: '5px 10px',
                      background: presetName.trim() ? '#FF9900' : 'var(--border)',
                      border: 'none',
                      borderRadius: '5px',
                      color: presetName.trim() ? 'black' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: presetName.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Save
                  </button>
                </div>

                {presets.length > 0 && (
                  <>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saved presets</p>
                    {presets.map((p) => (
                      <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <button
                          onClick={() => { loadPreset(p.name); setShowPresets(false); }}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '5px',
                            color: 'var(--text-primary)',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          {p.name}
                        </button>
                        <button
                          onClick={() => deletePreset(p.name)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                          aria-label={`Delete preset ${p.name}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Showing <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{resultCount}</span> of {totalCount} work orders
        {activeFilterCount > 0 && <span style={{ color: '#FF9900' }}> ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active)</span>}
      </div>
    </div>
  );
}
