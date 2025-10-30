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

// ================== CORS CONFIG (✅ FIXED) ==================
const allowedOrigins = [
  "https://frontend-1ngi7e8no-snidghas-projects.vercel.app", // ✅ your deployed frontend
  "https://frontend-in40qky2o-snidghas-projects.vercel.app", // ✅ backup Vercel deploy URL
  "http://localhost:5173", // local dev
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
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

// ================== ROUTES ==================

// Get all experiences (with optional search)
app.get("/api/experiences", async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
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
  await Booking.create({
    experienceId,
    date,
    slotId,
    qty,
    userId: user._id,
    refId: nanoid(10),
  });

  res.json({ ok: true, message: "Booking confirmed" });
});

// ================== SERVER ==================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running successfully on port ${PORT}`)
);

export default app;
