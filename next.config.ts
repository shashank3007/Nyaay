import type { NextConfig } from 'next'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: {
    document: '/offline',
  },
})

const nextConfig: NextConfig = {
  // react-pdf uses Node.js-only APIs in server routes — keep it external
  serverExternalPackages: ['@react-pdf/renderer'],
}

export default withPWA(nextConfig)
