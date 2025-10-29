import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { getExperienceDetails } from '../lib/api';
import type { ExperienceDetailsResponse, Slot } from '../types';

export function DetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ExperienceDetailsResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExperienceDetails(id)
      .then((d) => {
        setData(d);
        setSelectedDate(d.experience.dates[0]);
      })
      .catch((e) => setError(e?.message || 'Failed to load'));
  }, [id]);

  const total = useMemo(() => {
    if (!data) return 0;
    const subtotal = data.experience.price * qty;
    const taxes = Math.round(subtotal * 0.059); // approx 5.9% like screenshots
    return subtotal - 0 + taxes;
  }, [data, qty]);

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {!data && !error && <div className="text-sm text-gray-600">Loading...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div>
              <button className="text-sm mb-3" onClick={() => navigate(-1)}>&larr; Details</button>
              <img src={data.experience.imageUrl} className="w-full h-72 object-cover rounded border" />
              <section className="mt-4 rounded border bg-white">
                <div className="p-4 border-b">
                  <h2 className="h2">{data.experience.title}</h2>
                  <p className="muted mt-2">{data.experience.longDescription}</p>
                </div>
                <div className="p-4">
                  <div className="font-medium mb-2">Choose date</div>
                  <div className="flex flex-wrap gap-2">
                    {data.experience.dates.map((d) => (
                      <button
                        key={d}
                        onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                        className={`text-sm rounded px-3 py-1.5 border ${selectedDate === d ? 'bg-yellow-100 border-yellow-400' : 'bg-white'}`}
                      >
                        {new Date(d).toDateString().slice(4, 10)}
                      </button>
                    ))}
                  </div>
                  <div className="font-medium mt-4 mb-2">Choose time</div>
                  <div className="flex flex-wrap gap-2">
                    {(data.slotsByDate[selectedDate] || []).map((slot) => {
                      const soldOut = slot.available <= 0;
                      return (
                        <button
                          key={slot.id}
                          disabled={soldOut}
                          onClick={() => setSelectedSlot(slot)}
                          className={`text-sm rounded px-3 py-1.5 border disabled:opacity-50 ${selectedSlot?.id === slot.id ? 'bg-yellow-100 border-yellow-400' : 'bg-white'}`}
                        >
                          {slot.timeLabel}
                          {soldOut ? '  Sold out' : slot.available < 5 ? `  ${slot.available} left` : ''}
                        </button>
                      );
                    })}
                  </div>
                  <div className="muted mt-3">All times are in IST (GMT +5:30)</div>
                  <div className="mt-6">
                    <div className="font-medium mb-2">About</div>
                    <div className="rounded border bg-gray-50 p-3 text-sm text-gray-600">Scenic routes, trained guides, and safety briefing. Minimum age 10.</div>
                  </div>
                </div>
              </section>
            </div>
            <aside className="rounded border bg-white p-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="text-sm">Starts at</div>
                <div className="font-semibold">₹{data.experience.price}</div>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="text-sm">Quantity</div>
                <div className="flex items-center gap-2">
                  <button className="px-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button className="px-2" onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b text-sm">
                <div>Subtotal</div>
                <div>₹{data.experience.price * qty}</div>
              </div>
              <div className="flex items-center justify-between py-2 border-b text-sm">
                <div>Taxes</div>
                <div>₹{Math.round(data.experience.price * qty * 0.059)}</div>
              </div>
              <div className="flex items-center justify-between py-3 font-semibold">
                <div>Total</div>
                <div>₹{total}</div>
              </div>
              <button
                className="w-full rounded bg-gray-200 py-2 font-medium disabled:opacity-60"
                disabled={!selectedSlot}
                onClick={() => navigate('/checkout', { state: { experience: data.experience, date: selectedDate, slot: selectedSlot, qty } })}
              >
                Confirm
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}


