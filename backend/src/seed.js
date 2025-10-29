import 'dotenv/config';
import mongoose from 'mongoose';
import { Experience, Slot, Promo } from './models.js';

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
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book_it';
  await mongoose.connect(uri);

  console.log('Connected to MongoDB.');

  // Fetch all experiences from DB
  const exps = await Experience.find({});
  console.log(`Fetched ${exps.length} experiences from DB.`);

  // Optional: clear existing slots and promos before re-seeding
  await Promise.all([
    Slot.deleteMany({}),
    Promo.deleteMany({})
  ]);

  // Create slots dynamically for each experience
  for (const exp of exps) {
    for (const d of nextDates(5)) {
      await Slot.insertMany([
        { experienceId: exp._id, date: d, timeLabel: '07:00 am', capacity: 6, available: 4 },
        { experienceId: exp._id, date: d, timeLabel: '09:00 am', capacity: 6, available: 2 },
        { experienceId: exp._id, date: d, timeLabel: '11:00 am', capacity: 6, available: 5 },
        { experienceId: exp._id, date: d, timeLabel: '01:00 pm', capacity: 6, available: 0 }
      ]);
    }
  }

  // Add promo codes
  await Promo.updateOne(
    { code: 'SAVE10' }, 
    { $set: { type: 'PERCENT', value: 10 } }, 
    { upsert: true }
  );
  await Promo.updateOne(
    { code: 'FLAT100' }, 
    { $set: { type: 'FLAT', value: 100 } }, 
    { upsert: true }
  );

  console.log('Slots and promos seeded successfully.');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
