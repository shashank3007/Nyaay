'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { VoiceButton } from '@/components/voice/VoiceButton'
import { TranscriptionPreview } from '@/components/voice/TranscriptionPreview'

interface ChatInputProps {
  onSend: (text: string) => void
  isStreaming: boolean
  isRecording: boolean
  isTranscribing: boolean
  transcript: string
  onVoiceToggle: () => void
  onTranscriptConfirm: (text: string) => void
  onTranscriptDiscard: () => void
  placeholder?: string
}

export function ChatInput({
  onSend,
  isStreaming,
  isRecording,
  isTranscribing,
  transcript,
  onVoiceToggle,
  onTranscriptConfirm,
  onTranscriptDiscard,
  placeholder = 'Ask a legal question…',
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [value])

  function handleSubmit() {
    const text = value.trim()
    if (!text || isStreaming) return
    onSend(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = value.trim().length > 0 && !isStreaming

  return (
    <div
      className="shrink-0 border-t"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
    >
      {/* Transcript preview */}
      <TranscriptionPreview
        text={transcript}
        isTranscribing={isTranscribing}
        onConfirm={(t) => { onTranscriptConfirm(t); setValue('') }}
        onDiscard={onTranscriptDiscard}
      />

      {/* Input row */}
      <div className="flex items-end gap-2 px-4 py-3">
        {/* Voice button */}
        <VoiceButton
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          onToggle={onVoiceToggle}
          disabled={isStreaming}
        />

        {/* Textarea */}
        <div
          className="flex-1 flex items-end gap-2 rounded-xl border px-3 py-2 transition-colors"
          style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Listening…' : placeholder}
            disabled={isStreaming || isRecording}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm outline-none leading-relaxed max-h-[120px]"
            style={{ color: '#1A1A1A' }}
            aria-label="Chat input"
          />
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send message"
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
          style={{
            backgroundColor: canSend ? '#2C5530' : '#E5E7EB',
            color: canSend ? '#FFFFFF' : '#9CA3AF',
          }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Hint */}
      <p className="text-center text-xs pb-2" style={{ color: '#9CA3AF' }}>
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
