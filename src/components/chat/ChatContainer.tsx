'use client'

import { useState, useCallback } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/userStore'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

export function ChatContainer() {
  const { messages, isStreaming, isRecording, isTranscribing, sendMessage, setIsRecording } =
    useChatStore()
  const { user, preferences } = useUserStore()
  const [transcript, setTranscript] = useState('')

  // Voice toggle — in Step 6 this will wire to the real useVoiceRecorder hook.
  // For now it's a stub that toggles state so the UI is functional.
  function handleVoiceToggle() {
    if (isRecording) {
      setIsRecording(false)
    } else {
      setIsRecording(true)
    }
  }

  function handleTranscriptConfirm(text: string) {
    setTranscript('')
    handleSend(text)
  }

  function handleTranscriptDiscard() {
    setTranscript('')
    setIsRecording(false)
  }

  const handleSend = useCallback(
    async (text: string) => {
      if (!user) return
      await sendMessage({
        content: text,
        language: preferences.language,
        userId: user.id,
      })
    },
    [user, preferences.language, sendMessage]
  )

  const handleSelectPrompt = useCallback(
    (text: string) => { handleSend(text) },
    [handleSend]
  )

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFFBF5' }}>
      {/* Message list (fills available height) */}
      <MessageList
        messages={messages}
        language={preferences.language}
        onSelectPrompt={handleSelectPrompt}
      />

      {/* Input area (always at bottom) */}
      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        transcript={transcript}
        onVoiceToggle={handleVoiceToggle}
        onTranscriptConfirm={handleTranscriptConfirm}
        onTranscriptDiscard={handleTranscriptDiscard}
      />
    </div>
  )
}
