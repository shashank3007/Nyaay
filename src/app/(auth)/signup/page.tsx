import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>Create your account</h2>
        <p className="text-sm mt-1" style={{ color: '#5C5C5C' }}>Get free legal guidance in your language</p>
      </div>
      <OAuthButtons />
      <SignupForm />
      <p className="text-center text-sm" style={{ color: '#5C5C5C' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: '#2C5530' }}>Sign in</Link>
      </p>
    </div>
  )
}
