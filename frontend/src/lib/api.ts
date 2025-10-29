import axios from 'axios';
import type {
  Experience,
  ExperienceDetailsResponse,
  BookingPayload,
  BookingResponse,
  PromoValidationResponse,
  UserProfile
} from '../types';

// Prefer localhost in dev (Vite exposes import.meta.env.DEV).
const BUILT_API = import.meta.env.VITE_API_URL as string | undefined;
const IS_DEV = Boolean(import.meta.env.DEV);
const RUNTIME_FALLBACK = IS_DEV 
  ? 'http://localhost:4000' 
  : (BUILT_API || 'https://book-it-vppn.vercel.app');

const API_URL = RUNTIME_FALLBACK;

console.log('API URL:', API_URL); // Debug log

const client = axios.create({ 
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000, // 15s timeout to avoid long hangs in dev
});

// Add request/response logging
client.interceptors.request.use(request => {
  console.log('Starting Request:', request.method, request.url);
  return request;
});

client.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
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

// Test function to check API connectivity
async function testApiConnection() {
  try {
    console.log('Testing API connection to:', API_URL);
    const response = await fetch(API_URL + '/health');
    console.log('API health check response:', await response.text());
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}

export async function login(email: string) {
  try {
    // Test API connection first
    await testApiConnection();
    
    console.log('Sending login request to:', API_URL + '/api/auth/login');
    const { data } = await client.post('/auth/login', { email });
    console.log('Login success:', data);
    return data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.error('Login request timed out. API might be down or slow.');
    } else {
      console.error('Login failed:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
    throw error;
  }
}

export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  const { data } = await client.post('/bookings', payload);
  return data;
}

export async function getUserProfile(email: string): Promise<UserProfile> {
  const { data } = await client.get('/users/profile', { params: { email } });
  return data;
}


