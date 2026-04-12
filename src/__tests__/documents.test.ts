import { describe, it, expect } from 'vitest'
import { DOCUMENT_FIELDS } from '@/lib/documents/fields'
import { DOCUMENT_TYPE_CONFIG, type DocumentType } from '@/types'

const ALL_TYPES = Object.keys(DOCUMENT_TYPE_CONFIG) as DocumentType[]

// ── DOCUMENT_TYPE_CONFIG ─────────────────────────────────────────

describe('DOCUMENT_TYPE_CONFIG', () => {
  it('defines all 6 document types', () => {
    expect(ALL_TYPES).toHaveLength(6)
    expect(ALL_TYPES).toContain('LEGAL_NOTICE')
    expect(ALL_TYPES).toContain('RTI_APPLICATION')
    expect(ALL_TYPES).toContain('POLICE_COMPLAINT')
    expect(ALL_TYPES).toContain('CONSUMER_COMPLAINT')
    expect(ALL_TYPES).toContain('AFFIDAVIT')
    expect(ALL_TYPES).toContain('RENT_AGREEMENT')
  })

  it('every type has label, description, and icon', () => {
    for (const type of ALL_TYPES) {
      const cfg = DOCUMENT_TYPE_CONFIG[type]
      expect(cfg.label, `${type} should have label`).toBeTruthy()
      expect(cfg.description, `${type} should have description`).toBeTruthy()
      expect(cfg.icon, `${type} should have icon`).toBeTruthy()
    }
  })

  it('icons are emoji strings', () => {
    for (const type of ALL_TYPES) {
      const { icon } = DOCUMENT_TYPE_CONFIG[type]
      expect(typeof icon).toBe('string')
      expect(icon.length).toBeGreaterThanOrEqual(1)
    }
  })
})

// ── DOCUMENT_FIELDS ──────────────────────────────────────────────

describe('DOCUMENT_FIELDS', () => {
  it('has field definitions for every document type', () => {
    for (const type of ALL_TYPES) {
      expect(DOCUMENT_FIELDS[type], `${type} should have fields`).toBeDefined()
      expect(DOCUMENT_FIELDS[type].length, `${type} should have at least 1 field`).toBeGreaterThan(0)
    }
  })

  it('every field has a non-empty key and label', () => {
    for (const type of ALL_TYPES) {
      for (const field of DOCUMENT_FIELDS[type]) {
        expect(field.key, `${type} field key should be non-empty`).toBeTruthy()
        expect(field.label, `${type}/${field.key} label should be non-empty`).toBeTruthy()
      }
    }
  })

  it('every field type is a valid type', () => {
    const VALID_TYPES = new Set(['text', 'textarea', 'date', 'number', 'select'])
    for (const type of ALL_TYPES) {
      for (const field of DOCUMENT_FIELDS[type]) {
        expect(VALID_TYPES.has(field.type), `${type}/${field.key} has invalid type "${field.type}"`).toBe(true)
      }
    }
  })

  it('select fields have at least one option', () => {
    for (const type of ALL_TYPES) {
      for (const field of DOCUMENT_FIELDS[type]) {
        if (field.type === 'select') {
          expect(field.options, `${type}/${field.key} select field must have options`).toBeDefined()
          expect(field.options!.length, `${type}/${field.key} must have at least one option`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('select option values and labels are non-empty', () => {
    for (const type of ALL_TYPES) {
      for (const field of DOCUMENT_FIELDS[type]) {
        if (field.type === 'select' && field.options) {
          for (const opt of field.options) {
            expect(opt.value).toBeTruthy()
            expect(opt.label).toBeTruthy()
          }
        }
      }
    }
  })

  it('field keys within a type are unique', () => {
    for (const type of ALL_TYPES) {
      const keys = DOCUMENT_FIELDS[type].map((f) => f.key)
      const unique = new Set(keys)
      expect(unique.size, `${type} has duplicate field keys`).toBe(keys.length)
    }
  })

  it('LEGAL_NOTICE has required sender_name and recipient_name', () => {
    const fields = DOCUMENT_FIELDS.LEGAL_NOTICE
    const senderField   = fields.find((f) => f.key === 'sender_name')
    const recipientField = fields.find((f) => f.key === 'recipient_name')

    expect(senderField).toBeDefined()
    expect(senderField!.required).toBe(true)
    expect(recipientField).toBeDefined()
    expect(recipientField!.required).toBe(true)
  })

  it('RTI_APPLICATION has fee_mode as a select field', () => {
    const feeField = DOCUMENT_FIELDS.RTI_APPLICATION.find((f) => f.key === 'fee_mode')
    expect(feeField).toBeDefined()
    expect(feeField!.type).toBe('select')
    expect(feeField!.options!.some((o) => o.value === 'IPO')).toBe(true)
    expect(feeField!.options!.some((o) => o.value === 'BPL')).toBe(true)
  })

  it('RENT_AGREEMENT has both landlord and tenant phone fields', () => {
    const keys = DOCUMENT_FIELDS.RENT_AGREEMENT.map((f) => f.key)
    expect(keys).toContain('landlord_phone')
    expect(keys).toContain('tenant_phone')
  })

  it('AFFIDAVIT has a statement textarea field', () => {
    const stmtField = DOCUMENT_FIELDS.AFFIDAVIT.find((f) => f.key === 'statement')
    expect(stmtField).toBeDefined()
    expect(stmtField!.type).toBe('textarea')
    expect(stmtField!.required).toBe(true)
  })

  it('every document type has at least one required field', () => {
    for (const type of ALL_TYPES) {
      const hasRequired = DOCUMENT_FIELDS[type].some((f) => f.required)
      expect(hasRequired, `${type} should have at least one required field`).toBe(true)
    }
  })
})
