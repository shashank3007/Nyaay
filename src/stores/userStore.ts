import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, UserPreferences, SupportedLanguage } from '@/types'

interface UserStore {
  user: UserProfile | null
  preferences: UserPreferences
  setUser: (user: UserProfile | null) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  setLanguage: (language: SupportedLanguage) => void
  logout: () => void
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'hi',
  autoReadResponses: false,
  theme: 'light',
  voiceEnabled: true,
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      preferences: DEFAULT_PREFERENCES,

      setUser: (user) =>
        set((state) => ({
          user,
          preferences: user ? { ...state.preferences, language: user.preferred_language ?? state.preferences.language } : state.preferences,
        })),

      updateProfile: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),

      updatePreferences: (updates) =>
        set((state) => ({ preferences: { ...state.preferences, ...updates } })),

      setLanguage: (language) =>
        set((state) => ({
          preferences: { ...state.preferences, language },
          user: state.user ? { ...state.user, preferred_language: language } : null,
        })),

      logout: () => set({ user: null, preferences: DEFAULT_PREFERENCES }),
    }),
    { name: 'nyaay-user', partialize: (state) => ({ preferences: state.preferences }) }
  )
)
