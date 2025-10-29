import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

export function ResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as any;

  const ok = state?.ok;
  const refId = state?.refId as string | undefined;
  const message = state?.message as string | undefined;

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className={`mx-auto h-14 w-14 rounded-full grid place-content-center text-2xl ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {ok ? '✓' : '✕'}
        </div>
        <h1 className="h1 mt-4">{ok ? 'Booking Confirmed' : 'Booking Failed'}</h1>
        <div className="muted mt-2">{ok ? `Ref ID: ${refId}` : message || 'Please try again'}</div>
        <button onClick={() => navigate('/')} className="mt-6 rounded bg-gray-200 px-4 py-2">Back to Home</button>
      </main>
    </div>
  );
}


