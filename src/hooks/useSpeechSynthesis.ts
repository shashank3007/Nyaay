'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SupportedLanguage } from '@/types'

const LOCALE: Record<SupportedLanguage, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
}

interface UseSpeechSynthesisResult {
  speak: (text: string, language: SupportedLanguage) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
}

export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
  }, [])

  const speak = useCallback(
    (text: string, language: SupportedLanguage) => {
      if (!isSupported) return
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = LOCALE[language]
      utterance.rate = 0.9
      utterance.pitch = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isSupported]
  )

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  return { speak, stop, isSpeaking, isSupported }
}
