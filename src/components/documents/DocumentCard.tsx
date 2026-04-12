'use client'

import { DOCUMENT_TYPE_CONFIG, type DocumentType } from '@/types'

interface DocumentCardProps {
  type: DocumentType
  selected?: boolean
  onClick: () => void
}

export function DocumentCard({ type, selected, onClick }: DocumentCardProps) {
  const { label, description, icon } = DOCUMENT_TYPE_CONFIG[type]

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md w-full"
      style={{
        borderColor: selected ? '#2C5530' : '#E5E7EB',
        backgroundColor: selected ? '#E8F5E9' : '#FFFFFF',
      }}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p
          className="text-sm font-semibold leading-tight"
          style={{ color: selected ? '#2C5530' : '#1A1A1A' }}
        >
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
          {description}
        </p>
      </div>
    </button>
  )
}
