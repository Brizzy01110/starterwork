import { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters.js';

function NoteItem({ note }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        paddingBottom: '16px',
        position: 'relative',
      }}
    >
      {/* Timeline line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '2px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <User size={12} color="var(--text-secondary)" />
        </div>
        <div style={{ flex: 1, width: '1px', background: 'var(--border)', marginTop: '4px' }} />
      </div>

      <div style={{ flex: 1, paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {note.author}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {formatDateTime(note.timestamp)}
          </span>
        </div>
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            lineHeight: 1.55,
          }}
        >
          {note.note}
        </div>
      </div>
    </div>
  );
}

export default function TechNoteTimeline({ workOrderId, notes, onAddNote }) {
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState('Technician');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      onAddNote(workOrderId, newNote.trim(), author || 'Technician');
      setNewNote('');
      setSubmitting(false);
    }, 200);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <MessageSquare size={14} color="var(--text-secondary)" />
        <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Tech Notes ({notes.length})
        </h3>
      </div>

      {notes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '24px',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            background: 'var(--bg-elevated)',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            marginBottom: '16px',
          }}
        >
          No notes yet. Add the first note below.
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          {notes.map((note, idx) => (
            <div key={note.id} style={{ ...(idx === notes.length - 1 ? {} : {}) }}>
              <NoteItem note={note} isLast={idx === notes.length - 1} />
            </div>
          ))}
        </div>
      )}

      {/* Add note form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name..."
            style={{
              width: '100%',
              padding: '7px 10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              outline: 'none',
              marginBottom: '6px',
            }}
          />
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a technician note..."
            rows={3}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#FF9900')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        <button
          type="submit"
          disabled={!newNote.trim() || submitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: newNote.trim() && !submitting ? '#FF9900' : 'var(--bg-elevated)',
            border: `1px solid ${newNote.trim() && !submitting ? '#FF9900' : 'var(--border)'}`,
            borderRadius: '6px',
            color: newNote.trim() && !submitting ? '#000' : 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: newNote.trim() && !submitting ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
        >
          <Send size={13} />
          {submitting ? 'Adding...' : 'Add Note'}
        </button>
      </form>
    </div>
  );
}
