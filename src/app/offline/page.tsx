'use client'

export default function OfflinePage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center"
      style={{ backgroundColor: '#FFFBF5' }}
    >
      {/* Logo */}
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-bold"
        style={{ backgroundColor: '#2C5530' }}
      >
        न्
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>You&apos;re offline</h1>
        <p className="text-sm max-w-xs" style={{ color: '#5C5C5C' }}>
          No internet connection. NYAAY needs connectivity to provide legal guidance.
          Please check your network and try again.
        </p>
      </div>

      {/* Retry */}
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
        style={{ backgroundColor: '#2C5530', color: '#FFFFFF' }}
      >
        Try again
      </button>

      <p className="text-xs" style={{ color: '#9CA3AF' }}>
        NYAAY — न्याय · Legal Assistant for India
      </p>
    </div>
  )
}
