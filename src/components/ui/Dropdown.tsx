'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LANGUAGE_CONFIG, type SupportedLanguage } from '@/types'

export interface DropdownOption {
  value: string
  label: string
  icon?: string
  description?: string
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  align?: 'left' | 'right'
}

export function Dropdown({ options, value, onChange, placeholder = 'Select…', label, className, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>{label}</label>}
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-colors"
        style={{ borderColor: open ? '#2C5530' : '#E5E7EB', backgroundColor: '#FFFFFF', color: selected ? '#1A1A1A' : '#9CA3AF' }}
        aria-haspopup="listbox" aria-expanded={open}>
        <span className="flex items-center gap-2">
          {selected?.icon && <span>{selected.icon}</span>}
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-150', open && 'rotate-180')} style={{ color: '#9CA3AF' }} />
      </button>
      {open && (
        <ul role="listbox" className="absolute z-50 mt-1 w-full rounded-xl border overflow-hidden py-1"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', ...(align === 'right' ? { right: 0 } : { left: 0 }) }}>
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}
              onClick={() => { onChange(option.value); setOpen(false) }}
              className="flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-black/5"
              style={{ color: '#1A1A1A' }}>
              <span className="flex items-center gap-2">
                {option.icon && <span>{option.icon}</span>}
                <span>
                  {option.label}
                  {option.description && <span className="block text-xs" style={{ color: '#9CA3AF' }}>{option.description}</span>}
                </span>
              </span>
              {option.value === value && <Check className="w-4 h-4 shrink-0" style={{ color: '#2C5530' }} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface LanguageSelectorProps {
  value: SupportedLanguage
  onChange: (lang: SupportedLanguage) => void
  label?: string
  className?: string
  align?: 'left' | 'right'
}

export function LanguageSelector({ value, onChange, label, className, align }: LanguageSelectorProps) {
  const options: DropdownOption[] = Object.entries(LANGUAGE_CONFIG).map(([code, cfg]) => ({
    value: code,
    label: cfg.nativeLabel,
    description: cfg.label,
  }))
  return (
    <Dropdown options={options} value={value} onChange={(v) => onChange(v as SupportedLanguage)} label={label} className={className} align={align} />
  )
}
