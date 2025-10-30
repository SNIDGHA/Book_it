export type Experience = {
  _id: string;
  id?: string;
  title: string;
  city: string;
  price: number; // base price per ticket
  imageUrl: string;
  shortDescription: string;
  longDescription: string;
  dates: string[]; // yyyy-mm-dd
};

export type Slot = {
  id: string;
  timeLabel: string; // e.g. "09:00 am"
  capacity: number; // total seats
  available: number; // remaining seats
};

export type ExperienceDetailsResponse = {
  experience: Experience;
  slotsByDate: Record<string, Slot[]>;
};

export type PromoValidationResponse = {
  valid: boolean;
  type: 'PERCENT' | 'FLAT' | null;
  value: number; // percent or flat amount
};

export type BookingPayload = {
  experienceId: string;
  date: string; // yyyy-mm-dd
  slotId: string;
  qty: number;
  name: string;
  email: string;
  promoCode?: string;
};

export type BookingResponse = {
  ok: boolean;
  refId?: string;
  message?: string;
};

export type UserProfile = {
  user: { id: string; name: string; email: string };
  bookings: Array<{
    id: string;
    date: string;
    qty: number;
    experience: { id: string; title: string; price: number; imageUrl: string } | null;
    slot: { id: string; timeLabel: string } | null;
  }>;
};


