import { useEffect, useState } from 'react';
import { getExperiences } from '../lib/api';
import type { Experience } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';

export function HomePage() {
  const [experiences, setExperiences] = useState<Experience[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setError(null);
    getExperiences(search)
      .then(setExperiences)
      .catch((e) => setError(e?.message || 'Failed to load'));
  }, [search]);

  // If user logged in, when landing to '/', app may navigate to /home - ensure home is visible.
  // Nothing to do here; Header handles login state.  

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Experiences</h1>

        {!experiences && !error && (
          <div className="text-sm text-gray-600">Loading...</div>
        )}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {experiences?.length === 0 && search && (
          <div className="text-gray-600 text-sm">
            No experiences found matching "{search}"
          </div>
        )}

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {experiences?.map((exp) => (
            <div
              key={exp._id}
              className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="relative">
                <img
                  src={exp.imageUrl}
                  alt={exp.title}
                  className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full shadow">
                  {exp.city}
                </span>
              </div>

              <div className="p-5 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-500 transition">
                  {exp.title}
                </h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-relaxed">
                  {exp.shortDescription}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-base text-gray-800">
                    From <span className="font-semibold text-gray-900">₹{exp.price}</span>
                  </div>
                  <Link
                    to={`/experience/${exp._id}`}
                    className="text-sm bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-2 rounded-md transition"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
