import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
  const { user, session, signOut } = useAuth();
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        setMe(data);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [session]);

  return (
    <div className="card">
      <h1>Dashboard</h1>
      <p className="label">Signed in as</p>
      <p className="email">{user?.email}</p>

      <div className="api-box">
        <p className="label">GET /api/me response</p>
        <pre>{error ? `Error: ${error}` : JSON.stringify(me, null, 2)}</pre>
      </div>

      <button type="button" className="primary" onClick={signOut}>
        Log out
      </button>
    </div>
  );
}