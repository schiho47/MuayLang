import { databases, databaseId, withJWTRefresh } from './appwrite'
import { ID, Query } from 'react-native-appwrite'

const trainingCollectId = '688a21d1002e493634bb'

export const getTraining = async (userId) => {
  console.log('🔍 getTraining - userId:', userId)

  try {
    // Fetch documents for current user only
    // Sort by training date (latest first)
    const queries = [Query.orderDesc('date'), Query.limit(100)]
    if (userId) {
      queries.unshift(Query.equal('userId', userId))
    }

    const res = await withJWTRefresh(() =>
      databases.listDocuments(databaseId, trainingCollectId, queries),
    )
    console.log('🔍 getTraining - total documents:', res.documents.length)

    return res.documents
  } catch (error) {
    console.error('❌ getTraining error:', error)
    // Propagate errors so cached data isn't overwritten on failed requests
    throw error
  }
}

export const createTraining = async (data) => {
  try {
    const res = await withJWTRefresh(() =>
      databases.createDocument(databaseId, trainingCollectId, ID.unique(), data),
    )
    return { success: true, data: res }
  } catch (error) {
    return { success: false, error: error }
  }
}
export const getTrainingById = async (id) => {
  const res = await withJWTRefresh(() => databases.getDocument(databaseId, trainingCollectId, id))
  return res
}
export const updateTraining = async (id, data) => {
  try {
    const res = await withJWTRefresh(() =>
      databases.updateDocument(databaseId, trainingCollectId, id, data),
    )

    return { success: true, data: res }
  } catch (error) {
    return { success: false, error: error }
  }
}

export const deleteTraining = async (id) => {
  const res = await databases.deleteDocument(databaseId, trainingCollectId, id)
  return res
}
