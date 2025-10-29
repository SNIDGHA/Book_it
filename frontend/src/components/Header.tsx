import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = () => {
    const value = searchQuery.trim();
    // Only navigate with a search param when it contains at least one alphanumeric character
    if (/[a-z0-9\p{L}]/iu.test(value)) {
      navigate(`/?search=${encodeURIComponent(value)}`);
    } else {
      // Clear search param for empty or punctuation-only input
      navigate('/');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // user from localStorage (simple auth)
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  useEffect(() => {
    try {
      const s = localStorage.getItem('bookit:lastUser');
      setUser(s ? JSON.parse(s) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bookit:lastUser');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-2 md:gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-yellow-400 grid place-content-center font-bold text-xs">hd</div>
          <span className="font-semibold hidden sm:inline">highway delite</span>
        </Link>
        <div className="ml-auto flex items-center gap-2 md:gap-3 flex-1 justify-end">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search experiences"
            className="w-full max-w-[180px] sm:max-w-[260px] md:max-w-[420px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={handleSearch}
            className="rounded-md bg-yellow-400 px-3 md:px-4 py-2 text-sm font-medium whitespace-nowrap"
          >
            Search
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 rounded-full border px-2 py-1 hover:bg-gray-50 flex-shrink-0">
                <div className="h-7 w-7 rounded-full bg-yellow-400 grid place-content-center text-xs font-semibold">{(user.name || 'U').slice(0,1)}</div>
                <span className="hidden lg:block text-sm font-medium">{user.name || 'My Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="text-sm px-3 py-1 rounded border bg-white hover:bg-gray-50">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm px-3 py-1 rounded border bg-white hover:bg-gray-50">Login</Link>
              <Link to="/signup" className="text-sm px-3 py-1 rounded bg-yellow-400">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


