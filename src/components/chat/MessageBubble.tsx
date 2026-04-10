'use client'

import { formatRelativeTime } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

function renderContent(content: string): React.ReactNode {
  // Split on double newlines for paragraphs, single for line breaks
  const paragraphs = content.split(/\n{2,}/)
  return paragraphs.map((para, pi) => (
    <p key={pi} className={pi > 0 ? 'mt-3' : ''}>
      {para.split('\n').map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line}
        </span>
      ))}
    </p>
  ))
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-1">
        <div className="max-w-[75%] flex flex-col items-end gap-1">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
            style={{ backgroundColor: '#2C5530', color: '#FFFFFF' }}
          >
            {renderContent(message.content)}
          </div>
          <span className="text-xs px-1" style={{ color: '#9CA3AF' }}>
            {formatRelativeTime(message.created_at)}
          </span>
        </div>
      </div>
    )
  }

  if (isAssistant) {
    const isEmpty = !message.content && message.isStreaming
    return (
      <div className="flex items-start gap-3 px-4 py-1">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1"
          style={{ backgroundColor: '#2C5530' }}
        >
          न्
        </div>
        <div className="max-w-[80%] flex flex-col gap-1">
          <div
            className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
          >
            {isEmpty ? (
              // Empty placeholder while first tokens arrive — show TypingIndicator dots inline
              <span className="flex gap-1 py-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: '#9CA3AF', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            ) : (
              <span className={message.isStreaming ? 'streaming-cursor' : ''}>
                {renderContent(message.content)}
              </span>
            )}
          </div>
          {!message.isStreaming && message.created_at && (
            <span className="text-xs px-1" style={{ color: '#9CA3AF' }}>
              {formatRelativeTime(message.created_at)}
              {message.tokens_used ? ` · ${message.tokens_used} tokens` : ''}
            </span>
          )}
          {message.error && (
            <p className="text-xs px-1" style={{ color: '#EF4444' }}>
              {message.error}
            </p>
          )}
        </div>
      </div>
    )
  }

  return null
}
