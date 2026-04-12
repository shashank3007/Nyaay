'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[global] unhandled error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '1.5rem',
            padding: '1.5rem',
            textAlign: 'center',
            backgroundColor: '#FFFBF5',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#2C5530',
              color: '#ffffff',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            न्
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 0.5rem' }}>
              Application Error
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#5C5C5C', maxWidth: 320, margin: 0 }}>
              An unexpected error occurred. Please refresh the page.
            </p>
          </div>

          <button
            onClick={reset}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: 12,
              backgroundColor: '#2C5530',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  )
}
