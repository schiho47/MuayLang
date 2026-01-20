import { Query } from 'react-native-appwrite'
import { databaseId, databases } from './appwrite'

// Vocabulary-related Collection ID
export const discoveryCollectId = 'discovery'

export const getDiscovery = async (id) => {
  try {
    if (!id) {
      console.warn('⚠️ getDiscovery called without id')
      return []
    }

    const res = await databases.listDocuments(databaseId, discoveryCollectId, [
      Query.equal('$id', id),
      Query.limit(100),
    ])
    return res.documents
  } catch (error) {
    console.error('❌ getDiscovery error:', error)
    return []
  }
}