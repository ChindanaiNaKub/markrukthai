import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../lib/auth';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, loading, logout, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, navigate, user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await updateProfile(username);
      setMessage('Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-text-dim">
        Loading account...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header active="about" />
      <main id="main-content" className="flex-1 max-w-md mx-auto w-full px-4 py-8">
        <div className="bg-surface-alt border border-surface-hover rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text-bright">Account</h1>
              <p className="text-text-dim text-sm mt-1">{user.email}</p>
            </div>
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-surface text-text-bright border border-surface-hover">
              {user.role}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <label className="block">
              <span className="block text-sm text-text-dim mb-2">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="3-20 letters, numbers, or underscores"
                className="w-full rounded-lg border border-surface-hover bg-surface px-3 py-2 text-text-bright outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </form>

          {message && <p className="text-sm text-primary mt-4">{message}</p>}
          {error && <p className="text-sm text-danger mt-4">{error}</p>}

          <div className="mt-6 pt-6 border-t border-surface-hover space-y-3">
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/feedback')}
                className="w-full py-2 rounded-lg border border-surface-hover text-text"
              >
                Open feedback moderation
              </button>
            )}
            <button
              onClick={async () => {
                await logout();
                navigate('/', { replace: true });
              }}
              className="w-full py-2 rounded-lg border border-danger/40 text-danger"
            >
              Sign out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
