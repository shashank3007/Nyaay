'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Bell, Volume2, Shield, LogOut, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LanguageSelector } from '@/components/ui/Dropdown'
import { FREE_MONTHLY_LIMIT, PREMIUM_MONTHLY_LIMIT } from '@/lib/tokenLimits'
import type { SupportedLanguage } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const { user, preferences, updateProfile, updatePreferences, setLanguage, logout } = useUserStore()

  const [fullName, setFullName]     = useState(user?.full_name ?? '')
  const [isSaving, setIsSaving]     = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [tokensUsed, setTokensUsed] = useState(0)
  const [tokensMonth, setTokensMonth] = useState('')

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('monthly_tokens_used, tokens_month')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTokensUsed(data.monthly_tokens_used ?? 0)
          setTokensMonth(data.tokens_month ?? '')
        }
      })
  }, [user])

  async function handleSaveProfile() {
    if (!user) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
      if (error) throw error
      updateProfile({ full_name: fullName })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } finally {
      setIsSaving(false)
    }
  }

  function handleLanguageChange(lang: SupportedLanguage) {
    setLanguage(lang)
    if (user) {
      const supabase = createClient()
      supabase.from('profiles').update({ preferred_language: lang }).eq('id', user.id)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    logout()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: '#FFFBF5' }}>
      <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Manage your account and preferences</p>
        </div>

        {/* ── Profile ─────────────────────────────── */}
        <Section icon={<User className="w-5 h-5" style={{ color: '#2C5530' }} />} title="Profile">
          <div className="flex items-center gap-4 mb-5">
            <Avatar src={user?.avatar_url} name={user?.full_name} size="lg" />
            <div>
              <p className="font-semibold" style={{ color: '#1A1A1A' }}>{user?.full_name ?? 'User'}</p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>{user?.email ?? user?.phone ?? ''}</p>
              {user?.is_premium && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium"
                  style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                >
                  Premium
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
            <Input
              label="Email"
              value={user?.email ?? ''}
              readOnly
              hint="Email cannot be changed here"
            />

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="sm:w-auto"
              >
                {isSaving ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Save Profile'}
              </Button>
              {saveStatus === 'error' && (
                <p className="text-sm" style={{ color: '#EF4444' }}>Failed to save. Try again.</p>
              )}
            </div>
          </div>
        </Section>

        {/* ── Preferences ─────────────────────────── */}
        <Section icon={<Bell className="w-5 h-5" style={{ color: '#2C5530' }} />} title="Preferences">
          <div className="space-y-5">
            <LanguageSelector
              value={preferences.language}
              onChange={handleLanguageChange}
              label="Preferred Language"
            />

            <ToggleRow
              icon={<Volume2 className="w-4 h-4" />}
              label="Voice Input"
              description="Enable microphone for voice messages"
              value={preferences.voiceEnabled}
              onChange={(val) => updatePreferences({ voiceEnabled: val })}
            />

            <ToggleRow
              icon={<Volume2 className="w-4 h-4" />}
              label="Auto-read Responses"
              description="Automatically speak AI responses aloud"
              value={preferences.autoReadResponses}
              onChange={(val) => updatePreferences({ autoReadResponses: val })}
            />
          </div>
        </Section>

        {/* ── Usage ───────────────────────────────── */}
        <Section icon={<Zap className="w-5 h-5" style={{ color: '#2C5530' }} />} title="Monthly Usage">
          <UsageMeter
            used={tokensUsed}
            limit={user?.is_premium ? PREMIUM_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT}
            isPremium={user?.is_premium ?? false}
            month={tokensMonth}
          />
        </Section>

        {/* ── Account ─────────────────────────────── */}
        <Section icon={<Shield className="w-5 h-5" style={{ color: '#2C5530' }} />} title="Account">
          <div className="space-y-4">
            <p className="text-sm" style={{ color: '#5C5C5C' }}>
              Member since{' '}
              {user
                ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                : '—'}
            </p>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-red-50"
              style={{ color: '#EF4444', borderColor: '#FECACA' }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </Section>

        {/* ── About ───────────────────────────────── */}
        <div className="text-center text-xs space-y-1 pb-4" style={{ color: '#9CA3AF' }}>
          <p>NYAAY — न्याय · Legal Assistant for India</p>
          <p>v1.0.0 · Empowering access to justice</p>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section
      className="p-5 rounded-2xl border"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: '#E5E7EB' }}>
        {icon}
        <h2 className="font-semibold" style={{ color: '#1A1A1A' }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function UsageMeter({ used, limit, isPremium, month }: {
  used: number; limit: number; isPremium: boolean; month: string
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100))
  const remaining = Math.max(0, limit - used)
  const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#2C5530'
  const resetLabel = month
    ? (() => {
        const [y, m] = month.split('-').map(Number)
        const next = new Date(y, m, 1)
        return next.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })
      })()
    : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            {used.toLocaleString()}
            <span className="text-sm font-normal ml-1" style={{ color: '#9CA3AF' }}>
              / {limit.toLocaleString()} tokens
            </span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
            {remaining.toLocaleString()} remaining · resets {resetLabel}
          </p>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={isPremium
            ? { backgroundColor: '#FEF3C7', color: '#92400E' }
            : { backgroundColor: '#E8F5E9', color: '#2C5530' }}
        >
          {isPremium ? 'Premium' : 'Free'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      {pct >= 90 && !isPremium && (
        <p className="text-sm rounded-xl px-4 py-3" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
          You are close to your monthly limit. Upgrade to Premium for 10× more tokens.
        </p>
      )}

      {!isPremium && (
        <p className="text-xs" style={{ color: '#9CA3AF' }}>
          Free plan: {(FREE_MONTHLY_LIMIT).toLocaleString()} tokens/month · ~62 conversations
        </p>
      )}
    </div>
  )
}

function ToggleRow({
  icon, label, description, value, onChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  value: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0" style={{ color: '#5C5C5C' }}>{icon}</span>
        <div>
          <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{label}</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
        style={{ backgroundColor: value ? '#2C5530' : '#D1D5DB' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}
