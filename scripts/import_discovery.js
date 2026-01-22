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
async function getWikiImage(slug) {
  if (!slug || slug === 'null' || slug === '') return null
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(slug.trim())}&prop=pageimages&format=json&pithumbsize=800&origin=*`

    // 使用 Node.js 18+ 內建的 fetch
    const response = await fetch(url)
    const data = await response.json()

    const pages = data.query.pages
    const pageId = Object.keys(pages)[0]

    if (pageId === '-1') return null
    return pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null
  } catch (e) {
    console.error(`❌ 無法抓取 ${slug} 的圖片:`, e.message)
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
        const imageUrl = await getWikiImage(item.wikiSlug)

        // 2. 存入 Appwrite
        await databases.createDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
          'discovery',
          item.date, // Document ID (MMDD)
          {
            title: item.title,
            content: item.content,
            link: item.link,
            imageUrl: imageUrl,
            wikiSlug: item.wikiSlug, // 存起來備用
          },
        )
        console.log(`✅ (圖片: ${imageUrl ? 'OK' : '無'})`)
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  已存在，跳過。`)
        } else {
          console.log(`❌ 錯誤: ${error.message}`)
        }
      }
    }
    console.log('\n🏁 所有資料匯入完成！')
  })
