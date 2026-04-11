import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, DEFAULT_MODEL, MAX_TOKENS } from '@/lib/anthropic/client'
import { buildSystemPrompt } from '@/lib/anthropic/systemPrompt'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { SupportedLanguage, LegalDomain, MessageIntent } from '@/types'
import type Anthropic from '@anthropic-ai/sdk'

// ── Domain detection from assistant response ──────────────────
function detectDomain(text: string): LegalDomain {
  const t = text.toLowerCase()
  if (/\brent\b|tenant|landlord|evict|lease|deposit/.test(t)) return 'TENANT'
  if (/labour|labor|employee|employer|salary|overtime|dismiss|posh|wage/.test(t)) return 'LABOR'
  if (/domestic.violence|498.?a|dv act|shelter.home|\u092e\u0939\u093f\u0932\u093e|\u0918\u0930\u0947\u0932\u0942/.test(t)) return 'DOMESTIC_VIOLENCE'
  if (/consumer|refund|defective|product|ecommerce|ncdrc/.test(t)) return 'CONSUMER'
  if (/property|land|rera|registry|title|deed|mutation/.test(t)) return 'PROPERTY'
  if (/\bfir\b|police|criminal|bail|arrest|ipc|bnss|section.302/.test(t)) return 'CRIMINAL'
  if (/divorce|marriage|custody|maintenance|alimony|family/.test(t)) return 'FAMILY'
  return 'OTHER'
}

// ── Intent detection from user message ─────────────────────
function detectIntent(message: string): MessageIntent {
  const m = message.toLowerCase()
  if (/\bgenerate|draft|create|write\b|notice|rti|complaint\b|application/.test(m)) return 'DOCUMENT_REQUEST'
  if (/\bhello\b|hi\b|namaste|\u0928\u092e\u0938\u094d\u0924\u0947|vanakkam|namaskar/.test(m)) return 'GREETING'
  if (/\?|what\b|how\b|when\b|where\b|why\b|can i|should i|\u0915\u094d\u092f\u093e|\u0915\u0948\u0938\u0947|\u0915\u092c/.test(m)) return 'QUERY'
  if (/\bmore|explain|clarify|elaborate|tell me/.test(m)) return 'CLARIFICATION'
  if (m.length < 20) return 'FOLLOW_UP'
  return 'QUERY'
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

  let body: {
    message: string
    language: SupportedLanguage
    conversationId?: string
    userId: string
  }

  try {
    body = await req.json() as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { message, language = 'hi', conversationId, userId: _userId } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // ── Load conversation history from Supabase ──────────────────
  const anthropicMessages: Anthropic.MessageParam[] = []

  if (conversationId) {
    try {
      const supabase = await createServerClient()
      const { data: history } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20)

      if (history) {
        for (const row of history) {
          if (row.role === 'user' || row.role === 'assistant') {
            anthropicMessages.push({ role: row.role, content: row.content })
          }
        }
      }
    } catch (err) {
      console.error('[chat] history fetch error:', err)
      // Non-fatal — proceed without history
    }
  }

  anthropicMessages.push({ role: 'user', content: message })

  // ── SSE stream ───────────────────────────────────────────
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const client = getAnthropicClient()
        let fullContent = ''

        const stream = client.messages.stream({
          model: DEFAULT_MODEL,
          max_tokens: MAX_TOKENS,
          system: buildSystemPrompt(language),
          messages: anthropicMessages,
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            fullContent += text
            send({ type: 'delta', content: text })
          }
        }

        const finalMsg = await stream.finalMessage()
        const tokensUsed = finalMsg.usage.input_tokens + finalMsg.usage.output_tokens

        send({
          type: 'done',
          content: fullContent,
          tokens_used: tokensUsed,
          intent: detectIntent(message),
          domain: detectDomain(fullContent),
        })

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[chat] stream error:', err)
        send({ type: 'error', error: msg })
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable Nginx proxy buffering
    },
  })
}
