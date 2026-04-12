import { NextRequest, NextResponse } from 'next/server'
import { getDocumentTemplate } from '@/lib/documents/templates'
import { rateLimit, getRequestIdentifier } from '@/lib/rateLimit'
import type { DocumentType, SupportedLanguage } from '@/types'
import { DOCUMENT_TYPE_CONFIG } from '@/types'

// 30 document generations per hour per IP
const DOCS_RATE_LIMIT = { limit: 30, windowSec: 3600 }

export async function POST(req: NextRequest) {
  const rl = rateLimit(`documents:${getRequestIdentifier(req)}`, DOCS_RATE_LIMIT)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Document generation limit reached. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    )
  }

  let body: {
    type: DocumentType
    data: Record<string, string>
    language?: SupportedLanguage
  }

  try {
    body = await req.json() as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { type, data } = body

  if (!type || !data) {
    return NextResponse.json({ error: 'type and data are required' }, { status: 400 })
  }

  try {
    // Dynamic import so ESM-only @react-pdf/renderer is loaded at runtime by Node
    const { renderToBuffer } = await import('@react-pdf/renderer') as {
      renderToBuffer: (el: unknown) => Promise<Buffer>
    }

    const element = getDocumentTemplate(type, data)
    const buffer = await renderToBuffer(element)
    // Buffer → Uint8Array so NextResponse accepts it as BodyInit
    const bytes = new Uint8Array(buffer)

    const config = DOCUMENT_TYPE_CONFIG[type]
    const filename = `nyaay-${type.toLowerCase().replace(/_/g, '-')}.pdf`

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': bytes.byteLength.toString(),
        'X-Document-Type': config.label,
      },
    })
  } catch (err) {
    console.error('[documents] PDF generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate PDF. Please check your inputs and try again.' },
      { status: 500 }
    )
  }
}
