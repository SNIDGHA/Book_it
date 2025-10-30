import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { nanoid } from "nanoid";
import { Booking, Experience, Promo, Slot, User } from "./models.js";

// Resolve .env path manually to avoid relative path issues
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") }); // 👈 critical fix

const app = express();


// ======================== MIDDLEWARE ========================
app.use(
  cors({
    origin: [
      "https://frontend-in40qky2o-snidghas-projects.vercel.app", // deployed frontend
      "http://localhost:5173", // local testing
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// ======================== DB CONNECTION ========================
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("❌ MONGODB_URI missing in environment variables!");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ======================== ROUTES ========================

// Health check
app.get("/", (_, res) => res.json({ status: "ok", message: "Book_it API running" }));

// Get all experiences (with optional search)
app.get("/api/experiences", async (req, res) => {
  const search = req.query.search?.trim();
  const filter = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { shortDescription: { $regex: search, $options: "i" } },
          { longDescription: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const exps = await Experience.find(filter).lean();
  res.json(exps);
});

// Get single experience with slots
app.get("/api/experiences/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid id" });

  const exp = await Experience.findById(id).lean();
  if (!exp) return res.status(404).json({ message: "Not found" });

  const slots = await Slot.find({ experienceId: id }).lean();
  const slotsByDate = exp.dates.reduce((acc, date) => {
    acc[date] = slots
      .filter((s) => s.date === date)
      .map(({ _id, timeLabel, capacity, available }) => ({
        id: _id,
        timeLabel,
        capacity,
        available,
      }));
    return acc;
  }, {});

  res.json({ experience: exp, slotsByDate });
});

// Validate promo code
app.post("/api/promo/validate", async (req, res) => {
  const code = (req.body.code || "").toUpperCase();
  const promo = await Promo.findOne({ code }).lean();
  res.json(promo ? { valid: true, type: promo.type, value: promo.value } : { valid: false });
});

// Create booking
app.post("/api/bookings", async (req, res) => {
  const { experienceId, date, slotId, qty, name, email } = req.body;
  const emailNorm = (email || "").trim().toLowerCase();

  if (!experienceId || !date || !slotId || !qty || !name || !emailNorm)
    return res.status(400).json({ ok: false, message: "Missing fields" });

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

// ======================== SERVER ========================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

export default app;
