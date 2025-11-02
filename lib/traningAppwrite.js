import { databases, databaseId } from './appwrite'
import { ID, Query } from 'react-native-appwrite'

const trainingCollectId = '688a21d1002e493634bb'

export const getTraining = async (userId) => {
  console.log('🔍 getTraining - userId:', userId)

  // If no userId, return empty array instead of executing query
  if (!userId) {
    console.log('⚠️ getTraining - no userId provided, returning empty array')
    return []
  }

  try {
    // Step 1: Fetch all documents and sort
    const queries = [Query.orderDesc('$createdAt')]
    const res = await databases.listDocuments(databaseId, trainingCollectId, queries)
    console.log('🔍 getTraining - total documents:', res.documents.length)

    // Step 2: Filter on client side (temporary migration solution)
    // Include: belonging to current user OR has no userId (legacy data)
    const filtered = res.documents.filter((doc) => doc.userId === userId || !doc.userId)

    console.log('🔍 getTraining - filtered count:', filtered.length)
    console.log(
      '🔍 getTraining - sample userIds:',
      filtered.slice(0, 3).map((d) => d.userId || 'NO_USERID'),
    )

    return filtered
  } catch (error) {
    console.error('❌ getTraining error:', error)
    // Return empty array instead of throwing error to avoid blocking UI
    return []
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
