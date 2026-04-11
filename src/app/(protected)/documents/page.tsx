'use client'

import { useState } from 'react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { DocumentForm } from '@/components/documents/DocumentForm'
import { DOCUMENT_TYPE_CONFIG, type DocumentType } from '@/types'

const DOC_TYPES = Object.keys(DOCUMENT_TYPE_CONFIG) as DocumentType[]

export default function DocumentsPage() {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)

  if (selectedType) {
    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: '#FFFBF5' }}>
        <div className="max-w-2xl mx-auto w-full px-4 py-8">
          <DocumentForm type={selectedType} onBack={() => setSelectedType(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: '#FFFBF5' }}>
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Legal Documents</h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Generate professional legal documents in minutes. Fill the form, download as PDF.
          </p>
        </div>

        {/* Document type grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DOC_TYPES.map((type) => (
            <DocumentCard
              key={type}
              type={type}
              onClick={() => setSelectedType(type)}
            />
          ))}
        </div>

        {/* Disclaimer */}
        <div
          className="mt-6 p-4 rounded-2xl text-sm"
          style={{ backgroundColor: '#FFF8F0', borderLeft: '3px solid #D4A574', color: '#5C5C5C' }}
        >
          <strong>Note:</strong> These templates are for reference only. For legal proceedings,
          please have the document reviewed by a qualified advocate. NYAAY provides legal
          information, not legal advice.
        </div>
      </div>
    </div>
  )
}
