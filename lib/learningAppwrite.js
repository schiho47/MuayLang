import { ID, Query } from 'react-native-appwrite'
import { databaseId, databases } from './appwrite'

// 詞彙相關的 Collection ID
export const vocabulariesCollectId = '687217960026dea9e7f1'

// 封裝 create function
export const createVocabulary = async (data) => {
  console.log('🚀 createVocabulary called')
  console.log('📦 Data to save:', JSON.stringify(data, null, 2))
  console.log('📦 Database ID:', databaseId)
  console.log('📦 Collection ID:', vocabulariesCollectId)

  try {
    const res = await databases.createDocument(databaseId, vocabulariesCollectId, ID.unique(), data)
    console.log('✅ Document created successfully!')
    console.log('✅ Created document:', res)
    return { success: true, data: res }
  } catch (error) {
    console.error('❌ createVocabulary FAILED!')
    console.error('❌ Error:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error code:', error.code)
    console.error('❌ Error type:', error.type)
    return { success: false, error: error }
  }
}

export const updateVocabulary = async (params) => {
  const { id, data } = params
  console.log('📝 Updating vocabulary:', { id, data })
  try {
    const res = await databases.updateDocument(databaseId, vocabulariesCollectId, id, data)
    console.log('✅ Vocabulary updated successfully:', res)
    return res
  } catch (error) {
    console.error('❌ updateVocabulary error:', error)
    throw error
  }
}

export const getAllVocabularies = async (userId) => {
  try {
    console.log('🔍 getAllVocabularies - userId:', userId)

    // 第一步：先獲取所有文件
    const res = await databases.listDocuments(databaseId, vocabulariesCollectId)
    console.log('🔍 getAllVocabularies - total documents:', res.documents.length)

    // 第二步：在客戶端過濾（暫時的遷移方案）
    // 包含：屬於當前用戶的 OR 沒有 userId 的（舊資料）
    const filtered = userId
      ? res.documents.filter((doc) => doc.userId === userId || !doc.userId)
      : res.documents

    console.log('🔍 getAllVocabularies - filtered count:', filtered.length)
    console.log(
      '🔍 getAllVocabularies - sample userIds:',
      filtered.slice(0, 3).map((d) => d.userId || 'NO_USERID'),
    )

    return filtered
  } catch (error) {
    console.error('❌ getAllVocabularies error:', error)
    throw error
  }
}

export const getVocabularyById = async (id) => {
  try {
    const res = await databases.getDocument(databaseId, vocabulariesCollectId, id)
    return res
  } catch (error) {
    return error
  }
}

export const getVocabularyByFilter = async (filter, userId) => {
  const queries = []

  // 用戶 ID 過濾 - 最重要！
  if (userId) {
    queries.push(Query.equal('userId', userId))
  }

  // 單字 id：要有值才加
  if (filter.vocabulary) {
    queries.push(Query.equal('$id', filter.vocabulary))
  }

  // 時間區間：只有在 createdAt 是 [start, end] 這種陣列且有值時才加
  if (filter.createdAt?.[0]) {
    // 轉成 ISO 字串
    queries.push(Query.greaterThanEqual('$createdAt', filter.createdAt[0]))
  }
  if (filter.createdAt?.[1]) {
    queries.push(Query.lessThanEqual('$createdAt', filter.createdAt[1]))
  }

  // tags：要有值才加
  if (filter.tags && filter.tags.length > 0) {
    queries.push(Query.contains('tags', filter.tags))
    queries.push(Query.isNotNull('tags'))
    // 或 tags[0] 只查一個 tag
  }

  try {
    const res = await databases.listDocuments(databaseId, vocabulariesCollectId, queries)
    console.log({ res: res.documents })
    return res.documents
  } catch (error) {
    console.log({ error })
    return error
  }
}

// 測試函數 - 可以考慮移除或移動到測試檔案
export const testVocabularyQuery = async () => {
  let promise = databases.listDocuments(databaseId, vocabulariesCollectId, [
    Query.equal('title', 'Hamlet'),
  ])

  promise.then(
    function (response) {
      console.log(response)
    },
    function (error) {
      console.log(error)
    },
  )
}
