import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

const app = express()

app.use(express.json())
app.use(cookieParser())

// 讓前端可以帶 cookie（credentials）
app.use(
  cors({
    origin: ['https://muaylang.app', 'https://www.muaylang.app'],
    credentials: true,
  }),
)

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'muaylang-auth', time: Date.now() })
})

// 先做一個假登入，確認 cookie 能種成功（之後再接 Appwrite）
app.post('/auth/login', (req, res) => {
  const { email } = req.body ?? {}
  if (!email) return res.status(400).json({ ok: false, message: 'email required' })

  // 種一顆你自己網域的 cookie（這顆 iOS 不會當第三方擋掉）
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

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`✅ auth server listening on :${port}`))
