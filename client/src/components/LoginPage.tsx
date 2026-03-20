import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../lib/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { requestCode, verifyCode, user } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (user) {
    return <Navigate to="/account" replace />;
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      await requestCode(email);
      setStep('code');
      setNotice('Check your email for a 6-digit sign-in code.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyCode(email, code);
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header active="about" />
      <main id="main-content" className="flex-1 max-w-md mx-auto w-full px-4 py-8">
        <div className="bg-surface-alt border border-surface-hover rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-text-bright mb-2">Sign in</h1>
          <p className="text-text-dim text-sm mb-6">
            Accounts are optional. Anonymous play still works.
          </p>

          {step === 'email' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <label className="block">
                <span className="block text-sm text-text-dim mb-2">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-surface-hover bg-surface px-3 py-2 text-text-bright outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold disabled:opacity-60"
              >
                {loading ? 'Sending code...' : 'Send sign-in code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-sm text-text-dim">
                Code sent to <span className="text-text-bright">{email}</span>
              </div>
              <label className="block">
                <span className="block text-sm text-text-dim mb-2">6-digit code</span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  inputMode="numeric"
                  pattern="\d{6}"
                  className="w-full rounded-lg border border-surface-hover bg-surface px-3 py-2 text-text-bright outline-none tracking-[0.35em]"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Verify code'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError('');
                  setNotice('');
                }}
                className="w-full py-2 rounded-lg border border-surface-hover text-text"
              >
                Use another email
              </button>
            </form>
          )}

          {notice && <p className="text-sm text-primary mt-4">{notice}</p>}
          {error && <p className="text-sm text-danger mt-4">{error}</p>}
        </div>
      </main>
    </div>
  );
}
