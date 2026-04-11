import { NextRequest, NextResponse } from 'next/server'

// BCP-47 locale tags accepted by Whisper
const WHISPER_LANG: Record<string, string> = {
  hi: 'hi',
  en: 'en',
  ta: 'ta',
  te: 'te',
  bn: 'bn',
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Transcription service not configured. Set OPENAI_API_KEY to enable Whisper fallback.' },
      { status: 503 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const audioFile = formData.get('audio')
  const language = (formData.get('language') as string | null) ?? 'hi'

  if (!audioFile || !(audioFile instanceof Blob)) {
    return NextResponse.json({ error: 'Missing audio field' }, { status: 400 })
  }

  // Forward to OpenAI Whisper
  const whisperForm = new FormData()
  whisperForm.append('file', audioFile, 'audio.webm')
  whisperForm.append('model', 'whisper-1')
  whisperForm.append('response_format', 'verbose_json')
  if (WHISPER_LANG[language]) {
    whisperForm.append('language', WHISPER_LANG[language])
  }

  try {
    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    })

    if (!whisperRes.ok) {
      const err = await whisperRes.text()
      console.error('[transcribe] Whisper error:', err)
      return NextResponse.json({ error: 'Transcription failed' }, { status: 502 })
    }

    const result = await whisperRes.json() as {
      text: string
      language: string
      segments?: Array<{ avg_logprob: number }>
    }

    // Average log-prob → approximate confidence score [0,1]
    const avgLogProb = result.segments?.length
      ? result.segments.reduce((s, seg) => s + seg.avg_logprob, 0) / result.segments.length
      : -0.5
    const confidence = Math.max(0, Math.min(1, 1 + avgLogProb / 2))

    return NextResponse.json({
      text: result.text.trim(),
      language: result.language,
      confidence,
    })
  } catch (err) {
    console.error('[transcribe] fetch error:', err)
    return NextResponse.json({ error: 'Network error reaching transcription service' }, { status: 502 })
  }
}
