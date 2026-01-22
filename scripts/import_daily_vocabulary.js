require('dotenv').config()
const sdk = require('node-appwrite')
const fs = require('fs')
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

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID
const COLLECTION_ID = 'dailyvocabulary'

// 2. 讀取 JSON 檔案
const rawData = fs.readFileSync('daily_vocabulary.json')
const jsonData = JSON.parse(rawData)

async function importData() {
  console.log(`🚀 開始匯入 ${jsonData.length} 筆資料...`)

  for (const item of jsonData) {
    try {
      // 注意：words 必須轉為字串存入 Appwrite 的 String 欄位
      const documentData = {
        $id: item.date_id,
        topic: item.topic,
        tags: item.tags,
        words: JSON.stringify(item.words),
      }

      // 使用 date_id 作為 Document ID，這樣重複執行時會報錯，避免重複存入
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, item.date_id, documentData)

      console.log(`✅ [${item.date_id}] ${item.topic} 匯入成功`)
    } catch (error) {
      if (error.code === 409) {
        console.warn(`⚠️ [${item.date_id}] 資料已存在，跳過。`)
      } else {
        console.error(`❌ [${item.date_id}] 匯入失敗:`, error.message)
      }
    }
  }
  console.log('✨ 匯入程序結束')
}

importData()
