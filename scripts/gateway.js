/**
 * Local Supabase gateway — unified proxy on port 8000
 * Routes:  /auth/v1/*  →  auth-mock  (port 54321)
 *          /rest/v1/*  →  PostgREST  (port 3001)
 */
const http  = require('http')
const https = require('https')

const PORT   = 8000
const AUTH   = { host: '127.0.0.1', port: 54321 }
const REST   = { host: '127.0.0.1', port: 3001  }

function proxy(req, res, target, rewritePath) {
  const options = {
    hostname: target.host,
    port:     target.port,
    path:     rewritePath || req.url,
    method:   req.method,
    headers:  { ...req.headers, host: `${target.host}:${target.port}` },
  }

  const upstream = http.request(options, (upRes) => {
    res.writeHead(upRes.statusCode, upRes.headers)
    upRes.pipe(res)
  })

  upstream.on('error', (err) => {
    console.error('[gateway] upstream error:', err.message)
    if (!res.headersSent) {
      res.writeHead(502)
      res.end(JSON.stringify({ error: 'Gateway error: ' + err.message }))
    }
  })

  req.pipe(upstream)
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,apikey,Prefer,Range')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  if (req.url.startsWith('/auth/v1')) {
    proxy(req, res, AUTH)
  } else if (req.url.startsWith('/rest/v1')) {
    // Strip /rest/v1 prefix — PostgREST serves at /
    proxy(req, res, REST, req.url.replace('/rest/v1', '') || '/')
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[gateway] listening on http://127.0.0.1:${PORT}`)
  console.log(`[gateway] /auth/v1/* → auth-mock:${AUTH.port}`)
  console.log(`[gateway] /rest/v1/* → PostgREST:${REST.port}`)
})
