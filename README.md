# NYAAY (न्याय)

An AI-powered legal assistant for Indian citizens, delivered as a Progressive Web App (PWA) with voice-first interaction in regional languages.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **LLM:** Claude 3.5 Haiku (Anthropic API)
- **Speech:** Web Speech API + Whisper API (fallback)
- **PDF:** @react-pdf/renderer
- **State:** Zustand
- **PWA:** next-pwa

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your credentials
3. Run `npm install`
4. Run `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required environment variables.

## Features

- Voice-first legal Q&A in Hindi, English, Tamil, Telugu, Bengali
- Legal document generation (PDF download)
- Conversation history
- Offline support (PWA)
- Mobile-first responsive design
