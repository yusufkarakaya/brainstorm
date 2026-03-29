import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const notFound = params.get('notFound');

  async function createSession() {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions', { method: 'POST' });
      const { id } = await res.json();
      navigate(`/s/${id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="home">
      <div className="home-card">
        <h1>Brainstorm</h1>
        <p>A shared canvas for collaborative thinking. Anyone with the link can contribute.</p>
        {notFound && <div className="notice">Session not found. Start a new one below.</div>}
        <button className="btn-primary" onClick={createSession} disabled={loading}>
          {loading ? 'Creating...' : 'Start New Session'}
        </button>
      </div>
    </div>
  );
}
