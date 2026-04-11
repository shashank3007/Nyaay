import { NextRequest, NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderToBuffer } = require('@react-pdf/renderer') as { renderToBuffer: (el: unknown) => Promise<Buffer> }
import { getDocumentTemplate } from '@/lib/documents/templates'
import type { DocumentType, SupportedLanguage } from '@/types'
import { DOCUMENT_TYPE_CONFIG } from '@/types'

export async function POST(req: NextRequest) {
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
    const element = getDocumentTemplate(type, data)
    const buffer = await renderToBuffer(element)
    // Buffer → Uint8Array so NextResponse accepts it as BodyInit
    const body = new Uint8Array(buffer)

    const config = DOCUMENT_TYPE_CONFIG[type]
    const filename = `nyaay-${type.toLowerCase().replace(/_/g, '-')}.pdf`

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': body.byteLength.toString(),
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
