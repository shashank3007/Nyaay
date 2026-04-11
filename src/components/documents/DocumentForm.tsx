'use client'

import { useState } from 'react'
import { DOCUMENT_FIELDS } from '@/lib/documents/fields'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { DOCUMENT_TYPE_CONFIG, type DocumentType } from '@/types'

interface DocumentFormProps {
  type: DocumentType
  onBack: () => void
}

export function DocumentForm({ type, onBack }: DocumentFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fields = DOCUMENT_FIELDS[type]
  const config = DOCUMENT_TYPE_CONFIG[type]

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client-side required field check
    const missing = fields.filter((f) => f.required && !values[f.key]?.trim())
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.map((f) => f.label).join(', ')}`)
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: values }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Generation failed' })) as { error?: string }
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      // Trigger download
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nyaay-${type.toLowerCase().replace(/_/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-sm underline" style={{ color: '#9CA3AF' }}>
          ← Back
        </button>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
            {config.icon} {config.label}
          </h2>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>{config.description}</p>
        </div>
      </div>

      {/* Fields */}
      {fields.map((field) => {
        if (field.type === 'textarea') {
          return (
            <div key={field.key} className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#1A1A1A' }}>
                {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <textarea
                value={values[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows ?? 3}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-colors"
                style={{ borderColor: '#E5E7EB', color: '#1A1A1A', backgroundColor: '#F9FAFB' }}
              />
              {field.hint && <p className="text-xs" style={{ color: '#9CA3AF' }}>{field.hint}</p>}
            </div>
          )
        }

        if (field.type === 'select' && field.options) {
          return (
            <div key={field.key} className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#1A1A1A' }}>
                {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <select
                value={values[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none appearance-none"
                style={{ borderColor: '#E5E7EB', color: '#1A1A1A', backgroundColor: '#F9FAFB' }}
              >
                <option value="">Select…</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {field.hint && <p className="text-xs" style={{ color: '#9CA3AF' }}>{field.hint}</p>}
            </div>
          )
        }

        return (
          <div key={field.key}>
            <Input
              label={field.label + (field.required ? ' *' : '')}
              type={field.type}
              value={values[field.key] ?? ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              hint={field.hint}
            />
          </div>
        )
      })}

      {error && (
        <p className="text-sm rounded-xl p-3" style={{ color: '#EF4444', backgroundColor: '#FEF2F2' }}>
          {error}
        </p>
      )}

      <Button type="submit" disabled={isGenerating} className="w-full">
        {isGenerating ? (
          <span className="flex items-center gap-2 justify-center">
            <Spinner size="sm" /> Generating PDF…
          </span>
        ) : (
          '⬇ Download PDF'
        )}
      </Button>

      <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
        Your data is processed locally. No information is stored without your consent.
      </p>
    </form>
  )
}
