import dotenv from "dotenv";
import mongoose from "mongoose";
import { Experience, Slot, Promo } from "./models.js";

// Load .env from parent directory (backend/.env)
dotenv.config({ path: "./.env" });

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
  {
    title: "Kayaking",
    city: "Udupi",
    price: 999,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Curated small-group experience. Certified guide. Safety first with gear included.",
    longDescription:
      "Curated small-group experience. Certified guide. Safety first with gear included. Helmet and life jackets along with an expert will accompany in kayaking.",
    dates: nextDates(5),
  },
  {
    title: "Coffee Trail",
    city: "Coorg",
    price: 1299,
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Walk through lush estates with tasting session.",
    longDescription:
      "Walk through lush estates with tasting session and plantation history.",
    dates: nextDates(5),
  },
  {
    title: "Scuba Diving",
    city: "Goa",
    price: 2499,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Explore underwater marine life with certified instructors.",
    longDescription:
      "Dive into the crystal clear waters of Goa and explore vibrant coral reefs and marine life. All equipment provided with professional PADI certified instructors.",
    dates: nextDates(5),
  },
  {
    title: "Paragliding",
    city: "Bir Billing",
    price: 3499,
    imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Soar through the Himalayan skies with experienced pilots.",
    longDescription:
      "Experience the thrill of paragliding from one of the world's best paragliding sites. Tandem flights with experienced pilots and breathtaking mountain views.",
    dates: nextDates(5),
  },
  {
    title: "Trekking",
    city: "Manali",
    price: 1799,
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Guided trek through scenic mountain trails.",
    longDescription:
      "Trek through pristine Himalayan trails with experienced guides. Includes camping equipment, meals, and permits. Suitable for beginners and intermediate trekkers.",
    dates: nextDates(5),
  },
  {
    title: "River Rafting",
    city: "Rishikesh",
    price: 1499,
    imageUrl: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Navigate thrilling rapids on the holy Ganges river.",
    longDescription:
      "Experience the adrenaline rush of white water rafting on the Ganges. Professional guides, safety equipment, and riverside camping options available.",
    dates: nextDates(5),
  },
  {
    title: "Wildlife Safari",
    city: "Ranthambore",
    price: 2999,
    imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Spot tigers and wildlife in their natural habitat.",
    longDescription:
      "Embark on an exciting jungle safari in Ranthambore National Park. Expert naturalists guide you through tiger territory with high chances of wildlife sightings.",
    dates: nextDates(5),
  },
  {
    title: "Hot Air Balloon",
    city: "Jaipur",
    price: 4999,
    imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Float over the Pink City at sunrise.",
    longDescription:
      "Experience a magical sunrise hot air balloon ride over Jaipur's palaces and forts. Includes champagne breakfast and flight certificate.",
    dates: nextDates(5),
  },
  {
    title: "Rock Climbing",
    city: "Hampi",
    price: 899,
    imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Scale ancient boulders with expert climbers.",
    longDescription:
      "Climb the unique boulder formations of Hampi with certified instructors. All climbing gear provided. Suitable for beginners to advanced climbers.",
    dates: nextDates(5),
  },
  {
    title: "Surfing Lessons",
    city: "Varkala",
    price: 1199,
    imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=1400&auto=format&fit=crop",
    shortDescription: "Learn to ride the waves on Kerala's coast.",
    longDescription:
      "Professional surfing lessons on the beautiful beaches of Varkala. Surfboards and wetsuits provided. Perfect for beginners and intermediate surfers.",
    dates: nextDates(5),
  },
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
