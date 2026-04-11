'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Clock, Trash2, Plus, Scale } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { useChatStore } from '@/stores/chatStore'
import type { Conversation, Message, LegalDomain } from '@/types'
import { LEGAL_DOMAIN_LABELS } from '@/types'

const DOMAIN_COLORS: Record<LegalDomain, { bg: string; text: string }> = {
  PROPERTY:          { bg: '#FEF3C7', text: '#92400E' },
  LABOR:             { bg: '#DBEAFE', text: '#1E40AF' },
  DOMESTIC_VIOLENCE: { bg: '#FCE7F3', text: '#9D174D' },
  CONSUMER:          { bg: '#D1FAE5', text: '#065F46' },
  TENANT:            { bg: '#EDE9FE', text: '#5B21B6' },
  CRIMINAL:          { bg: '#FEE2E2', text: '#991B1B' },
  FAMILY:            { bg: '#FFF7ED', text: '#9A3412' },
  OTHER:             { bg: '#F3F4F6', text: '#374151' },
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr  = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1)  return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr  < 24) return `${diffHr}h ago`
  if (diffDay < 7)  return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function HistoryPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const { setCurrentConversation, setMessages, clearChat } = useChatStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [deletingId, setDeletingId]       = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setConversations((data ?? []) as Conversation[])
        setIsLoading(false)
      })
  }, [user])

  async function handleOpen(conv: Conversation) {
    clearChat()
    setCurrentConversation(conv)
    const supabase = createClient()
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
    if (msgs) setMessages(msgs as Message[])
    router.push('/chat')
  }

  async function handleDelete(e: React.MouseEvent, convId: string) {
    e.stopPropagation()
    setDeletingId(convId)
    const supabase = createClient()
    await supabase.from('conversations').update({ status: 'deleted' }).eq('id', convId)
    setConversations((prev) => prev.filter((c) => c.id !== convId))
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: '#FFFBF5' }}>
      <div className="max-w-3xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>History</h1>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              {isLoading ? '…' : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => { clearChat(); router.push('/chat') }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#2C5530', color: '#FFFFFF' }}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: '#E5E7EB' }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
              <Scale className="w-8 h-8" style={{ color: '#2C5530' }} />
            </div>
            <div className="text-center">
              <p className="font-semibold" style={{ color: '#1A1A1A' }}>No conversations yet</p>
              <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Start chatting with NYAAY to get legal guidance</p>
            </div>
            <button
              onClick={() => router.push('/chat')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#2C5530', color: '#FFFFFF' }}
            >
              Start a conversation
            </button>
          </div>
        )}

        {/* List */}
        {!isLoading && conversations.length > 0 && (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const domainColor = conv.domain ? DOMAIN_COLORS[conv.domain] : DOMAIN_COLORS.OTHER
              return (
                <div
                  key={conv.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpen(conv)}
                  onClick={() => handleOpen(conv)}
                  className="group flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8F5E9' }}>
                    <MessageSquare className="w-5 h-5" style={{ color: '#2C5530' }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-snug" style={{ color: '#1A1A1A' }}>
                        {conv.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>
                          {formatRelativeTime(conv.updated_at)}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, conv.id)}
                          disabled={deletingId === conv.id}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all hover:bg-red-50"
                          style={{ color: '#EF4444' }}
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {conv.summary && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#5C5C5C' }}>
                        {conv.summary}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {conv.domain && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: domainColor.bg, color: domainColor.text }}
                        >
                          {LEGAL_DOMAIN_LABELS[conv.domain]}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
                        <Clock className="w-3 h-3" />
                        {new Date(conv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
