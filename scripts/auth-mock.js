/**
 * Minimal GoTrue-compatible auth mock server.
 * Implements the subset of Supabase auth endpoints used by NYAAY.
 * Runs on port 54321 (mirrors local Supabase default).
 */
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const { Client } = require('pg')

const app  = express()
const PORT = 54321
const JWT_SECRET = 'nyaay-local-jwt-secret-32chars!!'

const db = new Client({
  host: '/var/run/postgresql',  // Unix socket — uses peer/trust auth
  database: 'nyaay_local',
  user: 'root',
})

db.connect().then(() => console.log('[auth-mock] connected to postgres'))

app.use(cors())
app.use(express.json())

function makeSession(user) {
  const access_token = jwt.sign(
    { sub: user.id, email: user.email, role: 'authenticated', aal: 'aal1' },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  const refresh_token = jwt.sign({ sub: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' })
  return {
    access_token,
    refresh_token,
    token_type: 'bearer',
    expires_in: 604800,
    expires_at: Math.floor(Date.now() / 1000) + 604800,
    user: {
      id: user.id,
      email: user.email,
      role: 'authenticated',
      aud: 'authenticated',
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      user_metadata: {},
      app_metadata: { provider: 'email', providers: ['email'] },
    },
  }
}

// ── Sign Up ───────────────────────────────────────────────────────
app.post('/auth/v1/signup', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(422).json({ message: 'Email and password required' })

  try {
    const exists = await db.query('SELECT id FROM auth.users WHERE email = $1', [email])
    if (exists.rows.length > 0) return res.status(422).json({ message: 'User already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const result = await db.query(
      `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
       VALUES ($1, $2, now()) RETURNING *`,
      [email, hashed]
    )
    const user = result.rows[0]

    // Auto-create profile
    await db.query(
      `INSERT INTO public.profiles (id, email) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [user.id, email]
    )

    console.log(`[auth-mock] signup: ${email} (${user.id})`)
    res.status(200).json(makeSession(user))
  } catch (err) {
    console.error('[auth-mock] signup error:', err.message)
    res.status(500).json({ message: 'Internal error' })
  }
})

// ── Sign In ───────────────────────────────────────────────────────
app.post('/auth/v1/token', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

  try {
    const result = await db.query('SELECT * FROM auth.users WHERE email = $1', [email])
    if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid login credentials' })

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.encrypted_password || '')
    if (!valid) return res.status(400).json({ message: 'Invalid login credentials' })

    console.log(`[auth-mock] signin: ${email}`)
    res.json(makeSession(user))
  } catch (err) {
    console.error('[auth-mock] signin error:', err.message)
    res.status(500).json({ message: 'Internal error' })
  }
})

// ── Get User ─────────────────────────────────────────────────────
app.get('/auth/v1/user', async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const result = await db.query('SELECT * FROM auth.users WHERE id = $1', [decoded.sub])
    if (result.rows.length === 0) return res.status(401).json({ message: 'User not found' })
    const user = result.rows[0]
    res.json({
      id: user.id, email: user.email, role: 'authenticated',
      aud: 'authenticated', created_at: user.created_at, user_metadata: {},
    })
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
})

// ── Refresh ───────────────────────────────────────────────────────
app.post('/auth/v1/token', async (req, res) => {
  // handled by grant_type check below
})

// ── Sign Out ──────────────────────────────────────────────────────
app.post('/auth/v1/logout', (req, res) => res.status(204).send())

// ── Health ────────────────────────────────────────────────────────
app.get('/auth/v1/health', (req, res) => res.json({ status: 'ok', version: 'mock-1.0' }))

// ── Settings (required by supabase-js client init) ────────────────
app.get('/auth/v1/settings', (req, res) => res.json({
  external: { email: true }, disable_signup: false, mailer_autoconfirm: true,
}))

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[auth-mock] listening on http://127.0.0.1:${PORT}`)
  console.log('[auth-mock] endpoints: /auth/v1/signup  /auth/v1/token  /auth/v1/user')
})
