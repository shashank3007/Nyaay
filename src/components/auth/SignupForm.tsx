'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { signUpWithEmail } from '@/lib/supabase/auth'

const LANGUAGES = [
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
]

export function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState('hi')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('Please accept the Terms & Privacy Policy to continue.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError(null)
    const { error } = await signUpWithEmail(email, password, { full_name: fullName, preferred_language: language })
    if (error) { setError(error.message); setLoading(false) } else { setSuccess(true) }
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto" style={{ backgroundColor: '#F0FDF4' }}>✉️</div>
        <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>Check your email</h2>
        <p className="text-sm" style={{ color: '#5C5C5C' }}>We sent a confirmation link to <strong>{email}</strong>.</p>
        <button onClick={() => router.push('/login')} className="text-sm underline" style={{ color: '#2C5530' }}>Back to Sign in</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Full name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ramesh Kumar" required autoComplete="name"
            className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all" style={{ borderColor: '#E5E7EB' }}
            onFocus={(e) => (e.target.style.borderColor = '#2C5530')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"
            className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all" style={{ borderColor: '#E5E7EB' }}
            onFocus={(e) => (e.target.style.borderColor = '#2C5530')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"
            className="w-full pl-10 pr-12 py-3 rounded-xl border outline-none transition-all" style={{ borderColor: '#E5E7EB' }}
            onFocus={(e) => (e.target.style.borderColor = '#2C5530')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Preferred language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border outline-none transition-all bg-white" style={{ borderColor: '#E5E7EB' }}
          onFocus={(e) => (e.target.style.borderColor = '#2C5530')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}>
          {LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
        </select>
      </div>
      <div className="flex items-start gap-3">
        <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded cursor-pointer" style={{ accentColor: '#2C5530' }} />
        <label htmlFor="terms" className="text-sm cursor-pointer" style={{ color: '#5C5C5C' }}>
          I agree to the <a href="/terms" className="underline" style={{ color: '#2C5530' }}>Terms</a> and <a href="/privacy" className="underline" style={{ color: '#2C5530' }}>Privacy Policy</a>
        </label>
      </div>
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-60" style={{ backgroundColor: '#2C5530' }}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
