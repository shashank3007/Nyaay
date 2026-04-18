/**
 * Indian Kanoon API client — api.indiankanoon.org
 *
 * Fetches case law and statutory text, injects into AI context so Claude
 * cites real judgements and section numbers.
 *
 * API docs: https://api.indiankanoon.org/documentation/
 * Register for token: https://api.indiankanoon.org/
 *
 * Falls back silently — if token absent or API unreachable, chat still works.
 */

import type { LegalDomain } from '@/types'

const BASE_URL = 'https://api.indiankanoon.org'
const TIMEOUT_MS = 5000

// Domain → best search keywords for Indian Kanoon
const DOMAIN_QUERIES: Record<LegalDomain, string[]> = {
  TENANT:           ['Model Tenancy Act 2021', 'Rent Control eviction notice'],
  LABOR:            ['Minimum Wages Act payment', 'Industrial Disputes Act termination'],
  CONSUMER:         ['Consumer Protection Act 2019 complaint District Forum'],
  CRIMINAL:         ['Bharatiya Nyaya Sanhita 2023 FIR bail arrest'],
  FAMILY:           ['Hindu Marriage Act divorce maintenance'],
  DOMESTIC_VIOLENCE:['Protection of Women from Domestic Violence Act 2005'],
  PROPERTY:         ['Transfer of Property Act registration RERA 2016'],
  OTHER:            ['citizen legal rights India'],
}

export interface KanoonDoc {
  tid: string
  title: string
  headline: string
  doctype: string
  publishdate: string
}

export interface LegalContext {
  docs: KanoonDoc[]
  source: 'indiankanoon' | 'none'
}

// In-memory cache — expires after 2 hours
const cache = new Map<string, { data: LegalContext; ts: number }>()
const CACHE_TTL = 2 * 60 * 60 * 1000

async function fetchWithTimeout(url: string, token: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  } finally {
    clearTimeout(timer)
  }
}

async function searchKanoon(query: string, token: string): Promise<KanoonDoc[]> {
  try {
    const url = `${BASE_URL}/search/?formInput=${encodeURIComponent(query)}&pagenum=0`
    const res = await fetchWithTimeout(url, token)
    if (!res.ok) return []
    const data = await res.json() as { docs?: KanoonDoc[] }
    return (data.docs ?? []).slice(0, 3)
  } catch {
    return []
  }
}

export async function getLegalContext(domain: LegalDomain, query: string): Promise<LegalContext> {
  const token = process.env.INDIAN_KANOON_API_TOKEN
  if (!token) return { docs: [], source: 'none' }

  const cacheKey = `${domain}:${query.slice(0, 50)}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const queries = [query.slice(0, 60), ...(DOMAIN_QUERIES[domain] ?? []).slice(0, 1)]

  const results = await Promise.all(queries.map((q) => searchKanoon(q, token)))
  const allDocs = results.flat()

  // Deduplicate by tid
  const seen = new Set<string>()
  const docs = allDocs.filter((d) => {
    if (seen.has(d.tid)) return false
    seen.add(d.tid)
    return true
  }).slice(0, 4)

  const result: LegalContext = {
    docs,
    source: docs.length > 0 ? 'indiankanoon' : 'none',
  }

  cache.set(cacheKey, { data: result, ts: Date.now() })
  return result
}

/** Format retrieved docs as a system-prompt block for Claude */
export function formatContextBlock(ctx: LegalContext): string {
  if (ctx.docs.length === 0) return ''

  const lines: string[] = [
    '--- LEGAL REFERENCE (Indian Kanoon — indiankanoon.org) ---',
    'Use the following case law and statutory excerpts to ground your response.',
    '',
  ]

  for (const doc of ctx.docs) {
    lines.push(`[${doc.doctype?.toUpperCase() ?? 'LAW'} — ${doc.title}]`)
    if (doc.headline) lines.push(doc.headline.replace(/<[^>]+>/g, '').slice(0, 400))
    lines.push('')
  }

  lines.push('--- END LEGAL REFERENCE ---')
  return lines.join('\n')
}
