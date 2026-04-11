import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from '@/stores/chatStore'
import type { Message } from '@/types'

// Snapshot the initial state shape so we can reset between tests
const INITIAL_STATE = {
  messages: [],
  currentConversation: null,
  isLoading: false,
  isStreaming: false,
  isRecording: false,
  isTranscribing: false,
  error: null,
}

function resetStore() {
  useChatStore.setState(INITIAL_STATE)
}

describe('chatStore', () => {
  beforeEach(resetStore)

  // ── Initial state ────────────────────────────────────────────
  describe('initial state', () => {
    it('has empty messages array', () => {
      expect(useChatStore.getState().messages).toEqual([])
    })

    it('has null currentConversation', () => {
      expect(useChatStore.getState().currentConversation).toBeNull()
    })

    it('all flags start false', () => {
      const { isLoading, isStreaming, isRecording, isTranscribing } = useChatStore.getState()
      expect(isLoading).toBe(false)
      expect(isStreaming).toBe(false)
      expect(isRecording).toBe(false)
      expect(isTranscribing).toBe(false)
    })
  })

  // ── addMessage ──────────────────────────────────────────────
  describe('addMessage()', () => {
    it('appends a message with generated id and created_at', () => {
      const { addMessage } = useChatStore.getState()
      const msg = addMessage({ conversation_id: 'c1', role: 'user', content: 'Hello', language: 'en' })

      expect(msg.id).toBeTruthy()
      expect(msg.created_at).toBeTruthy()
      expect(useChatStore.getState().messages).toHaveLength(1)
    })

    it('stores the correct role and content', () => {
      const { addMessage } = useChatStore.getState()
      addMessage({ conversation_id: 'c1', role: 'assistant', content: 'Hi there', language: 'hi' })

      const stored = useChatStore.getState().messages[0]
      expect(stored.role).toBe('assistant')
      expect(stored.content).toBe('Hi there')
    })

    it('appends multiple messages in order', () => {
      const { addMessage } = useChatStore.getState()
      addMessage({ conversation_id: 'c1', role: 'user',      content: 'First',  language: 'en' })
      addMessage({ conversation_id: 'c1', role: 'assistant', content: 'Second', language: 'en' })

      const msgs = useChatStore.getState().messages
      expect(msgs).toHaveLength(2)
      expect(msgs[0].content).toBe('First')
      expect(msgs[1].content).toBe('Second')
    })

    it('returns the added message object', () => {
      const { addMessage } = useChatStore.getState()
      const result = addMessage({ conversation_id: 'c1', role: 'user', content: 'Test', language: 'en' })
      expect(result).toMatchObject({ content: 'Test', role: 'user' })
    })
  })

  // ── updateMessage ───────────────────────────────────────────
  describe('updateMessage()', () => {
    it('updates content of an existing message', () => {
      const { addMessage, updateMessage } = useChatStore.getState()
      const msg = addMessage({ conversation_id: 'c1', role: 'assistant', content: '', language: 'en', isStreaming: true })

      updateMessage(msg.id, { content: 'Updated', isStreaming: false })

      const updated = useChatStore.getState().messages.find((m) => m.id === msg.id)!
      expect(updated.content).toBe('Updated')
      expect(updated.isStreaming).toBe(false)
    })

    it('only updates the targeted message', () => {
      const { addMessage, updateMessage } = useChatStore.getState()
      addMessage({ conversation_id: 'c1', role: 'user',      content: 'First',  language: 'en' })
      const m2 = addMessage({ conversation_id: 'c1', role: 'assistant', content: 'Second', language: 'en' })

      updateMessage(m2.id, { content: 'Changed' })

      const msgs = useChatStore.getState().messages
      expect(msgs[0].content).toBe('First')
      expect(msgs[1].content).toBe('Changed')
    })

    it('is a no-op for unknown id', () => {
      const { addMessage, updateMessage } = useChatStore.getState()
      addMessage({ conversation_id: 'c1', role: 'user', content: 'Hello', language: 'en' })

      updateMessage('non-existent-id', { content: 'Changed' })

      expect(useChatStore.getState().messages[0].content).toBe('Hello')
    })
  })

  // ── removeMessage ───────────────────────────────────────────
  describe('removeMessage()', () => {
    it('removes a message by id', () => {
      const { addMessage, removeMessage } = useChatStore.getState()
      const msg = addMessage({ conversation_id: 'c1', role: 'user', content: 'Remove me', language: 'en' })

      removeMessage(msg.id)

      expect(useChatStore.getState().messages).toHaveLength(0)
    })

    it('leaves other messages intact', () => {
      const { addMessage, removeMessage } = useChatStore.getState()
      addMessage({ conversation_id: 'c1', role: 'user',      content: 'Keep',   language: 'en' })
      const m2 = addMessage({ conversation_id: 'c1', role: 'assistant', content: 'Remove', language: 'en' })

      removeMessage(m2.id)

      const msgs = useChatStore.getState().messages
      expect(msgs).toHaveLength(1)
      expect(msgs[0].content).toBe('Keep')
    })
  })

  // ── setMessages ─────────────────────────────────────────────
  describe('setMessages()', () => {
    it('replaces all messages', () => {
      const { addMessage, setMessages } = useChatStore.getState()
      addMessage({ conversation_id: 'c1', role: 'user', content: 'Old', language: 'en' })

      const newMessages: Message[] = [
        { id: 'x1', conversation_id: 'c2', role: 'user', content: 'New', language: 'hi', created_at: new Date().toISOString() },
      ]
      setMessages(newMessages)

      expect(useChatStore.getState().messages).toHaveLength(1)
      expect(useChatStore.getState().messages[0].content).toBe('New')
    })
  })

  // ── clearChat ───────────────────────────────────────────────
  describe('clearChat()', () => {
    it('clears messages and conversation', () => {
      const { addMessage, setCurrentConversation, clearChat } = useChatStore.getState()
      addMessage({ conversation_id: 'c1', role: 'user', content: 'Hello', language: 'en' })
      setCurrentConversation({ id: 'c1', user_id: 'u1', title: 'Test', status: 'active', domain: null, summary: null, created_at: '', updated_at: '' })

      clearChat()

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(0)
      expect(state.currentConversation).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.isStreaming).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  // ── Flag setters ────────────────────────────────────────────
  describe('flag setters', () => {
    it('setIsLoading toggles isLoading', () => {
      useChatStore.getState().setIsLoading(true)
      expect(useChatStore.getState().isLoading).toBe(true)
      useChatStore.getState().setIsLoading(false)
      expect(useChatStore.getState().isLoading).toBe(false)
    })

    it('setIsStreaming toggles isStreaming', () => {
      useChatStore.getState().setIsStreaming(true)
      expect(useChatStore.getState().isStreaming).toBe(true)
    })

    it('setError stores error message', () => {
      useChatStore.getState().setError('Something went wrong')
      expect(useChatStore.getState().error).toBe('Something went wrong')
    })

    it('setError with null clears error', () => {
      useChatStore.getState().setError('err')
      useChatStore.getState().setError(null)
      expect(useChatStore.getState().error).toBeNull()
    })
  })

  // ── updateConversation ──────────────────────────────────────
  describe('updateConversation()', () => {
    it('merges updates into current conversation', () => {
      const { setCurrentConversation, updateConversation } = useChatStore.getState()
      setCurrentConversation({ id: 'c1', user_id: 'u1', title: 'Old', status: 'active', domain: null, summary: null, created_at: '', updated_at: '' })

      updateConversation({ title: 'Updated', domain: 'LABOR' })

      const conv = useChatStore.getState().currentConversation!
      expect(conv.title).toBe('Updated')
      expect(conv.domain).toBe('LABOR')
      expect(conv.id).toBe('c1')
    })

    it('is a no-op when no current conversation', () => {
      useChatStore.getState().updateConversation({ title: 'Noop' })
      expect(useChatStore.getState().currentConversation).toBeNull()
    })
  })
})
