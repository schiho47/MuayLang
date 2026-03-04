require('dotenv').config()
const sdk = require('node-appwrite')
const fs = require('fs')
const csv = require('csv-parser')

// For Appwrite
const DEFAULT_APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1'
const PUBLIC_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT
const APPWRITE_ENDPOINT =
  process.env.NODE_ENV === 'development'
    ? DEFAULT_APPWRITE_ENDPOINT
    : PUBLIC_ENDPOINT || 'https://api.muaylang.app/v1'

// Initialize Appwrite
const client = new sdk.Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.EXPO_PUBLIC_APPWRITE_API_KEY)

const databases = new sdk.Databases(client)

// 使用原生 fetch 抓取維基百科圖片
function resolveWikiTitle({ wikiSlug, link }) {
  const raw = (wikiSlug || '').trim()
  if (raw && raw !== 'null') return raw

  const url = (link || '').trim()
  if (!url) return null
  const match = url.match(/wikipedia\.org\/wiki\/([^?#]+)/i)
  if (!match) return null
  try {
    return decodeURIComponent(match[1]).replace(/_/g, '_')
  } catch {
    return match[1]
  }
}

async function getWikiImage({ wikiSlug, link }) {
  const title = resolveWikiTitle({ wikiSlug, link })
  if (!title) return null
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title.trim(),
    )}&prop=pageimages&piprop=thumbnail|original&format=json&pithumbsize=800&redirects=1&origin=*`

    // 使用 Node.js 18+ 內建的 fetch
    const response = await fetch(url)
    const data = await response.json()

    const pages = data.query.pages
    const pageId = Object.keys(pages)[0]

    if (pageId === '-1') return null
    const page = pages[pageId]
    return page?.thumbnail?.source || page?.original?.source || null
  } catch (e) {
    console.error(`❌ 無法抓取 ${title} 的圖片:`, e.message)
    return null
  }
}

const results = []

// 讀取 CSV 並執行
fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(`🚀 準備處理 ${results.length} 筆資料...`)

    for (const item of results) {
      try {
        process.stdout.write(`正在處理: ${item.date} ${item.title}... `)

        // 1. 抓圖片網址
        const imageUrl = await getWikiImage({ wikiSlug: item.wikiSlug, link: item.link })
        const resolvedSlug = resolveWikiTitle({ wikiSlug: item.wikiSlug, link: item.link })

        const payload = {
          title: item.title,
          content: item.content,
          link: item.link,
          // only update imageUrl when we successfully fetched one (avoid wiping existing on transient failures)
          ...(imageUrl ? { imageUrl } : {}),
          wikiSlug: resolvedSlug, // 存起來備用
        }

        // 2. Upsert into Appwrite (always sync)
        let exists = false
        try {
          await databases.getDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
            'discovery',
            item.date,
          )
          exists = true
        } catch (e) {
          exists = false
        }

        if (exists) {
          await databases.updateDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
            'discovery',
            item.date,
            payload,
          )
          console.log(`🔁 已存在，已同步 ✅ (圖片: ${imageUrl ? '更新' : '保留'})`)
        } else {
          await databases.createDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
            'discovery',
            item.date, // Document ID (MMDD)
            {
              ...payload,
              imageUrl: imageUrl, // create: allow null
            },
          )
          console.log(`✅ 新增完成 (圖片: ${imageUrl ? 'OK' : '無'})`)
        }
      } catch (error) {
        console.log(`❌ 錯誤: ${error.message}`)
      }
    }
    console.log('\n🏁 所有資料匯入完成！')
  })
