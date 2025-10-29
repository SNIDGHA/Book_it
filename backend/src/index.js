import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { Booking, Experience, Promo, Slot, User } from './models.js';

const app = express();
// Configure CORS for production and development
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://book-it-frontend.vercel.app', 'https://book-it-site.vercel.app']
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book_it';
await mongoose.connect(mongoUri);
console.log('✅ MongoDB connected');

// Get all experiences
app.get('/api/experiences', async (req, res) => {
  const search = req.query.search?.trim().toLowerCase();
  const filter = search
    ? { $or: [{ title: { $regex: search, $options: 'i' } }, { city: { $regex: search, $options: 'i' } }, { shortDescription: { $regex: search, $options: 'i' } }, { longDescription: { $regex: search, $options: 'i' } }] }
    : {};
  const exps = await Experience.find(filter).lean();
  res.json(
    exps.map((e) => ({
      id: String(e._id),
      title: e.title,
      city: e.city,
      price: e.price,
      imageUrl: e.imageUrl,
      shortDescription: e.shortDescription,
      longDescription: e.longDescription,
      dates: e.dates
    }))
  );
});

// Get single experience with slots
app.get('/api/experiences/:id', async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  const exp = await Experience.findById(id).lean();
  if (!exp) return res.status(404).json({ message: 'Not found' });

  const slots = await Slot.find({ experienceId: exp._id }).lean();
  const slotsByDate = {};
  for (const date of exp.dates) {
    slotsByDate[date] = slots
      .filter((s) => s.date === date)
      .map((s) => ({ id: String(s._id), timeLabel: s.timeLabel, capacity: s.capacity, available: s.available }));
  }

  res.json({
    experience: {
      id: String(exp._id),
      title: exp.title,
      city: exp.city,
      price: exp.price,
      imageUrl: exp.imageUrl,
      shortDescription: exp.shortDescription,
      longDescription: exp.longDescription,
      dates: exp.dates
    },
    slotsByDate
  });
});

//Validate promo
app.post('/api/promo/validate', async (req, res) => {
  const code = (req.body.code || '').toUpperCase();
  const promo = await Promo.findOne({ code }).lean();
  if (!promo) return res.json({ valid: false });
  res.json({ valid: true, type: promo.type, value: promo.value });
});

//Create booking
app.post('/api/bookings', async (req, res) => {
  const { experienceId, date, slotId, qty, name, email } = req.body;
  const emailNormalized = String(email || '').trim().toLowerCase();
  if (!experienceId || !date || !slotId || !qty || !name || !emailNormalized)
    return res.status(400).json({ ok: false, message: 'Missing fields' });

  const slot = await Slot.findOne({ _id: slotId, date });
  if (!slot || slot.available < qty)
    return res.status(409).json({ ok: false, message: 'Not enough slots' });

  // Normalize and store email consistently to avoid lookup mismatches
  const user = await User.findOneAndUpdate(
    { email: emailNormalized },
    { $set: { name, email: emailNormalized } },
    { upsert: true, new: true }
  );
  await Slot.updateOne({ _id: slot._id }, { $inc: { available: -qty } });
  await Booking.create({
    experienceId,
    date,
    slotId,
    qty,
    userId: user._id,
    refId: nanoid(10)
  });

  res.json({ ok: true, message: 'Booking confirmed' });
});

// ---------------- DEV: delete booking (by id) ----------------
// Allows removing an accidental "draft" or test booking from DB. Restores slot availability.
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ ok: false, message: 'Invalid id' });
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ ok: false, message: 'Booking not found' });

    // restore slot availability
    if (booking.slotId && booking.qty) {
      await Slot.updateOne({ _id: booking.slotId }, { $inc: { available: booking.qty } });
    }

    await Booking.deleteOne({ _id: booking._id });
    res.json({ ok: true, message: 'Booking deleted' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ---------------- DEV: delete bookings by email ----------------
// Use to clear all bookings for a test user. Returns number deleted.
app.delete('/api/bookings-by-email', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ ok: false, message: 'email required' });
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

    const bookings = await Booking.find({ userId: user._id }).lean();
    for (const b of bookings) {
      if (b.slotId && b.qty) {
        await Slot.updateOne({ _id: b.slotId }, { $inc: { available: b.qty } });
      }
    }
    const result = await Booking.deleteMany({ userId: user._id });
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Delete bookings by email error:', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get user profile
app.get('/api/users/profile', async (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email required' });

  const user = await User.findOne({ email }).lean();
  if (!user) {
    // Return empty profile (200) so frontend shows "No bookings yet" instead of 404
    return res.json({ user: { id: null, name: '', email }, bookings: [] });
  }

  const bookings = await Booking.find({ userId: user._id }).lean();
  const expIds = [...new Set(bookings.map((b) => String(b.experienceId)))];
  const slotIds = [...new Set(bookings.map((b) => String(b.slotId)))];
  const exps = await Experience.find({ _id: { $in: expIds } }).lean();
  const slots = await Slot.find({ _id: { $in: slotIds } }).lean();

  const expById = Object.fromEntries(exps.map((e) => [String(e._id), e]));
  const slotById = Object.fromEntries(slots.map((s) => [String(s._id), s]));

  const enriched = bookings.map((b) => ({
    id: String(b._id),
    date: b.date,
    qty: b.qty,
    experience: expById[String(b.experienceId)] ? {
      id: String(b.experienceId),
      title: expById[String(b.experienceId)].title,
      price: expById[String(b.experienceId)].price,
      imageUrl: expById[String(b.experienceId)].imageUrl
    } : null,
    slot: slotById[String(b.slotId)] ? { id: String(b.slotId), timeLabel: slotById[String(b.slotId)].timeLabel } : null
  }));

  res.json({ user: { id: String(user._id), name: user.name, email: user.email }, bookings: enriched });
});

// Signup: create user with name and email
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) return res.status(400).json({ ok: false, message: 'name and email required' });
    const emailNormalized = String(email).trim().toLowerCase();
    // If user already exists, instruct them to login instead of creating a duplicate
    const existing = await User.findOne({ email: emailNormalized }).lean();
    if (existing) {
      return res.status(409).json({ ok: false, message: 'User already exists. Please login.' });
    }
    const user = await User.create({ name, email: emailNormalized });
    res.json({ ok: true, user: { id: String(user._id), name: user.name, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Login: lookup by email
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, message: 'email required' });
    const emailNormalized = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: emailNormalized }).lean();
    if (!user) return res.status(404).json({ ok: false, message: 'User not found' });
    res.json({ ok: true, user: { id: String(user._id), name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});
//SERVER
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(` API running at http://localhost:${PORT}`));

export default app;
