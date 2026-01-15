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
app.options('*', cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

// test login
app.post('/auth/login', (req, res) => {
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
  res.json({ ok: true, cookies: req.cookies ?? {} })
})
