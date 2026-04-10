'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  MessageSquare,
  History,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Scale,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { LanguageSelector } from '@/components/ui/Dropdown'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { useUIStore } from '@/stores/uiStore'
import type { SupportedLanguage } from '@/types'

const NAV_ITEMS = [
  { href: '/chat',      label: 'Chat',        icon: MessageSquare },
  { href: '/history',   label: 'History',     icon: History       },
  { href: '/documents', label: 'Documents',   icon: FileText      },
  { href: '/settings',  label: 'Settings',    icon: Settings      },
]

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser, preferences, setLanguage } = useUserStore()
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Load user on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) { router.push('/login'); return }
      // Fetch profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) setUser(profile)
        })
    })
  }, [router, setUser])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleLanguageChange(lang: SupportedLanguage) {
    setLanguage(lang)
    // Persist to DB if user is loaded
    if (user) {
      const supabase = createClient()
      supabase.from('profiles').update({ preferred_language: lang }).eq('id', user.id)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFFBF5' }}>
      {/* ─── Mobile overlay ──────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <Link href="/chat" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: '#2C5530' }}
            >
              न्
            </div>
            <div>
              <p className="font-bold text-base leading-none" style={{ color: '#2C5530' }}>NYAAY</p>
              <p className="text-xs leading-none mt-0.5" style={{ color: '#9CA3AF' }}>Legal Assistant</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg lg:hidden"
            style={{ color: '#9CA3AF' }}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={
                  active
                    ? { backgroundColor: '#E8F5E9', color: '#2C5530' }
                    : { color: '#5C5C5C' }
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
                {active && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#2C5530' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Language + User */}
        <div className="px-3 py-4 border-t space-y-3" style={{ borderColor: '#E5E7EB' }}>
          <LanguageSelector
            value={preferences.language}
            onChange={handleLanguageChange}
            label="Language"
          />

          {/* User row */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-black/5 text-left"
            >
              <Avatar src={user?.avatar_url} name={user?.full_name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#1A1A1A' }}>
                  {user?.full_name ?? 'User'}
                </p>
                <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                  {user?.email ?? ''}
                </p>
              </div>
            </button>

            {userMenuOpen && (
              <div
                className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border overflow-hidden"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
              >
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-black/5 transition-colors"
                  style={{ color: '#1A1A1A' }}
                >
                  <Settings className="w-4 h-4" style={{ color: '#5C5C5C' }} />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 transition-colors"
                  style={{ color: '#EF4444' }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main area ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header */}
        <header
          className="flex items-center justify-between px-4 py-3 border-b lg:hidden shrink-0"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl transition-colors hover:bg-black/5"
            aria-label="Open menu"
            style={{ color: '#1A1A1A' }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5" style={{ color: '#2C5530' }} />
            <span className="font-bold" style={{ color: '#2C5530' }}>NYAAY</span>
          </div>
          <Avatar src={user?.avatar_url} name={user?.full_name} size="sm" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
