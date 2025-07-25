import { ESIMPlan, Trip, ActiveESIM, UserProfile } from '../types';

// Base API configuration
const API_BASE_URL = 'https://api.travelesim.com'; // Replace with actual API URL

// API endpoints
const ENDPOINTS = {
  ESIM_PLANS: '/esim-plans',
  TRIPS: '/trips',
  ACTIVE_ESIMS: '/active-esims',
  USER_PROFILE: '/user/profile',
  PURCHASE: '/purchase',
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// eSIM Plans API
export const esimPlansAPI = {
  // Get all available eSIM plans
  getAll: async (): Promise<ESIMPlan[]> => {
    return apiRequest<ESIMPlan[]>(ENDPOINTS.ESIM_PLANS);
  },

  // Get eSIM plans by region
  getByRegion: async (region: string): Promise<ESIMPlan[]> => {
    return apiRequest<ESIMPlan[]>(`${ENDPOINTS.ESIM_PLANS}?region=${region}`);
  },

  // Get eSIM plan by ID
  getById: async (id: string): Promise<ESIMPlan> => {
    return apiRequest<ESIMPlan>(`${ENDPOINTS.ESIM_PLANS}/${id}`);
  },

  // Search eSIM plans
  search: async (query: string): Promise<ESIMPlan[]> => {
    return apiRequest<ESIMPlan[]>(`${ENDPOINTS.ESIM_PLANS}/search?q=${query}`);
  },
};

// Trips API
export const tripsAPI = {
  // Get user trips
  getAll: async (): Promise<Trip[]> => {
    return apiRequest<Trip[]>(ENDPOINTS.TRIPS);
  },

  // Create new trip
  create: async (trip: Omit<Trip, 'id'>): Promise<Trip> => {
    return apiRequest<Trip>(ENDPOINTS.TRIPS, {
      method: 'POST',
      body: JSON.stringify(trip),
    });
  },

  // Update trip
  update: async (id: string, trip: Partial<Trip>): Promise<Trip> => {
    return apiRequest<Trip>(`${ENDPOINTS.TRIPS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trip),
    });
  },

  // Delete trip
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`${ENDPOINTS.TRIPS}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Active eSIMs API
export const activeESIMsAPI = {
  // Get user's active eSIMs
  getAll: async (): Promise<ActiveESIM[]> => {
    return apiRequest<ActiveESIM[]>(ENDPOINTS.ACTIVE_ESIMS);
  },

  // Get eSIM usage data
  getUsage: async (id: string): Promise<{ dataUsed: number; dataTotal: number }> => {
    return apiRequest<{ dataUsed: number; dataTotal: number }>(
      `${ENDPOINTS.ACTIVE_ESIMS}/${id}/usage`
    );
  },

  // Activate eSIM
  activate: async (planId: string): Promise<ActiveESIM> => {
    return apiRequest<ActiveESIM>(`${ENDPOINTS.ACTIVE_ESIMS}/activate`, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  },

  // Deactivate eSIM
  deactivate: async (id: string): Promise<void> => {
    return apiRequest<void>(`${ENDPOINTS.ACTIVE_ESIMS}/${id}/deactivate`, {
      method: 'POST',
    });
  },
};

// User Profile API
export const userAPI = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    return apiRequest<UserProfile>(ENDPOINTS.USER_PROFILE);
  },

  // Update user profile
  updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    return apiRequest<UserProfile>(ENDPOINTS.USER_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
};

// Purchase API
export const purchaseAPI = {
  // Purchase eSIM plan
  purchase: async (planId: string, paymentMethod: string): Promise<{ success: boolean; orderId: string }> => {
    return apiRequest<{ success: boolean; orderId: string }>(ENDPOINTS.PURCHASE, {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethod }),
    });
  },

  // Get purchase history
  getHistory: async (): Promise<any[]> => {
    return apiRequest<any[]>(`${ENDPOINTS.PURCHASE}/history`);
  },
};

// Mock data for development (remove in production)
export const mockData = {
  esimPlans: [
    {
      id: '1',
      name: 'Europe Unlimited',
      country: 'Europe',
      countryCode: 'EU',
      dataAmount: 'Unlimited',
      validity: '30 days',
      price: 29.99,
      currency: 'USD',
      description: 'Unlimited data across 30+ European countries',
      features: ['Unlimited Data', '30 Countries', '24/7 Support'],
      coverage: ['France', 'Germany', 'Italy', 'Spain', 'Netherlands'],
      activationTime: 'Instant',
      isPopular: true,
    },
    {
      id: '2',
      name: 'Asia Explorer',
      country: 'Asia',
      countryCode: 'AS',
      dataAmount: '10GB',
      validity: '15 days',
      price: 19.99,
      currency: 'USD',
      description: 'High-speed data across major Asian destinations',
      features: ['10GB Data', '15 Countries', 'Fast 4G'],
      coverage: ['Japan', 'South Korea', 'Thailand', 'Singapore'],
      activationTime: 'Instant',
      isRecommended: true,
    },
  ],
};

// Utility function to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));