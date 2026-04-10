'use client'

import { Check, X, Mic } from 'lucide-react'

interface TranscriptionPreviewProps {
  text: string
  isTranscribing: boolean
  onConfirm: (text: string) => void
  onDiscard: () => void
}

export function TranscriptionPreview({ text, isTranscribing, onConfirm, onDiscard }: TranscriptionPreviewProps) {
  if (!text && !isTranscribing) return null

  return (
    <div
      className="mx-4 mb-2 p-3 rounded-xl border flex items-start gap-3 animate-in slide-in-from-bottom-2"
      style={{ backgroundColor: '#FFF8F0', borderColor: '#D4A574' }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#D4A574' }}
      >
        <Mic className="w-3.5 h-3.5 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>
          {isTranscribing ? 'Transcribing…' : 'Voice transcript'}
        </p>
        {isTranscribing ? (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ backgroundColor: '#D4A574', animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#1A1A1A' }}>{text}</p>
        )}
      </div>

      {!isTranscribing && text && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onConfirm(text)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
            style={{ backgroundColor: '#2C5530' }}
            aria-label="Use transcript"
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={onDiscard}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ backgroundColor: '#F3F4F6' }}
            aria-label="Discard transcript"
          >
            <X className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
          </button>
        </div>
      )}
    </div>
  )
}
