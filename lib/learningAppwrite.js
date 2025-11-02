import { ID, Query } from 'react-native-appwrite'
import { databaseId, databases } from './appwrite'

// Vocabulary-related Collection ID
export const vocabulariesCollectId = '687217960026dea9e7f1'

// Wrapped create function
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
  // If no userId, return empty array instead of executing query
  if (!userId) {
    console.log('⚠️ getAllVocabularies - no userId provided, returning empty array')
    return []
  }

  try {
    console.log('🔍 getAllVocabularies - userId:', userId)

    // Step 1: Fetch all documents first
    const res = await databases.listDocuments(databaseId, vocabulariesCollectId)
    console.log('🔍 getAllVocabularies - total documents:', res.documents.length)

    // Debug: Log all unique userIds in vocabulary collection
    const allUserIds = [...new Set(res.documents.map((d) => d.userId || 'NO_USERID'))]
    console.log('🔍 getAllVocabularies - all unique userIds:', allUserIds)

    // Step 2: Filter on client side (temporary migration solution)
    // Include: belonging to current user OR has no userId (legacy data)
    const filtered = res.documents.filter((doc) => doc.userId === userId || !doc.userId)

    console.log('🔍 getAllVocabularies - filtered count:', filtered.length)
    console.log(
      '🔍 getAllVocabularies - sample userIds:',
      filtered.slice(0, 3).map((d) => d.userId || 'NO_USERID'),
    )

    return filtered
  } catch (error) {
    console.error('❌ getAllVocabularies error:', error)
    // Return empty array instead of throwing error to avoid blocking UI
    return []
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

  // User ID filter - Most important!
  if (userId) {
    queries.push(Query.equal('userId', userId))
  }

  // Vocabulary id: only add if has value
  if (filter.vocabulary) {
    queries.push(Query.equal('$id', filter.vocabulary))
  }

  // Time range: only add when createdAt is [start, end] array with values
  if (filter.createdAt?.[0]) {
    // Convert to ISO string
    queries.push(Query.greaterThanEqual('$createdAt', filter.createdAt[0]))
  }
  if (filter.createdAt?.[1]) {
    queries.push(Query.lessThanEqual('$createdAt', filter.createdAt[1]))
  }

  // tags: only add if has value
  if (filter.tags && filter.tags.length > 0) {
    queries.push(Query.contains('tags', filter.tags))
    queries.push(Query.isNotNull('tags'))
    // Or tags[0] to query single tag
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

// Test function - can be removed or moved to test file
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
