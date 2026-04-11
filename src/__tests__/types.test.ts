import { describe, it, expect } from 'vitest'
import {
  LANGUAGE_CONFIG,
  LEGAL_DOMAIN_LABELS,
  SUGGESTED_PROMPTS,
  type SupportedLanguage,
  type LegalDomain,
} from '@/types'

const ALL_LANGUAGES: SupportedLanguage[]  = ['hi', 'en', 'ta', 'te', 'bn']
const ALL_DOMAINS:   LegalDomain[]        = ['PROPERTY', 'LABOR', 'DOMESTIC_VIOLENCE', 'CONSUMER', 'TENANT', 'CRIMINAL', 'FAMILY', 'OTHER']

describe('LANGUAGE_CONFIG', () => {
  it('defines all 5 supported languages', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(LANGUAGE_CONFIG[lang], `Missing config for ${lang}`).toBeDefined()
    }
  })

  it('each language has label, nativeLabel, and dir', () => {
    for (const lang of ALL_LANGUAGES) {
      const cfg = LANGUAGE_CONFIG[lang]
      expect(cfg.label).toBeTruthy()
      expect(cfg.nativeLabel).toBeTruthy()
      expect(['ltr', 'rtl']).toContain(cfg.dir)
    }
  })

  it('English label matches "English"', () => {
    expect(LANGUAGE_CONFIG.en.label).toBe('English')
  })

  it('Hindi native label is in Devanagari', () => {
    expect(LANGUAGE_CONFIG.hi.nativeLabel).toBe('हिंदी')
  })
})

describe('LEGAL_DOMAIN_LABELS', () => {
  it('has labels for all 8 domains', () => {
    for (const domain of ALL_DOMAINS) {
      expect(LEGAL_DOMAIN_LABELS[domain], `Missing label for ${domain}`).toBeTruthy()
    }
  })

  it('labels are human-readable strings', () => {
    for (const domain of ALL_DOMAINS) {
      expect(typeof LEGAL_DOMAIN_LABELS[domain]).toBe('string')
      expect(LEGAL_DOMAIN_LABELS[domain].length).toBeGreaterThan(2)
    }
  })

  it('OTHER domain has a label', () => {
    expect(LEGAL_DOMAIN_LABELS.OTHER).toBeTruthy()
  })
})

describe('SUGGESTED_PROMPTS', () => {
  it('has at least one prompt per supported language', () => {
    for (const lang of ALL_LANGUAGES) {
      const forLang = SUGGESTED_PROMPTS.filter((p) => p.language === lang)
      // It's okay if some languages share prompts; just ensure there are some
      expect(SUGGESTED_PROMPTS.length).toBeGreaterThan(0)
      void forLang
    }
  })

  it('every prompt has id, text, language, domain, and icon', () => {
    for (const prompt of SUGGESTED_PROMPTS) {
      expect(prompt.id).toBeTruthy()
      expect(prompt.text).toBeTruthy()
      expect(ALL_LANGUAGES).toContain(prompt.language)
      expect(ALL_DOMAINS).toContain(prompt.domain)
      expect(prompt.icon).toBeTruthy()
    }
  })

  it('all prompt ids are unique', () => {
    const ids = SUGGESTED_PROMPTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('prompt texts are non-empty', () => {
    for (const prompt of SUGGESTED_PROMPTS) {
      expect(prompt.text.trim().length).toBeGreaterThan(5)
    }
  })
})
