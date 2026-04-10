'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithOTP, verifyOTP } from '@/lib/supabase/auth'

export function PhoneOTPForm() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`
    const { error } = await signInWithOTP(formatted)
    if (error) { setError(error.message) } else { setStep('otp') }
    setLoading(false)
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`
    const { error } = await verifyOTP(formatted, otp)
    if (error) { setError(error.message); setLoading(false) } else { router.push('/chat'); router.refresh() }
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <p className="text-sm text-center" style={{ color: '#5C5C5C' }}>OTP sent to <strong>{phone}</strong></p>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP" required className="w-full px-4 py-3 rounded-xl border text-center text-xl tracking-widest outline-none" style={{ borderColor: '#E5E7EB' }} />
        <button type="submit" disabled={loading || otp.length < 6} className="w-full py-3 rounded-xl text-white font-medium disabled:opacity-50" style={{ backgroundColor: '#2C5530' }}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
        <button type="button" onClick={() => setStep('phone')} className="w-full text-sm" style={{ color: '#5C5C5C' }}>← Change number</button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Mobile Number</label>
        <div className="flex">
          <span className="flex items-center px-3 rounded-l-xl border border-r-0 text-sm" style={{ borderColor: '#E5E7EB', color: '#5C5C5C', backgroundColor: '#F9F9F9' }}>🇮🇳 +91</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" required
            className="flex-1 px-4 py-3 rounded-r-xl border outline-none" style={{ borderColor: '#E5E7EB' }} />
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-medium disabled:opacity-50" style={{ backgroundColor: '#2C5530' }}>
        {loading ? 'Sending OTP…' : 'Send OTP'}
      </button>
    </form>
  )
}
