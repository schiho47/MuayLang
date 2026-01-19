import { ID, Query } from 'react-native-appwrite'
import { databaseId, databases, withJWTRefresh } from './appwrite'

// Vocabulary-related Collection ID
export const vocabulariesCollectId = '687217960026dea9e7f1'

// Wrapped create function
export const createVocabulary = async (data) => {
  console.log('🚀 createVocabulary called')
  console.log('📦 Data to save:', JSON.stringify(data, null, 2))
  console.log('📦 Database ID:', databaseId)
  console.log('📦 Collection ID:', vocabulariesCollectId)

  try {
    const res = await withJWTRefresh(() =>
      databases.createDocument(databaseId, vocabulariesCollectId, ID.unique(), data),
    )
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
    const res = await withJWTRefresh(() =>
      databases.updateDocument(databaseId, vocabulariesCollectId, id, data),
    )
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

    const queries = []
    if (userId) {
      queries.push(Query.equal('userId', userId))
    }
    queries.push(Query.limit(100))

    const res = await withJWTRefresh(() =>
      databases.listDocuments(databaseId, vocabulariesCollectId, queries),
    )
    console.log('🔍 getAllVocabularies - total documents:', res.documents.length)

    return res.documents
  } catch (error) {
    console.error('❌ getAllVocabularies error:', error)
    // Return empty array instead of throwing error to avoid blocking UI
    return []
  }
}

export const getVocabularyById = async (id) => {
  try {
    const res = await withJWTRefresh(() =>
      databases.getDocument(databaseId, vocabulariesCollectId, id),
    )
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
    const res = await withJWTRefresh(() =>
      databases.listDocuments(databaseId, vocabulariesCollectId, queries),
    )
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
