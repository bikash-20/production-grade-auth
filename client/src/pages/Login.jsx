import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const fn = mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
      const { error } = await fn;
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleOAuth(provider) {
    setError('');
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
  }

  return (
    <div className="card">
      <h1>{mode === 'signin' ? 'Log in' : 'Sign up'}</h1>

      <div className="toggle">
        <button
          type="button"
          className={mode === 'signin' ? 'active' : ''}
          onClick={() => setMode('signin')}
        >Log in</button>
        <button
          type="button"
          className={mode === 'signup' ? 'active' : ''}
          onClick={() => setMode('signup')}
        >Sign up</button>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Working...' : mode === 'signin' ? 'Log in' : 'Create account'}
        </button>
      </form>

      <div className="divider"><span>or</span></div>

      <button type="button" className="oauth" onClick={() => handleOAuth('google')}>
        Continue with Google
      </button>
      <button type="button" className="oauth" onClick={() => handleOAuth('github')}>
        Continue with GitHub
      </button>
    </div>
  );
}