import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError('Invalid email or password.');
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '36px 32px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: '#FF9900',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={17} color="black" fill="black" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Starter Work
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              FULFILLMENT CENTER OPS
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Sign in
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Authorized personnel only
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@example.com"
              style={{
                padding: '9px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                padding: '9px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '6px',
                color: '#ef4444',
                fontSize: '0.78rem',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px',
              background: loading ? '#cc7a00' : '#FF9900',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
