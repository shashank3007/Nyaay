/**
 * Per-user monthly token limiter.
 *
 * Free    : 50,000 tokens/month (~62 conversations, ~$0.27 cost to us)
 * Premium : 500,000 tokens/month (future paywall)
 *
 * Tracks usage in profiles.monthly_tokens_used + profiles.tokens_month.
 * Auto-resets when the calendar month changes.
 */

import { createClient } from '@/lib/supabase/server'
import { FREE_MONTHLY_LIMIT, PREMIUM_MONTHLY_LIMIT } from '@/lib/tokenLimits'

export { FREE_MONTHLY_LIMIT, PREMIUM_MONTHLY_LIMIT }

export interface TokenCheckResult {
  allowed:   boolean
  used:      number
  limit:     number
  remaining: number
  isPremium: boolean
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

export async function checkTokenLimit(userId: string): Promise<TokenCheckResult> {
  const supabase = await createClient()
  const month = currentMonth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('monthly_tokens_used, tokens_month, is_premium')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { allowed: true, used: 0, limit: FREE_MONTHLY_LIMIT, remaining: FREE_MONTHLY_LIMIT, isPremium: false }
  }

  const isPremium = profile.is_premium ?? false
  const limit = isPremium ? PREMIUM_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT
  const used = profile.tokens_month === month ? (profile.monthly_tokens_used ?? 0) : 0
  const remaining = Math.max(0, limit - used)

  return { allowed: remaining > 0, used, limit, remaining, isPremium }
}

export async function incrementTokenUsage(userId: string, tokensUsed: number): Promise<void> {
  const supabase = await createClient()
  const month = currentMonth()

  // Fetch current state, then write new values (acceptable for low-concurrency usage)
  const { data } = await supabase
    .from('profiles')
    .select('monthly_tokens_used, tokens_month')
    .eq('id', userId)
    .single()

  const sameMonth = data?.tokens_month === month
  await supabase
    .from('profiles')
    .update({
      monthly_tokens_used: sameMonth ? (data?.monthly_tokens_used ?? 0) + tokensUsed : tokensUsed,
      tokens_month: month,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}
