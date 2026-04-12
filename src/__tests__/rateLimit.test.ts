import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rateLimit, getRequestIdentifier } from '@/lib/rateLimit'

describe('rateLimit()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows first request', () => {
    const result = rateLimit('test-allow-1', { limit: 5, windowSec: 60 })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.limit).toBe(5)
  })

  it('counts requests within the window', () => {
    const cfg = { limit: 3, windowSec: 60 }
    rateLimit('test-count-1', cfg)
    rateLimit('test-count-1', cfg)
    const third = rateLimit('test-count-1', cfg)

    expect(third.success).toBe(true)
    expect(third.remaining).toBe(0)
  })

  it('blocks when limit is exceeded', () => {
    const cfg = { limit: 2, windowSec: 60 }
    rateLimit('test-block-1', cfg)
    rateLimit('test-block-1', cfg)
    const blocked = rateLimit('test-block-1', cfg)

    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('resets after the window expires', () => {
    const cfg = { limit: 2, windowSec: 10 }
    rateLimit('test-reset-1', cfg)
    rateLimit('test-reset-1', cfg)

    // Advance past the window
    vi.advanceTimersByTime(11_000)

    const afterReset = rateLimit('test-reset-1', cfg)
    expect(afterReset.success).toBe(true)
    expect(afterReset.remaining).toBe(1)
  })

  it('treats different identifiers independently', () => {
    const cfg = { limit: 1, windowSec: 60 }
    rateLimit('user-A', cfg)
    // user-A is now exhausted

    const userB = rateLimit('user-B', cfg)
    expect(userB.success).toBe(true)
  })

  it('returns a resetAt timestamp in the future', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
    const result = rateLimit('test-reset-ts', { limit: 5, windowSec: 60 })
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })

  it('remaining decreases with each successful request', () => {
    const cfg = { limit: 5, windowSec: 60 }
    const r1 = rateLimit('test-remaining-1', cfg)
    const r2 = rateLimit('test-remaining-1', cfg)
    const r3 = rateLimit('test-remaining-1', cfg)

    expect(r1.remaining).toBe(4)
    expect(r2.remaining).toBe(3)
    expect(r3.remaining).toBe(2)
  })

  it('limit field always matches config', () => {
    const cfg = { limit: 10, windowSec: 60 }
    const result = rateLimit('test-limit-field', cfg)
    expect(result.limit).toBe(10)
  })
})

describe('getRequestIdentifier()', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getRequestIdentifier(req)).toBe('1.2.3.4')
  })

  it('extracts IP from x-real-ip header', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-real-ip': '9.10.11.12' },
    })
    expect(getRequestIdentifier(req)).toBe('9.10.11.12')
  })

  it('prefers x-forwarded-for over x-real-ip', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '1.1.1.1', 'x-real-ip': '2.2.2.2' },
    })
    expect(getRequestIdentifier(req)).toBe('1.1.1.1')
  })

  it('falls back to "anonymous" when no IP headers present', () => {
    const req = new Request('http://localhost/')
    expect(getRequestIdentifier(req)).toBe('anonymous')
  })

  it('trims whitespace from extracted IP', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-real-ip': '  192.168.1.1  ' },
    })
    expect(getRequestIdentifier(req)).toBe('192.168.1.1')
  })
})
