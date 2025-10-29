import axios from 'axios';
import type {
  Experience,
  ExperienceDetailsResponse,
  BookingPayload,
  BookingResponse,
  PromoValidationResponse,
  UserProfile
} from '../types';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export async function getExperiences(search?: string): Promise<Experience[]> {
  // Only include the search query if it contains at least one alphanumeric character.
  const includeSearch = typeof search === 'string' && /[a-z0-9\p{L}]/iu.test(search);
  const params = includeSearch ? { search } : undefined;
  try {
    const { data } = await client.get('/experiences', { params });
    return data;
  } catch (err: any) {
    // If the server returns 404 for some reason, return an empty list so UI doesn't crash.
    if (err?.response?.status === 404) return [];
    // Re-throw other errors so callers can handle them.
    throw err;
  }
}

export async function getExperienceDetails(id: string): Promise<ExperienceDetailsResponse> {
  const { data } = await client.get(`/experiences/${id}`);
  return data;
}

export async function validatePromo(code: string): Promise<PromoValidationResponse> {
  const { data } = await client.post('/promo/validate', { code });
  return data;
}

export async function signup(name: string, email: string) {
  const { data } = await client.post('/auth/signup', { name, email });
  return data;
}

export async function login(email: string) {
  const { data } = await client.post('/auth/login', { email });
  return data;
}

export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  const { data } = await client.post('/bookings', payload);
  return data;
}

export async function getUserProfile(email: string): Promise<UserProfile> {
  const { data } = await client.get('/users/profile', { params: { email } });
  return data;
}


