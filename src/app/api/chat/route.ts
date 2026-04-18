import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, DEFAULT_MODEL, MAX_TOKENS } from '@/lib/anthropic/client'
import { buildSystemPrompt } from '@/lib/anthropic/systemPrompt'
import { detectDomain, detectIntent } from '@/lib/anthropic/detect'
import { getLegalContext, formatContextBlock } from '@/lib/indiacode/client'
import { checkTokenLimit, incrementTokenUsage, FREE_MONTHLY_LIMIT } from '@/lib/tokenLimiter'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { rateLimit, getRequestIdentifier } from '@/lib/rateLimit'
import type { SupportedLanguage } from '@/types'
import type Anthropic from '@anthropic-ai/sdk'

// 20 requests per minute per IP
const CHAT_RATE_LIMIT = { limit: 20, windowSec: 60 }

export async function POST(req: NextRequest) {
  // ── IP rate limit ────────────────────────────────────────────
  const id = getRequestIdentifier(req)
  const rl = rateLimit(`chat:${id}`, CHAT_RATE_LIMIT)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

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

  const { message, language = 'hi', conversationId, userId } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // ── Per-user monthly token limit ─────────────────────────────
  if (userId) {
    const tokenCheck = await checkTokenLimit(userId).catch(() => null)
    if (tokenCheck && !tokenCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Monthly limit reached',
          message: `You have used your ${FREE_MONTHLY_LIMIT.toLocaleString()} free tokens for this month. Your limit resets on the 1st of next month.`,
          used: tokenCheck.used,
          limit: tokenCheck.limit,
          upgradeAvailable: true,
        },
        { status: 429 }
      )
    }
  }

  // ── Load conversation history ────────────────────────────────
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
    }
  }

  anthropicMessages.push({ role: 'user', content: message })

  // ── Indian Kanoon legal context (non-blocking, 5s timeout) ───
  const domain = detectDomain(message)
  const legalCtx = await getLegalContext(domain, message).catch(() => null)
  const ctxBlock = legalCtx ? formatContextBlock(legalCtx) : ''

  // ── SSE stream ───────────────────────────────────────────────
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const client = getAnthropicClient()
        let fullContent = ''

        const systemPrompt = ctxBlock
          ? `${buildSystemPrompt(language)}\n\n${ctxBlock}`
          : buildSystemPrompt(language)

        const stream = client.messages.stream({
          model: DEFAULT_MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
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

        // Persist token usage (non-blocking, non-fatal)
        if (userId) {
          incrementTokenUsage(userId, tokensUsed).catch((err) =>
            console.error('[chat] token increment error:', err)
          )
        }

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
      'X-Accel-Buffering': 'no',
    },
  })
}
