import { useState } from 'react';
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react';
import { resetUsersToDefault } from '../../hooks/useAuth.js';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Brief artificial delay so the button state is visible
    await new Promise((r) => setTimeout(r, 380));
    const result = onLogin(username.trim(), password);
    if (result.error) setError(result.error);
    setLoading(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '420px', maxWidth: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        padding: '36px 32px 28px',
        boxShadow: '0 24px 70px rgba(0,0,0,0.13)',
      }}>

        {/* Logo mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '15px',
            background: '#FF9900',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 0 30px rgba(255,153,0,0.30)',
          }}>
            <Zap size={28} color="#000" fill="#000" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            MT Services
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
            Active Work Orders System
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
              style={{
                width: '100%', padding: '10px 13px', borderRadius: '8px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e)  => { e.target.style.borderColor = '#FF9900'; }}
              onBlur={(e)   => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={{
                  width: '100%', padding: '10px 40px 10px 13px', borderRadius: '8px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e)  => { e.target.style.borderColor = '#FF9900'; }}
                onBlur={(e)   => { e.target.style.borderColor = 'var(--border)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex' }}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: '14px', padding: '9px 13px', borderRadius: '7px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: '0.78rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px', borderRadius: '8px',
              background: '#FF9900', border: 'none',
              color: '#000', fontSize: '0.88rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.filter = 'brightness(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
          >
            {loading
              ? <span style={{ animation: 'login-spin 0.9s linear infinite', display: 'inline-block', fontSize: '1rem' }}>⟳</span>
              : <LogIn size={16} />
            }
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Can't log in? Reset link */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all user accounts to defaults?\n\nThis will restore:\n• admin / Admin@123\n• manager / Mgr@123\n• operator / Op@123')) {
                resetUsersToDefault();
                window.location.reload();
              }
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Can't log in? Reset accounts to defaults
          </button>
        </div>

      </div>

      <style>{`
        @keyframes login-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
