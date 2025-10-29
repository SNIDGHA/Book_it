import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../lib/api';

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signup(name, email);
      if (res?.ok && res.user) {
        localStorage.setItem('bookit:lastUser', JSON.stringify(res.user));
        navigate('/home');
      } else {
        setError(res?.message || 'Signup failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md p-6">
        <h1 className="h2 mb-4">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded border">
          <div>
            <label className="block text-sm">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="rounded bg-yellow-400 px-4 py-2">{loading ? 'Creating...' : 'Create account'}</button>
            <button type="button" className="text-sm text-gray-600" onClick={() => navigate('/login')}>Already have an account?</button>
          </div>
        </form>
      </div>
    </div>
  );
}
