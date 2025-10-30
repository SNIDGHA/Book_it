import dotenv from "dotenv";
import mongoose from "mongoose";
import { Experience, Slot, Promo } from "./models.js";

// Load .env from parent directory (backend/.env)
dotenv.config({ path: "../.env" });

console.log("✅ Using MongoDB URI:", process.env.MONGODB_URI);

function nextDates(n) {
  const now = new Date();
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("❌ MONGODB_URI not found in .env file");
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB Atlas");

  // Clear old data (optional safety)
  await Promise.all([
    Experience.deleteMany({}),
    Slot.deleteMany({}),
    Promo.deleteMany({})
  ]);

  // Insert new experiences
  const experiences = await Experience.insertMany([
    { title: "Beach Yoga at Goa", location: "Goa", price: 800, rating: 4.9, image: "https://images.unsplash.com/photo-1602928321677-dfcdcb664dc4" },
    { title: "Paragliding at Bir Billing", location: "Himachal Pradesh", price: 2500, rating: 4.8, image: "https://images.unsplash.com/photo-1562774053-701939374585" },
    { title: "Scuba Diving at Andaman", location: "Andaman & Nicobar", price: 3500, rating: 5.0, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" },
    { title: "Trekking in Kedarkantha", location: "Uttarakhand", price: 1800, rating: 4.7, image: "https://images.unsplash.com/photo-1618902436749-8f0b7a8ce60d" },
    { title: "Camping in Rishikesh", location: "Rishikesh", price: 1200, rating: 4.6, image: "https://images.unsplash.com/photo-1595433562696-19e3e7174d3a" },
    { title: "Desert Safari in Jaisalmer", location: "Rajasthan", price: 2200, rating: 4.8, image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b" },
    { title: "Backwater Boating in Kerala", location: "Kerala", price: 1500, rating: 4.5, image: "https://images.unsplash.com/photo-1549880188-3b56b49f7c4b" },
    { title: "Hot Air Balloon in Jaipur", location: "Jaipur", price: 2700, rating: 4.9, image: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d" },
    { title: "Cave Exploration in Meghalaya", location: "Meghalaya", price: 1600, rating: 4.7, image: "https://images.unsplash.com/photo-1613067162037-36d6fdfb3f3e" },
    { title: "Snowboarding in Gulmarg", location: "Kashmir", price: 3000, rating: 5.0, image: "https://images.unsplash.com/photo-1545060894-20f1719b7aef" },
  ]);

  console.log(`📦 Inserted ${experiences.length} new experiences.`);

  // Create slots dynamically for each experience
  for (const exp of experiences) {
    const dates = nextDates(5);
    const slotData = [];

    for (const d of dates) {
      slotData.push(
        { experienceId: exp._id, date: d, timeLabel: "07:00 am", capacity: 6, available: 4 },
        { experienceId: exp._id, date: d, timeLabel: "09:00 am", capacity: 6, available: 2 },
        { experienceId: exp._id, date: d, timeLabel: "11:00 am", capacity: 6, available: 5 },
        { experienceId: exp._id, date: d, timeLabel: "01:00 pm", capacity: 6, available: 0 }
      );
    }

    await Slot.insertMany(slotData);
  }

  // Add promo codes
  await Promo.updateOne(
    { code: "SAVE10" },
    { $set: { type: "PERCENT", value: 10 } },
    { upsert: true }
  );

  await Promo.updateOne(
    { code: "FLAT100" },
    { $set: { type: "FLAT", value: 100 } },
    { upsert: true }
  );

  console.log("🎉 Experiences, slots, and promo codes seeded successfully.");
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB Atlas");
}

main().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});
