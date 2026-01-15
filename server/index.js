import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const corsOptions = {
  origin: ['https://muaylang.app', 'https://www.muaylang.app'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
// ✅ 用 /.*/ 取代 "*"，避免 Express 5 直接 crash
app.options(/.*/, cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'muaylang-auth', time: Date.now() })
})

app.post('/auth/login', (_req, res) => {
  res.cookie('muaylang_demo', '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  res.json({ ok: true })
})

app.get('/auth/me', (req, res) => {
  res.json({ ok: true, cookies: req.cookies || {} })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`✅ auth server listening on :${port}`))
