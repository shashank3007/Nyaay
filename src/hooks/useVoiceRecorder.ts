'use client'

import { useCallback, useRef, useState } from 'react'
import { useSpeechRecognition } from './useSpeechRecognition'
import type { SupportedLanguage } from '@/types'

interface VoiceRecorderResult {
  /** Confirmed final transcript (shown in TranscriptionPreview) */
  transcript: string
  /** Live partial transcript while the user is still speaking */
  interimTranscript: string
  isRecording: boolean
  isTranscribing: boolean
  /** True if at least one input method is available */
  isSupported: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
}

export function useVoiceRecorder(language: SupportedLanguage): VoiceRecorderResult {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [fallbackTranscript, setFallbackTranscript] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const {
    transcript: srTranscript,
    interimTranscript,
    isSupported: hasSpeechRecognition,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(language)

  const isSupported =
    typeof window !== 'undefined' &&
    (hasSpeechRecognition || !!navigator.mediaDevices?.getUserMedia)

  const startRecording = useCallback(async () => {
    setFallbackTranscript('')
    resetTranscript()

    if (hasSpeechRecognition) {
      // ── Path A: Web Speech API (real-time, no server round-trip) ──
      startListening()
      setIsRecording(true)
      return
    }

    // ── Path B: MediaRecorder → /api/transcribe (Whisper) ────────
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Prefer opus/webm, fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''

      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })

        setIsTranscribing(true)
        try {
          const fd = new FormData()
          fd.append('audio', blob, 'recording.webm')
          fd.append('language', language)

          const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
          const data = (await res.json()) as { text?: string }
          if (data.text) setFallbackTranscript(data.text)
        } catch (err) {
          console.error('[useVoiceRecorder] transcription error:', err)
        } finally {
          setIsTranscribing(false)
        }
      }

      mediaRecorderRef.current = rec
      rec.start(250) // chunk every 250 ms
      setIsRecording(true)
    } catch (err) {
      console.error('[useVoiceRecorder] microphone access denied:', err)
    }
  }, [hasSpeechRecognition, language, startListening, resetTranscript])

  const stopRecording = useCallback(() => {
    if (hasSpeechRecognition) {
      stopListening()
    } else {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
    setIsRecording(false)
  }, [hasSpeechRecognition, stopListening])

  const clearTranscript = useCallback(() => {
    setFallbackTranscript('')
    resetTranscript()
  }, [resetTranscript])

  return {
    transcript: hasSpeechRecognition ? srTranscript : fallbackTranscript,
    interimTranscript: hasSpeechRecognition ? interimTranscript : '',
    isRecording,
    isTranscribing,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  }
}
