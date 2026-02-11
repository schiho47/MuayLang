import { Query } from 'react-native-appwrite'
import { databaseId, databases } from './appwrite'

// Vocabulary-related Collection ID
export const dailyVocabularyCollectId = 'dailyvocabulary'

export const getDailyVocabulary = async (id) => {
  try {
    if (!id) {
      console.warn('⚠️ getDailyVocabulary called without id')
      return null
    }

    const res = await databases.listDocuments(databaseId, dailyVocabularyCollectId, [
      Query.equal('$id', id),
      Query.limit(100),
    ])
    const result = {
      id: res.documents[0].$id,
      topic: res.documents[0].topic,
      tags: res.documents[0].tags,
      words: JSON.parse(res.documents[0].words) ?? null,
    }
    return result ?? null
  } catch (error) {
    if (error?.code === 401) {
      throw error
    }
    console.error('❌ getDailyVocabulary error:', error)
    return null
  }
}
/**
 * 將按天存放的 vocabularyData 攤平成單一單字陣列
 * @param {Array} daysData - 從 Appwrite 抓回來的原始陣列 (包含多天的 vocabularyData)
 */
const flattenVocabularyData = (daysData) => {
  return daysData.flatMap((day) => {
    // 針對每一天的 words 陣列進行 map
    return day.words.map((wordObj) => ({
      ...wordObj, // 保留原始單字內容 (th, word, roman, tw_h...)
      dayId: day.id, // 注入該天的 ID (例如 "0123")
      tags: day.tags, // 注入標籤 (例如 "Entertainment")
    }))
  })
}
export const getQuizDateData = async (id) => {
  try {
    if (!id || id.length === 0) {
      console.warn('⚠️ getQuizDateData called without ids')
      return []
    }

    const res = await databases.listDocuments(databaseId, dailyVocabularyCollectId, [
      Query.equal('$id', id),
      Query.limit(id.length),
    ])

    const daysData = res.documents.map((doc) => ({
      id: doc.$id,
      topic: doc.topic,
      tags: doc.tags,
      words: JSON.parse(doc.words) ?? [],
    }))

    return flattenVocabularyData(daysData)
  } catch (error) {
    console.error('❌ getQuizDateData error:', error)
    return []
  }
}
