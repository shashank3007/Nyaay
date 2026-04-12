import { describe, it, expect } from 'vitest'
import { detectDomain, detectIntent } from '@/lib/anthropic/detect'

// ── detectDomain ─────────────────────────────────────────────────

describe('detectDomain()', () => {
  it('detects TENANT from "rent" keyword', () => {
    expect(detectDomain('Your landlord must give notice before raising rent')).toBe('TENANT')
  })

  it('detects TENANT from "evict"', () => {
    expect(detectDomain('The eviction process under the Model Tenancy Act')).toBe('TENANT')
  })

  it('detects LABOR from "salary"', () => {
    expect(detectDomain('Your employer must pay salary on time under labour law')).toBe('LABOR')
  })

  it('detects LABOR from "employee"', () => {
    expect(detectDomain('An employee is entitled to overtime pay')).toBe('LABOR')
  })

  it('detects DOMESTIC_VIOLENCE from "498a"', () => {
    expect(detectDomain('Under 498a and the DV Act you have the right to shelter')).toBe('DOMESTIC_VIOLENCE')
  })

  it('detects CONSUMER from "refund"', () => {
    expect(detectDomain('The consumer forum can order a refund for defective products')).toBe('CONSUMER')
  })

  it('detects CONSUMER from "ncdrc"', () => {
    expect(detectDomain('You may appeal to the NCDRC')).toBe('CONSUMER')
  })

  it('detects PROPERTY from "rera"', () => {
    expect(detectDomain('File a complaint under RERA for delayed possession')).toBe('PROPERTY')
  })

  it('detects PROPERTY from "land"', () => {
    expect(detectDomain('The land title deed must be registered')).toBe('PROPERTY')
  })

  it('detects CRIMINAL from "FIR"', () => {
    expect(detectDomain('You can file a FIR at the nearest police station')).toBe('CRIMINAL')
  })

  it('detects CRIMINAL from "bail"', () => {
    expect(detectDomain('Apply for bail under Section 437 BNSS')).toBe('CRIMINAL')
  })

  it('detects FAMILY from "divorce"', () => {
    expect(detectDomain('Divorce under the Hindu Marriage Act requires grounds')).toBe('FAMILY')
  })

  it('detects FAMILY from "custody"', () => {
    expect(detectDomain('Child custody is decided based on the best interest of the child')).toBe('FAMILY')
  })

  it('falls back to OTHER for unrelated text', () => {
    expect(detectDomain('The weather is nice today')).toBe('OTHER')
  })

  it('falls back to OTHER for empty string', () => {
    expect(detectDomain('')).toBe('OTHER')
  })

  it('is case-insensitive', () => {
    expect(detectDomain('TENANT rights LANDLORD agreement')).toBe('TENANT')
  })
})

// ── detectIntent ─────────────────────────────────────────────────

describe('detectIntent()', () => {
  it('detects DOCUMENT_REQUEST for "generate"', () => {
    expect(detectIntent('generate a legal notice for me')).toBe('DOCUMENT_REQUEST')
  })

  it('detects DOCUMENT_REQUEST for "draft"', () => {
    expect(detectIntent('draft an RTI application')).toBe('DOCUMENT_REQUEST')
  })

  it('detects DOCUMENT_REQUEST for "rti"', () => {
    expect(detectIntent('I need to file an rti')).toBe('DOCUMENT_REQUEST')
  })

  it('detects GREETING for "hello"', () => {
    expect(detectIntent('hello')).toBe('GREETING')
  })

  it('detects GREETING for "namaste"', () => {
    expect(detectIntent('namaste, can you help me?')).toBe('GREETING')
  })

  it('detects GREETING for "hi"', () => {
    expect(detectIntent('hi there')).toBe('GREETING')
  })

  it('detects QUERY for question with "?"', () => {
    expect(detectIntent('What are my rights as a tenant?')).toBe('QUERY')
  })

  it('detects QUERY for "how"', () => {
    expect(detectIntent('how do I file an FIR for online fraud')).toBe('QUERY')
  })

  it('detects QUERY for "can i"', () => {
    expect(detectIntent('can i refuse to pay increased rent')).toBe('QUERY')
  })

  it('detects CLARIFICATION for "explain"', () => {
    expect(detectIntent('please explain more about the process')).toBe('CLARIFICATION')
  })

  it('detects CLARIFICATION for "elaborate"', () => {
    expect(detectIntent('can you elaborate on that')).toBe('CLARIFICATION')
  })

  it('detects FOLLOW_UP for short message without other signals', () => {
    expect(detectIntent('okay')).toBe('FOLLOW_UP')
  })

  it('defaults to QUERY for long unclassified message', () => {
    expect(detectIntent('I was working at the company for three years without any issues')).toBe('QUERY')
  })

  it('is case-insensitive', () => {
    expect(detectIntent('GENERATE a notice')).toBe('DOCUMENT_REQUEST')
  })
})
