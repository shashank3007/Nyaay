import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NYAAY — Legal Assistant',
  description: 'AI-powered legal assistant for Indian citizens. Get free legal guidance in your language.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NYAAY',
  },
  applicationName: 'NYAAY',
  keywords: ['legal', 'india', 'law', 'RTI', 'tenant rights', 'consumer rights', 'legal advice'],
  authors: [{ name: 'NYAAY' }],
  openGraph: {
    title: 'NYAAY — Legal Assistant',
    description: 'AI-powered legal assistant for Indian citizens',
    type: 'website',
    locale: 'en_IN',
  },
}

export const viewport: Viewport = {
  themeColor: '#2C5530',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
