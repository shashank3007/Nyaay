import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '@/lib/anthropic/systemPrompt'
import type { SupportedLanguage } from '@/types'

const ALL_LANGUAGES: SupportedLanguage[] = ['hi', 'en', 'ta', 'te', 'bn']

describe('buildSystemPrompt()', () => {
  it('returns a non-empty string for every supported language', () => {
    for (const lang of ALL_LANGUAGES) {
      const prompt = buildSystemPrompt(lang)
      expect(prompt.length).toBeGreaterThan(100)
    }
  })

  it('contains NYAAY branding', () => {
    expect(buildSystemPrompt('en')).toContain('NYAAY')
  })

  it('contains Hindi name न्याय', () => {
    expect(buildSystemPrompt('hi')).toContain('न्याय')
  })

  it('includes Hindi instruction for "hi" language', () => {
    const prompt = buildSystemPrompt('hi')
    expect(prompt).toMatch(/Hindi/i)
  })

  it('includes English instruction for "en" language', () => {
    const prompt = buildSystemPrompt('en')
    expect(prompt).toMatch(/English/i)
  })

  it('includes Tamil instruction for "ta" language', () => {
    const prompt = buildSystemPrompt('ta')
    expect(prompt).toMatch(/Tamil/i)
  })

  it('references key legal domains', () => {
    const prompt = buildSystemPrompt('en')
    expect(prompt).toContain('RTI')
    expect(prompt).toContain('Consumer')
    expect(prompt).toContain('RERA')
  })

  it('includes safety boundary about legal information vs advice', () => {
    const prompt = buildSystemPrompt('en')
    expect(prompt).toMatch(/information.*not.*advice|advice/i)
  })

  it('includes emergency helplines', () => {
    const prompt = buildSystemPrompt('en')
    expect(prompt).toContain('15100')   // NALSA
    expect(prompt).toContain('1091')    // Women helpline
    expect(prompt).toContain('100')     // Police
  })

  it('each language produces a distinct prompt', () => {
    const prompts = ALL_LANGUAGES.map((l) => buildSystemPrompt(l))
    const unique = new Set(prompts)
    expect(unique.size).toBe(ALL_LANGUAGES.length)
  })
})
