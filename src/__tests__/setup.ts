// Global test setup
// Reset Zustand stores between tests to prevent state leakage
import { beforeEach } from 'vitest'

// Polyfill localStorage for Zustand persist middleware in jsdom
beforeEach(() => {
  localStorage.clear()
})
