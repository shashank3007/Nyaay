import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from '@/stores/userStore'
import type { UserProfile, SupportedLanguage } from '@/types'

const MOCK_USER: UserProfile = {
  id: 'user-123',
  email: 'test@example.com',
  phone: null,
  full_name: 'Priya Sharma',
  preferred_language: 'hi',
  avatar_url: null,
  is_premium: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

function resetStore() {
  useUserStore.setState({
    user: null,
    preferences: {
      language: 'hi',
      autoReadResponses: false,
      theme: 'light',
      voiceEnabled: true,
    },
  })
}

describe('userStore', () => {
  beforeEach(resetStore)

  // ── Initial state ────────────────────────────────────────────
  describe('initial state', () => {
    it('starts with null user', () => {
      expect(useUserStore.getState().user).toBeNull()
    })

    it('starts with default preferences', () => {
      const { preferences } = useUserStore.getState()
      expect(preferences.language).toBe('hi')
      expect(preferences.voiceEnabled).toBe(true)
      expect(preferences.autoReadResponses).toBe(false)
      expect(preferences.theme).toBe('light')
    })
  })

  // ── setUser ──────────────────────────────────────────────────
  describe('setUser()', () => {
    it('sets user profile', () => {
      useUserStore.getState().setUser(MOCK_USER)
      expect(useUserStore.getState().user).toEqual(MOCK_USER)
    })

    it('syncs language preference from user profile', () => {
      useUserStore.getState().setUser({ ...MOCK_USER, preferred_language: 'ta' })
      expect(useUserStore.getState().preferences.language).toBe('ta')
    })

    it('accepts null to clear user', () => {
      useUserStore.getState().setUser(MOCK_USER)
      useUserStore.getState().setUser(null)
      expect(useUserStore.getState().user).toBeNull()
    })

    it('does not change language preference when clearing user', () => {
      useUserStore.getState().setUser({ ...MOCK_USER, preferred_language: 'en' })
      useUserStore.getState().setUser(null)
      // Preferences persist — language stays 'en'
      expect(useUserStore.getState().preferences.language).toBe('en')
    })
  })

  // ── updateProfile ────────────────────────────────────────────
  describe('updateProfile()', () => {
    it('merges partial updates into user', () => {
      useUserStore.getState().setUser(MOCK_USER)
      useUserStore.getState().updateProfile({ full_name: 'Rajan Kumar' })

      expect(useUserStore.getState().user!.full_name).toBe('Rajan Kumar')
      expect(useUserStore.getState().user!.email).toBe('test@example.com')
    })

    it('is a no-op when user is null', () => {
      useUserStore.getState().updateProfile({ full_name: 'Someone' })
      expect(useUserStore.getState().user).toBeNull()
    })

    it('sets is_premium', () => {
      useUserStore.getState().setUser(MOCK_USER)
      useUserStore.getState().updateProfile({ is_premium: true })
      expect(useUserStore.getState().user!.is_premium).toBe(true)
    })
  })

  // ── setLanguage ──────────────────────────────────────────────
  describe('setLanguage()', () => {
    it('updates preferences.language', () => {
      useUserStore.getState().setLanguage('en')
      expect(useUserStore.getState().preferences.language).toBe('en')
    })

    it('updates user.preferred_language when user is set', () => {
      useUserStore.getState().setUser(MOCK_USER)
      useUserStore.getState().setLanguage('bn')
      expect(useUserStore.getState().user!.preferred_language).toBe('bn')
    })

    it('all supported languages can be set', () => {
      const langs: SupportedLanguage[] = ['hi', 'en', 'ta', 'te', 'bn']
      for (const lang of langs) {
        useUserStore.getState().setLanguage(lang)
        expect(useUserStore.getState().preferences.language).toBe(lang)
      }
    })
  })

  // ── updatePreferences ────────────────────────────────────────
  describe('updatePreferences()', () => {
    it('merges partial preference updates', () => {
      useUserStore.getState().updatePreferences({ voiceEnabled: false })
      const prefs = useUserStore.getState().preferences
      expect(prefs.voiceEnabled).toBe(false)
      expect(prefs.autoReadResponses).toBe(false) // unchanged
    })

    it('can enable autoReadResponses', () => {
      useUserStore.getState().updatePreferences({ autoReadResponses: true })
      expect(useUserStore.getState().preferences.autoReadResponses).toBe(true)
    })

    it('can change theme', () => {
      useUserStore.getState().updatePreferences({ theme: 'dark' })
      expect(useUserStore.getState().preferences.theme).toBe('dark')
    })
  })

  // ── logout ───────────────────────────────────────────────────
  describe('logout()', () => {
    it('clears user and resets preferences to defaults', () => {
      useUserStore.getState().setUser(MOCK_USER)
      useUserStore.getState().updatePreferences({ voiceEnabled: false, autoReadResponses: true })

      useUserStore.getState().logout()

      expect(useUserStore.getState().user).toBeNull()
      expect(useUserStore.getState().preferences.voiceEnabled).toBe(true)
      expect(useUserStore.getState().preferences.autoReadResponses).toBe(false)
    })
  })
})
