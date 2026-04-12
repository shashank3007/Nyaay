import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { PhoneOTPForm } from '@/components/auth/PhoneOTPForm'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>Welcome back</h2>
        <p className="text-sm mt-1" style={{ color: '#5C5C5C' }}>Sign in to continue to NYAAY</p>
      </div>
      <OAuthButtons />
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
        <span className="text-xs" style={{ color: '#9CA3AF' }}>or sign in with email</span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
      </div>
      <LoginForm />
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
        <span className="text-xs" style={{ color: '#9CA3AF' }}>or use mobile OTP</span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
      </div>
      <PhoneOTPForm />
      <p className="text-center text-sm" style={{ color: '#5C5C5C' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#2C5530' }}>Create account</Link>
      </p>
    </div>
  )
}
