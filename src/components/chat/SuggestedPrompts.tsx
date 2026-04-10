'use client'

import { SUGGESTED_PROMPTS, type SupportedLanguage } from '@/types'

interface SuggestedPromptsProps {
  language: SupportedLanguage
  onSelect: (text: string) => void
}

export function SuggestedPrompts({ language, onSelect }: SuggestedPromptsProps) {
  // Show prompts matching the current language first, then fill with others, max 4
  const sorted = [
    ...SUGGESTED_PROMPTS.filter((p) => p.language === language),
    ...SUGGESTED_PROMPTS.filter((p) => p.language !== language),
  ].slice(0, 4)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
      {sorted.map((prompt) => (
        <button
          key={prompt.id}
          onClick={() => onSelect(prompt.text)}
          className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-sm"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <span className="text-xl shrink-0 mt-0.5">{prompt.icon}</span>
          <span className="text-sm leading-snug line-clamp-2" style={{ color: '#5C5C5C' }}>
            {prompt.text}
          </span>
        </button>
      ))}
    </div>
  )
}
