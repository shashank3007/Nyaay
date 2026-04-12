'use client'

import { useCallback } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/userStore'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

export function ChatContainer() {
  const { messages, isStreaming, sendMessage } = useChatStore()
  const { user, preferences } = useUserStore()

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis()

  const {
    transcript,
    interimTranscript,
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useVoiceRecorder(preferences.language)

  async function handleVoiceToggle() {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  function handleTranscriptConfirm(text: string) {
    clearTranscript()
    handleSend(text)
  }

  function handleTranscriptDiscard() {
    clearTranscript()
    stopRecording()
  }

  const handleSend = useCallback(
    async (text: string) => {
      if (!user) return
      // Stop any ongoing TTS before sending
      if (isSpeaking) stopSpeaking()

      await sendMessage({
        content: text,
        language: preferences.language,
        userId: user.id,
      })
    },
    [user, preferences.language, sendMessage, isSpeaking, stopSpeaking]
  )

  const handleSelectPrompt = useCallback(
    (text: string) => { handleSend(text) },
    [handleSend]
  )

  // The combined transcript (final + interim) shown while recording
  const liveTranscript = transcript + (interimTranscript ? ` ${interimTranscript}` : '')

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFFBF5' }}>
      {/* Message list */}
      <MessageList
        messages={messages}
        language={preferences.language}
        onSelectPrompt={handleSelectPrompt}
        onSpeakMessage={(text) => speak(text, preferences.language)}
        isSpeaking={isSpeaking}
        onStopSpeaking={stopSpeaking}
      />

      {/* Input area */}
      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        transcript={isRecording ? liveTranscript : transcript}
        onVoiceToggle={handleVoiceToggle}
        onTranscriptConfirm={handleTranscriptConfirm}
        onTranscriptDiscard={handleTranscriptDiscard}
      />
    </div>
  )
}
