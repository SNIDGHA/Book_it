import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { getUserProfile } from '../lib/api';
import type { UserProfile } from '../types';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const [email, setEmail] = useState<string>(() => {
    try {
      const s = localStorage.getItem('bookit:lastUser');
      return s ? JSON.parse(s).email : '';
    } catch { return ''; }
  });
  const [data, setData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      setData(await getUserProfile(email));
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-end gap-3">
            <div className="h-12 w-12 rounded-full bg-yellow-400 grid place-content-center font-semibold">
              {(data?.user.name || 'U').slice(0, 1)}
            </div>
            <div>
              <h1 className="h1">My Profile</h1>
              <div className="muted">View your info and bookings</div>
            </div>
          </div>

          {/*Back to Home button */}
          <Link
            to="/"
            className="rounded bg-yellow-400 text-gray-900 px-4 py-2 font-medium hover:bg-yellow-500 transition"
          >
            ← Back to Home
          </Link>
        </div>

        <section className="mt-6 grid gap-6">
          <div className="rounded border bg-white p-4">
            <div className="font-medium mb-2">User</div>
            <div className="text-sm">Name</div>
            <div className="font-medium">{data?.user.name || '-'}</div>
            <div className="text-sm mt-3">Email</div>
            <div className="font-medium break-all">{data?.user.email || '-'}</div>
          </div>

          <div className="rounded border bg-white p-4">
            <div className="font-medium mb-3">Last Bookings</div>
            {!data?.bookings?.length && <div className="muted">No bookings yet.</div>}
            <div className="grid gap-3">
              {data?.bookings.slice(-3).map((b) => (
                <div key={b.id} className="flex gap-3 border rounded p-3">
                  <img
                    src={b.experience?.imageUrl}
                    className="h-20 w-28 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{b.experience?.title}</div>
                    <div className="text-sm text-gray-600">
                      {b.date} • {b.slot?.timeLabel} • Qty {b.qty}
                    </div>
                  </div>
                  <div className="font-semibold self-start">
                    ₹{b.experience?.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
