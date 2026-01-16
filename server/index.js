import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Client, Users, Account, Query, ID } from 'node-appwrite'

const app = express()
const isProd = process.env.NODE_ENV === 'production'

const corsOptions = {
  origin(origin, cb) {
    const o = typeof origin === 'string' ? origin : ''
    if (!o) return cb(null, true)

    if (!isProd && (o.startsWith('http://localhost') || o.startsWith('http://127.0.0.1'))) {
      return cb(null, true)
    }

    if (o === 'https://muaylang.app' || o === 'https://www.muaylang.app') {
      return cb(null, true)
    }

    return cb(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

// ---------- helpers ----------
function assertEnv() {
  const required = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY']
  for (const k of required) {
    if (!process.env[k]) throw new Error(`Missing env: ${k}`)
  }
}

function makeServerClient() {
  assertEnv()
  return new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)
}

function setSessionCookie(res, cookie) {
  // cookie 只是為了 logout/me 能用，不是必須
  res.cookie('aw_session_cookie', cookie, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 1000,
  })
}

function clearSessionCookie(res) {
  res.clearCookie('aw_session_cookie', { path: '/' })
}

async function createJwtFromSessionSecret(secret) {
  const userClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setSession(secret)

  const account = new Account(userClient)
  const jwtResp = await account.createJWT()
  return jwtResp.jwt
}

async function createJwtFromCookie(cookie) {
  const endpoint = (process.env.APPWRITE_ENDPOINT || '').replace(/\/+$/, '')
  const project = process.env.APPWRITE_PROJECT_ID

  const url = `${endpoint}/account/jwt`

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-appwrite-project': project,
      // ✅ 关键：把 appwrite 的 session cookie 带进去
      cookie,
    },
  })

  const text = await resp.text()
  if (!resp.ok) throw new Error(`Appwrite createJWT failed (${resp.status}): ${text}`)

  const data = JSON.parse(text) // { jwt }
  return data.jwt
}

async function createEmailSession(email, password) {
  const endpoint = (process.env.APPWRITE_ENDPOINT || '').replace(/\/+$/, '')
  const project = process.env.APPWRITE_PROJECT_ID

  const url = `${endpoint}/account/sessions/email`

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-appwrite-project': project,
    },
    body: JSON.stringify({ email, password }),
  })

  const text = await resp.text()
  if (!resp.ok) throw new Error(`Appwrite create session failed (${resp.status}): ${text}`)

  const session = JSON.parse(text)

  // ✅ 关键：Appwrite 不回 secret，但会在 Set-Cookie 里给 session cookie
  const setCookie = resp.headers.get('set-cookie') || ''
  // 取第一段 name=value
  const cookie = setCookie.split(';')[0]

  console.log('[DEBUG] set-cookie =', setCookie)
  console.log('[DEBUG] cookie(name=value) =', cookie)

  return { session, cookie }
}

// ---------- routes ----------
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'muaylang-auth', time: Date.now() })
})

/**
 * POST /auth/login
 * body: { email, password }
 * returns: { ok, jwt, expiry, user }
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'email & password required' })
    }

    const { session, cookie } = await createEmailSession(email, password)

    setSessionCookie(res, cookie)

    const jwt = await createJwtFromCookie(cookie)
    const expiry = Date.now() + 3600 * 1000

    return res.json({
      ok: true,
      jwt,
      expiry,
      user: {
        $id: session.userId,
        email, // 或用你自己的 email
        name: '', // 先空，前端用 jwt 再 account.get 補全
        emailVerification: false,
      },
    })
  } catch (e) {
    console.error('auth/login error:', e)
    return res.status(500).json({ ok: false, message: e?.message ?? String(e) })
  }
})

/**
 * POST /auth/register
 * body: { email, password, name? }
 * returns: { ok, jwt, expiry, user }
 */
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body ?? {}
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'email & password required' })
    }

    const serverClient = makeServerClient()
    const users = new Users(serverClient)

    // create user
    const created = await users.create(ID.unique(), email, password, name || '')

    // auto create session (so user can be logged in immediately)
    const session = await createEmailSession(email, password)

    setSessionCookie(res, session.secret)

    const jwt = await createJwtFromSessionSecret(session.secret)
    const expiry = Date.now() + 3600 * 1000

    const user = {
      $id: created.$id,
      email: created.email,
      name: created.name,
      emailVerification: created.emailVerification,
    }

    return res.json({ ok: true, jwt, expiry, user })
  } catch (e) {
    console.error('auth/register error:', e)
    return res.status(500).json({ ok: false, message: e?.message ?? String(e) })
  }
})

/**
 * GET /auth/me
 * returns: { ok, user? }
 */
app.get('/auth/me', async (req, res) => {
  try {
    const secret = req.cookies?.aw_session_secret
    if (!secret) return res.status(401).json({ ok: false, message: 'No session' })

    const userClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setSession(secret)

    const account = new Account(userClient)
    const me = await account.get()

    const user = {
      $id: me.$id,
      email: me.email,
      name: me.name,
      emailVerification: me.emailVerification,
    }

    return res.json({ ok: true, user })
  } catch (e) {
    console.error('auth/me error:', e)
    return res.status(401).json({ ok: false, message: e?.message ?? String(e) })
  }
})

/**
 * POST /auth/logout
 * clears cookie and deletes current session (best-effort)
 */
app.post('/auth/logout', async (req, res) => {
  try {
    const secret = req.cookies?.aw_session_secret
    clearSessionCookie(res)

    if (secret) {
      try {
        const userClient = new Client()
          .setEndpoint(process.env.APPWRITE_ENDPOINT)
          .setProject(process.env.APPWRITE_PROJECT_ID)
          .setSession(secret)

        const account = new Account(userClient)
        await account.deleteSession('current')
      } catch (e) {
        console.log('logout: deleteSession skipped:', e?.message ?? e)
      }
    }

    return res.json({ ok: true })
  } catch (e) {
    console.error('auth/logout error:', e)
    return res.status(500).json({ ok: false, message: e?.message ?? String(e) })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`✅ auth server listening on :${port}`))
