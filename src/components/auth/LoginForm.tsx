'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { signInWithEmail } from '@/lib/supabase/auth'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signInWithEmail(email, password)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Incorrect email or password. Please try again.' : error.message)
      setLoading(false)
    } else {
      router.push('/chat')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>{error}</div>}
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
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium" style={{ color: '#1A1A1A' }}>Password</label>
          <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: '#2C5530' }}>Forgot password?</Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required autoComplete="current-password"
            className="w-full pl-10 pr-12 py-3 rounded-xl border outline-none transition-all" style={{ borderColor: '#E5E7EB' }}
            onFocus={(e) => (e.target.style.borderColor = '#2C5530')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        style={{ backgroundColor: '#2C5530' }}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
