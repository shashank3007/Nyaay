import { describe, it, expect, vi, afterEach } from 'vitest'
import { cn, formatDate, formatRelativeTime, truncate, getInitials } from '@/lib/utils'

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('deduplicates conflicting Tailwind classes (tailwind-merge)', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('filters falsy values', () => {
    expect(cn('a', false && 'b', undefined, null, 'c')).toBe('a c')
  })

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-green-500': false })).toBe('text-red-500')
  })

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })
})

describe('formatDate()', () => {
  it('formats a date string to Indian locale', () => {
    const result = formatDate('2024-01-15')
    // en-IN format: "15 Jan 2024"
    expect(result).toMatch(/15/)
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/2024/)
  })

  it('accepts a Date object', () => {
    const result = formatDate(new Date('2024-06-01'))
    expect(result).toMatch(/2024/)
  })
})

describe('formatRelativeTime()', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Just now" for < 1 minute ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:30Z'))
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('Just now')
  })

  it('returns minutes ago for < 1 hour', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:45:00Z'))
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('45m ago')
  })

  it('returns hours ago for < 1 day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T15:00:00Z'))
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('3h ago')
  })

  it('returns days ago for < 7 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-04T12:00:00Z'))
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('3d ago')
  })

  it('returns formatted date for >= 7 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-01T12:00:00Z'))
    const result = formatRelativeTime('2024-01-01T12:00:00Z')
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/2024/)
  })
})

describe('truncate()', () => {
  it('returns the original string when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates with ellipsis when over limit', () => {
    expect(truncate('hello world', 8)).toBe('hello w…')
  })

  it('handles exact length boundary', () => {
    expect(truncate('abcde', 5)).toBe('abcde')
  })

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('')
  })
})

describe('getInitials()', () => {
  it('returns "U" for null', () => {
    expect(getInitials(null)).toBe('U')
  })

  it('returns "U" for undefined', () => {
    expect(getInitials(undefined)).toBe('U')
  })

  it('returns "U" for empty string', () => {
    expect(getInitials('')).toBe('U')
  })

  it('returns single initial for one-word name', () => {
    expect(getInitials('Rajan')).toBe('R')
  })

  it('returns two initials for two-word name', () => {
    expect(getInitials('Priya Sharma')).toBe('PS')
  })

  it('returns only first two initials for longer names', () => {
    expect(getInitials('Amit Kumar Singh')).toBe('AK')
  })

  it('uppercases initials', () => {
    expect(getInitials('abc def')).toBe('AD')
  })

  it('handles extra whitespace', () => {
    expect(getInitials('  Raj  Kumar  ')).toBe('RK')
  })
})
