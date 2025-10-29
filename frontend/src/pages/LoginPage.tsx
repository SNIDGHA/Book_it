import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      console.log('Attempting login with:', email);
      const res = await login(email);
      
      if (res?.ok && res.user) {
        // Success: store user and redirect
        console.log('Login successful:', res.user);
        localStorage.setItem('bookit:lastUser', JSON.stringify(res.user));
        navigate('/home');
      } else {
        // API returned ok: false or no user
        console.warn('Login response invalid:', res);
        setError('Invalid login response from server');
      }
    } catch (err: any) {
      // Handle specific error cases
      if (err.response?.status === 404) {
        setError('User not found. Please check your email or sign up.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid email format');
      } else if (err.code === 'ECONNABORTED') {
        setError('Login timed out. Please try again.');
      } else {
        console.error('Login error:', err);
        setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md p-6">
        <h1 className="h2 mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded border">
          <div>
            <label className="block text-sm">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="rounded bg-yellow-400 px-4 py-2">{loading ? 'Logging...' : 'Login'}</button>
            <button type="button" className="text-sm text-gray-600" onClick={() => navigate('/signup')}>Create account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Example of using fetch directly
// fetch('https://book-it-ten-ecru.vercel.app/api/auth/login', {
//   method: 'POST',
//   headers: {'Content-Type': 'application/json'},
//   body: JSON.stringify({email: 'test@example.com'})
// })
// .then(r => r.text())
// .then(console.log)
// .catch(console.error)
