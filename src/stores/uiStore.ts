import { create } from 'zustand'
import type { SupportedLanguage } from '@/types'

interface UIStore {
  sidebarOpen: boolean
  language: SupportedLanguage
  theme: 'light' | 'dark' | 'system'
  isOnline: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setLanguage: (language: SupportedLanguage) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setIsOnline: (online: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  language: 'hi',
  theme: 'light',
  isOnline: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  setIsOnline: (isOnline) => set({ isOnline }),
}))
