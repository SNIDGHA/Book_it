import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import type { BookingPayload } from '../types';
import { createBooking, validatePromo } from '../lib/api';
import { useMemo, useState } from 'react';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as any;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ type: 'PERCENT' | 'FLAT'; value: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state) {
    return (
      <div>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">Missing selection. Go back and pick a slot.</main>
      </div>
    );
  }

  const subtotal = state.experience.price * state.qty;
  const discount = promoApplied ? (promoApplied.type === 'PERCENT' ? Math.round(subtotal * (promoApplied.value / 100)) : promoApplied.value) : 0;
  const taxes = Math.round((subtotal - discount) * 0.059);
  const total = useMemo(() => subtotal - discount + taxes, [subtotal, discount, taxes]);

  async function onApplyPromo() {
    setError(null);
    try {
      const res = await validatePromo(promo.trim());
      if (!res.valid || !res.type) {
        setPromoApplied(null);
        setError('Invalid promo code');
      } else {
        setPromoApplied({ type: res.type, value: res.value });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to validate');
    }
  }

  async function onPayConfirm() {
    setSubmitting(true);
    setError(null);
    const payload: BookingPayload = {
      experienceId: state.experience._id,
      date: state.date,
      slotId: state.slot.id,
      qty: state.qty,
      name,
      email,
      promoCode: promoApplied ? promo : undefined
    };
    try {
      const res = await createBooking(payload);
      // store last user locally for Profile page
      try { localStorage.setItem('bookit:lastUser', JSON.stringify({ name, email })); } catch {}
      if (res.ok) navigate('/result', { state: { ok: true, refId: res.refId } });
      else navigate('/result', { state: { ok: false, message: res.message } });
    } catch (e: any) {
      navigate('/result', { state: { ok: false, message: e?.message || 'Booking failed' } });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <section className="rounded border bg-white p-4">
          <button className="text-sm mb-4" onClick={() => navigate(-1)}>&larr; Checkout</button>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your name" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2 flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm">Promo code</label>
                <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <button onClick={onApplyPromo} className="rounded bg-gray-900 text-white px-4 py-2 text-sm h-[38px]">Apply</button>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded border" /> I agree to the terms and safety policy
            </label>
          </div>
          {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
        </section>
        <aside className="rounded border bg-white p-4">
          <div className="flex items-center justify-between text-sm py-2 border-b"><span>Experience</span><span>{state.experience.title}</span></div>
          <div className="flex items-center justify-between text-sm py-2 border-b"><span>Date</span><span>{state.date}</span></div>
          <div className="flex items-center justify-between text-sm py-2 border-b"><span>Time</span><span>{state.slot.timeLabel}</span></div>
          <div className="flex items-center justify-between text-sm py-2 border-b"><span>Qty</span><span>{state.qty}</span></div>
          <div className="flex items-center justify-between text-sm py-2 border-b"><span>Subtotal</span><span>₹{subtotal}</span></div>
          {promoApplied && (
            <div className="flex items-center justify-between text-sm py-2 border-b text-green-700"><span>Promo</span><span>-₹{discount}</span></div>
          )}
          <div className="flex items-center justify-between text-sm py-2 border-b"><span>Taxes</span><span>₹{taxes}</span></div>
          <div className="flex items-center justify-between py-3 font-semibold"><span>Total</span><span>₹{total}</span></div>
          <button disabled={!name || !email || submitting} onClick={onPayConfirm} className="w-full rounded bg-yellow-400 py-2 font-medium disabled:opacity-60">Pay and Confirm</button>
        </aside>
      </main>
    </div>
  );
}


