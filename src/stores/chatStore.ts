import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Message, Conversation, SupportedLanguage, LegalDomain, MessageIntent } from '@/types'

interface ChatStore {
  messages: Message[]
  currentConversation: Conversation | null
  isLoading: boolean
  isStreaming: boolean
  isRecording: boolean
  isTranscribing: boolean
  error: string | null

  setMessages: (messages: Message[]) => void
  addMessage: (message: Omit<Message, 'id' | 'created_at'>) => Message
  updateMessage: (id: string, updates: Partial<Message>) => void
  removeMessage: (id: string) => void
  setCurrentConversation: (conversation: Conversation | null) => void
  updateConversation: (updates: Partial<Conversation>) => void
  setIsLoading: (loading: boolean) => void
  setIsStreaming: (streaming: boolean) => void
  setIsRecording: (recording: boolean) => void
  setIsTranscribing: (transcribing: boolean) => void
  setError: (error: string | null) => void
  clearChat: () => void

  sendMessage: (params: {
    content: string
    language: SupportedLanguage
    conversationId?: string
    userId: string
  }) => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  currentConversation: null,
  isLoading: false,
  isStreaming: false,
  isRecording: false,
  isTranscribing: false,
  error: null,

  setMessages: (messages) => set({ messages }),

  addMessage: (messageData) => {
    const message: Message = { ...messageData, id: nanoid(), created_at: new Date().toISOString() }
    set((state) => ({ messages: [...state.messages, message] }))
    return message
  },

  updateMessage: (id, updates) =>
    set((state) => ({ messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)) })),

  removeMessage: (id) =>
    set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),

  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

  updateConversation: (updates) =>
    set((state) => ({
      currentConversation: state.currentConversation ? { ...state.currentConversation, ...updates } : null,
    })),

  setIsLoading: (isLoading) => set({ isLoading }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsTranscribing: (isTranscribing) => set({ isTranscribing }),
  setError: (error) => set({ error }),

  clearChat: () => set({ messages: [], currentConversation: null, isLoading: false, isStreaming: false, error: null }),

  sendMessage: async ({ content, language, conversationId, userId }) => {
    const { addMessage, updateMessage, setIsLoading, setIsStreaming, setError, currentConversation } = get()
    setIsLoading(true); setError(null)

    const userMessage = addMessage({ conversation_id: conversationId ?? currentConversation?.id ?? '', role: 'user', content, language })
    void userMessage

    const assistantPlaceholder = addMessage({
      conversation_id: conversationId ?? currentConversation?.id ?? '',
      role: 'assistant', content: '', language, isStreaming: true,
    })

    setIsStreaming(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, language, conversationId: conversationId ?? currentConversation?.id, userId }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error ?? `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'delta') {
              fullContent += parsed.content
              updateMessage(assistantPlaceholder.id, { content: fullContent, isStreaming: true })
            } else if (parsed.type === 'done') {
              updateMessage(assistantPlaceholder.id, { content: parsed.content ?? fullContent, isStreaming: false, tokens_used: parsed.tokens_used, intent: parsed.intent as MessageIntent })
              if (parsed.domain) {
                set((state) => ({ currentConversation: state.currentConversation ? { ...state.currentConversation, domain: parsed.domain as LegalDomain } : null }))
              }
            }
          } catch { /* ignore non-JSON */ }
        }
      }
      updateMessage(assistantPlaceholder.id, { isStreaming: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get response'
      setError(message)
      updateMessage(assistantPlaceholder.id, { content: `Sorry, I encountered an error: ${message}. Please try again.`, isStreaming: false, error: message })
    } finally {
      setIsLoading(false); setIsStreaming(false)
    }
  },
}))
