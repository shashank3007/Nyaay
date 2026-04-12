import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'NYAAY — Sign in',
  description: 'Sign in to your NYAAY legal assistant account',
}

const languages = [
  { code: 'hi', label: 'हिंदी' },
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'bn', label: 'বাংলা' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFBF5' }}>
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: '#2C5530' }}
          >
            न्
          </div>
          <span className="font-bold text-lg" style={{ color: '#2C5530' }}>NYAAY</span>
        </Link>
        <div className="flex items-center gap-1">
          {languages.map((lang) => (
            <button key={lang.code} className="px-2 py-1 text-xs rounded-md transition-colors hover:bg-black/5" style={{ color: '#5C5C5C' }}>
              {lang.label}
            </button>
          ))}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4" style={{ backgroundColor: '#2C5530' }}>न्</div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>NYAAY</h1>
            <p className="text-sm mt-1" style={{ color: '#5C5C5C' }}>आपका कानूनी सहायक · Your Legal Companion</p>
          </div>
          <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {children}
          </div>
          <p className="text-center text-xs mt-6" style={{ color: '#5C5C5C' }}>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline" style={{ color: '#2C5530' }}>Terms</Link>
            {' '}&{' '}
            <Link href="/privacy" className="underline" style={{ color: '#2C5530' }}>Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
