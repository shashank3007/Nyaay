'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProtectedError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    console.error('[protected] unhandled error:', error)
  }, [error])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full gap-6 px-6 text-center"
      style={{ backgroundColor: '#FFFBF5' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: '#FEE2E2' }}
      >
        <AlertTriangle className="w-8 h-8" style={{ color: '#EF4444' }} />
      </div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>Something went wrong</h2>
        <p className="text-sm" style={{ color: '#5C5C5C' }}>
          {error.message || 'An unexpected error occurred. Your data is safe.'}
        </p>
        {error.digest && (
          <p className="text-xs font-mono" style={{ color: '#9CA3AF' }}>
            Ref: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: '#2C5530', color: '#FFFFFF' }}
        >
          Try again
        </button>
        <button
          onClick={() => router.push('/chat')}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-black/5"
          style={{ borderColor: '#E5E7EB', color: '#5C5C5C' }}
        >
          Go to Chat
        </button>
      </div>
    </div>
  )
}
