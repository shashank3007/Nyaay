'use client'

import { Scale } from 'lucide-react'
import { SuggestedPrompts } from './SuggestedPrompts'
import type { SupportedLanguage } from '@/types'

const GREETINGS: Record<SupportedLanguage, { heading: string; sub: string }> = {
  hi: { heading: 'नमस्ते! मैं न्याय हूं', sub: 'आपका AI कानूनी सहायक — हिंदी में, आपकी भाषा में।' },
  en: { heading: 'Welcome to NYAAY', sub: 'Your AI-powered legal assistant for Indian law.' },
  ta: { heading: 'வரவேற்கிறோம்!', sub: 'உங்கள் AI சட்ட உதவியாளர் — தமிழில்.' },
  te: { heading: 'స్వాగతం!', sub: 'మీ AI న్యాయ సహాయకుడు — తెలుగులో.' },
  bn: { heading: 'স্বাগতম!', sub: 'আপনার AI আইনি সহকারী — বাংলায়।' },
}

interface WelcomeScreenProps {
  language: SupportedLanguage
  onSelectPrompt: (text: string) => void
}

export function WelcomeScreen({ language, onSelectPrompt }: WelcomeScreenProps) {
  const { heading, sub } = GREETINGS[language] ?? GREETINGS.en

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 gap-6 text-center">
      {/* Logo mark */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
        style={{ backgroundColor: '#2C5530' }}
      >
        न्
      </div>

      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{heading}</h1>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>{sub}</p>
      </div>

      {/* Quick info pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {['🏠 Tenant Rights', '👷 Labor Law', '📋 RTI', '🛒 Consumer', '⚖️ Criminal', '👨\u200d👩\u200d👧 Family'].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#E8F5E9', color: '#2C5530' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-xs">
        <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
        <span className="text-xs" style={{ color: '#9CA3AF' }}>Try asking</span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
      </div>

      {/* Suggested prompts */}
      <SuggestedPrompts language={language} onSelect={onSelectPrompt} />

      {/* Disclaimer */}
      <p className="text-xs max-w-sm" style={{ color: '#9CA3AF' }}>
        NYAAY provides legal information, not legal advice. For serious matters, consult a qualified advocate.
      </p>
    </div>
  )
}
