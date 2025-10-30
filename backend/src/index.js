import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { nanoid } from "nanoid";
import { Booking, Experience, Promo, Slot, User } from "./models.js";

// ================== ENV SETUP ==================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
app.use(express.json());


// ================== CORS CONFIG (FINAL FIX) ==================
const allowedOrigins = [
  'https://book-it-snigma.netlify.app', // ✅ NO TRAILING SLASH!
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) {
        console.log('✅ No origin - allowing');
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        console.log('✅ CORS allowed for:', origin);
        return callback(null, true);
      }
      
      console.error('❌ CORS blocked for:', origin);
      console.error('   Allowed origins:', allowedOrigins);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // Cache preflight requests for 10 minutes
  })
);

// Pre-flight fix for all routes
app.options("*", cors());

// ================== DB CONNECTION ==================
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("❌ MONGODB_URI missing in environment variables!");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ================== HEALTH CHECK ==================
app.get("/api/health", (_, res) =>
  res.status(200).send("✅ Backend is live and CORS works!")
);

// Add connection check middleware
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    } catch (err) {
      console.error("MongoDB connection failed:", err);
      return res.status(503).json({ error: "Database unavailable" });
    }
  }
  next();
});

// ================== ROUTES ==================

// Get all experiences (with optional search)
app.get("/api/experiences", async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const exps = await Experience.find(filter).lean();
    res.json(exps);
  } catch (err) {
    console.error("❌ Error fetching experiences:", err);
    res.status(500).json({ error: "Failed to fetch experiences" });
  }
});

// Get single experience with slots
app.get("/api/experiences/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid ID" });

  const exp = await Experience.findById(id).lean();
  if (!exp) return res.status(404).json({ message: "Experience not found" });

  const slots = await Slot.find({ experienceId: id }).lean();

  const slotsByDate = {};
  for (const s of slots) {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
    slotsByDate[s.date].push({
      id: s._id,
      timeLabel: s.timeLabel,
      capacity: s.capacity,
      available: s.available,
    });
  }

  res.json({ experience: exp, slotsByDate });
});

// Validate promo code
app.post("/api/promo/validate", async (req, res) => {
  const code = (req.body.code || "").toUpperCase();
  const promo = await Promo.findOne({ code }).lean();
  res.json(
    promo ? { valid: true, type: promo.type, value: promo.value } : { valid: false }
  );
});

// Create booking
app.post("/api/bookings", async (req, res) => {
  const { experienceId, date, slotId, qty, name, email } = req.body;
  const emailNorm = (email || "").trim().toLowerCase();

  if (!experienceId || !date || !slotId || !qty || !name || !emailNorm)
    return res.status(400).json({ ok: false, message: "Missing required fields" });

  const slot = await Slot.findById(slotId);
  if (!slot || slot.available < qty)
    return res.status(409).json({ ok: false, message: "Not enough slots" });

  const user = await User.findOneAndUpdate(
    { email: emailNorm },
    { name, email: emailNorm },
    { upsert: true, new: true }
  );

  await Slot.updateOne({ _id: slot._id }, { $inc: { available: -qty } });
  const refId = nanoid(10);
  await Booking.create({
    experienceId,
    date,
    slotId,
    qty,
    userId: user._id,
    refId,
  });

  res.json({ ok: true, message: "Booking confirmed", refId });
});

// Get user profile with bookings
app.get('/api/users/profile', async (req, res) => {
  const email = (req.query.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email required' });

  const user = await User.findOne({ email }).lean();
  if (!user) return res.json({ user: { id: null, name: '', email }, bookings: [] });

  const bookings = await Booking.find({ userId: user._id }).lean();
  const exps = await Experience.find({ _id: { $in: bookings.map((b) => b.experienceId) } }).lean();
  const slots = await Slot.find({ _id: { $in: bookings.map((b) => b.slotId) } }).lean();

  const expMap = Object.fromEntries(exps.map((e) => [String(e._id), e]));
  const slotMap = Object.fromEntries(slots.map((s) => [String(s._id), s]));

  const enriched = bookings.map((b) => ({
    id: b._id,
    date: b.date,
    qty: b.qty,
    experience: expMap[b.experienceId],
    slot: slotMap[b.slotId],
  }));

  res.json({ user, bookings: enriched });
});


// ================== SERVER ==================
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'production') {

  app.listen(PORT, () =>
    console.log(`🚀 Server running successfully on port ${PORT}`)
  );
}
export default app;
