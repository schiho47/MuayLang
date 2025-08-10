import { databases, databaseId } from './appwrite'
import { ID, Query } from 'react-native-appwrite'

const trainingCollectId = '688a21d1002e493634bb'

export const getTraining = async () => {
  const res = await databases.listDocuments(databaseId, trainingCollectId, [
    Query.orderDesc('$createdAt'),
  ])
  return res.documents
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
