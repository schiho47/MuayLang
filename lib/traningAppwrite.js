import { databases, databaseId } from './appwrite'
import { ID, Query } from 'react-native-appwrite'

const trainingCollectId = '688a21d1002e493634bb'

export const getTraining = async (userId) => {
  console.log('🔍 getTraining - userId:', userId)

  try {
    // 第一步：先獲取所有文件並排序
    const queries = [Query.orderDesc('$createdAt')]
    const res = await databases.listDocuments(databaseId, trainingCollectId, queries)
    console.log('🔍 getTraining - total documents:', res.documents.length)

    // 第二步：在客戶端過濾（暫時的遷移方案）
    // 包含：屬於當前用戶的 OR 沒有 userId 的（舊資料）
    const filtered = userId
      ? res.documents.filter((doc) => doc.userId === userId || !doc.userId)
      : res.documents

    console.log('🔍 getTraining - filtered count:', filtered.length)
    console.log(
      '🔍 getTraining - sample userIds:',
      filtered.slice(0, 3).map((d) => d.userId || 'NO_USERID'),
    )

    return filtered
  } catch (error) {
    console.error('❌ getTraining error:', error)
    throw error
  }
}

export const createTraining = async (data) => {
  try {
    const res = await databases.createDocument(databaseId, trainingCollectId, ID.unique(), data)
    return { success: true, data: res }
  } catch (error) {
    return { success: false, error: error }
  }
}
export const getTrainingById = async (id) => {
  const res = await databases.getDocument(databaseId, trainingCollectId, id)
  return res
}
export const updateTraining = async (id, data) => {
  try {
    const res = await databases.updateDocument(databaseId, trainingCollectId, id, data)

    return { success: true, data: res }
  } catch (error) {
    return { success: false, error: error }
  }
}

export const deleteTraining = async (id) => {
  const res = await databases.deleteDocument(databaseId, trainingCollectId, id)
  return res
}
