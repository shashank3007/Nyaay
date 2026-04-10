'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { WelcomeScreen } from './WelcomeScreen'
import type { Message, SupportedLanguage } from '@/types'

interface MessageListProps {
  messages: Message[]
  language: SupportedLanguage
  onSelectPrompt: (text: string) => void
}

export function MessageList({ messages, language, onSelectPrompt }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const visibleMessages = messages.filter((m) => m.role !== 'system')

  if (visibleMessages.length === 0) {
    return (
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <WelcomeScreen language={language} onSelectPrompt={onSelectPrompt} />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto py-3">
      {visibleMessages.map((message) => (
        <div key={message.id} className="message-enter">
          <MessageBubble message={message} />
        </div>
      ))}
      <div ref={bottomRef} className="h-1" aria-hidden />
    </div>
  )
}
