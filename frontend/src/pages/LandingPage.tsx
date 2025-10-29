import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

export function LandingPage() {
  return (
    <div>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 to-white">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-4xl font-extrabold mb-4">Travels & Journeys</h1>
          <p className="text-gray-700 mb-6">Discover curated experiences — from kayaking and surfing to hot air balloons and safaris. Book small-group adventures with trusted guides.</p>
          <div className="flex justify-center gap-4">
            <Link to="/signup" className="rounded bg-yellow-400 px-6 py-3 font-semibold">Get started</Link>
            <Link to="/experience" className="rounded border px-6 py-3">Explore</Link>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded border">Small groups</div>
            <div className="p-4 bg-white rounded border">Certified guides</div>
            <div className="p-4 bg-white rounded border">Safety first</div>
          </div>
        </div>
      </main>
    </div>
  );
}
