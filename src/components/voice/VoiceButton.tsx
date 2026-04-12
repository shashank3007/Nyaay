'use client'

import { Mic, MicOff, Loader2 } from 'lucide-react'
import { VoiceWaveform } from './VoiceWaveform'

interface VoiceButtonProps {
  isRecording: boolean
  isTranscribing: boolean
  onToggle: () => void
  disabled?: boolean
}

export function VoiceButton({ isRecording, isTranscribing, onToggle, disabled }: VoiceButtonProps) {
  const isActive = isRecording || isTranscribing

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled || isTranscribing}
      aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
      aria-pressed={isRecording}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all shrink-0 focus:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: isRecording ? '#EF4444' : isTranscribing ? '#FEF3C7' : '#F3F4F6',
        color: isRecording ? '#FFFFFF' : isTranscribing ? '#D97706' : '#6B7280',
        boxShadow: isRecording ? '0 0 0 4px rgba(239,68,68,0.2)' : 'none',
      }}
    >
      {isTranscribing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isRecording ? (
        <div className="flex items-center justify-center w-full h-full">
          <VoiceWaveform isActive={isActive} barCount={4} />
        </div>
      ) : (
        <Mic className="w-5 h-5" />
      )}

      {/* Pulse ring when recording */}
      {isRecording && (
        <span
          className="absolute inset-0 rounded-xl animate-ping opacity-30"
          style={{ backgroundColor: '#EF4444' }}
        />
      )}
    </button>
  )
}
