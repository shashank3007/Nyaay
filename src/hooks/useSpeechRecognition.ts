'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SupportedLanguage } from '@/types'

// BCP-47 locale tags for each supported language (India variants)
const LOCALE: Record<SupportedLanguage, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
}

// ── Minimal SpeechRecognition interface (not in all TS dom libs) ──
interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: ISpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

interface ISpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: { readonly transcript: string }
}

interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: { [index: number]: ISpeechRecognitionResult; length: number }
}

interface ISpeechRecognitionCtor {
  new (): ISpeechRecognition
}

function getSpeechRecognition(): ISpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null
}

// ─────────────────────────────────────────────────────────────────

interface UseSpeechRecognitionResult {
  transcript: string
  interimTranscript: string
  isListening: boolean
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useSpeechRecognition(language: SupportedLanguage): UseSpeechRecognitionResult {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  const isSupported = !!getSpeechRecognition()

  // Rebuild the recognition object when language changes
  useEffect(() => {
    const API = getSpeechRecognition()
    if (!API) return

    const rec = new API()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = LOCALE[language]
    rec.maxAlternatives = 1

    rec.onresult = (e: ISpeechRecognitionEvent) => {
      let final = ''
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      if (final) setTranscript((prev) => prev + final)
      setInterimTranscript(interim)
    }

    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)

    recognitionRef.current = rec
    return () => { rec.abort() }
  }, [language, isSupported])

  const startListening = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec || isListening) return
    setTranscript('')
    setInterimTranscript('')
    try { rec.start() } catch { /* already started */ }
    setIsListening(true)
  }, [isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return { transcript, interimTranscript, isListening, isSupported, startListening, stopListening, resetTranscript }
}
