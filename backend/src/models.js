import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

const ExperienceSchema = new mongoose.Schema(
  {
    title: String,
    city: String,
    price: Number,
    imageUrl: String,
    shortDescription: String,
    longDescription: String,
    dates: [String]
  },
  { timestamps: true }
);

const SlotSchema = new mongoose.Schema(
  {
    experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', index: true },
    date: { type: String, index: true },
    timeLabel: String,
    capacity: Number,
    available: Number
  },
  { timestamps: true }
);

const BookingSchema = new mongoose.Schema(
  {
    experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience' },
    date: String,
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
    qty: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const PromoSchema = new mongoose.Schema({ code: { type: String, unique: true }, type: String, value: Number });

export const User = mongoose.model('User', UserSchema);
export const Experience = mongoose.model('Experience', ExperienceSchema);
export const Slot = mongoose.model('Slot', SlotSchema);
export const Booking = mongoose.model('Booking', BookingSchema);
export const Promo = mongoose.model('Promo', PromoSchema);


