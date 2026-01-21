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
    const result = {id: res.documents[0].$id, topic: res.documents[0].topic, tags: res.documents[0].tags, words: JSON.parse(res.documents[0].words) ?? null}
    return result ?? null
  } catch (error) {
    console.error('❌ getDiscovery error:', error)
    return null
  }
}