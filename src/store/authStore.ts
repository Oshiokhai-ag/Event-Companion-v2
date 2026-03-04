// src/store/authStore.ts
import { create } from 'zustand';

// NOTE: Persistence is intentionally disabled to avoid localStorage
// restrictions in sandboxed preview environments.
// For production, re-enable by wrapping the store config in:
//   persist((set) => ({...}), { name: 'auth-storage' })
// and importing { persist } from 'zustand/middleware'

interface User {
  id: string;
  name: string;
  email: string;
  profile_photo_url?: string;
  interests: string[];
  bio?: string;
  phone_verified: boolean;
  average_rating?: number;
  review_count: number;
  discovery_radius: number;
  location_city?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (updates: Partial<User>) => void;
  setOnboardingComplete: (complete?: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,

  login: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  logout: () =>
    // ✅ FIX: No localStorage call here. The token is only in memory.
    // If persistence is re-enabled later, the persist middleware handles cleanup.
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    }),

  setUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setOnboardingComplete: (complete = true) =>
    set({ hasCompletedOnboarding: complete }),
}));
