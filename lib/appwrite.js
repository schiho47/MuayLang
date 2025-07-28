import { Client, Account, Databases, Query, ID } from 'react-native-appwrite'
import { Dialog } from 'react-native-paper'

export const client = new Client()
  .setProject('68600758001987d2867d')
  .setPlatform('dev.ho47.muaylang')

export const account = new Account(client)

export const databases = new Databases(client)
const databaseId = '687217840008e6de6bc1'
const vocabulariesCollectId = '687217960026dea9e7f1'

let promise = databases.listDocuments(databaseId, vocabulariesCollectId, [
  Query.equal('title', 'Hamlet'),
])

promise.then(
  function (response) {
    console.log(response)
  },
  function (error) {
    console.log(error)
  }
)

// 封裝 create function
export const createVocabulary = async (data) => {
  try {
    const res = await databases.createDocument(databaseId, vocabulariesCollectId, ID.unique(), data)
    return { success: true, data: res }
  } catch (error) {
    return { success: false, error: error }
  }
}

export const updateVocabulary = async (id, data, options) => {
  console.log({ id, data })
  try {
    const res = await databases.updateDocument(databaseId, vocabulariesCollectId, id, data)
    console.log({ updateVocabulary: res })
    options?.onSettled?.()
    return { success: true, data: res }
  } catch (error) {
    console.log({ updateVocabularyError: error })
    Dialog.alert({
      title: 'Error',
      message: error.message,
    })
    return { success: false, error: error }
  }
}
export const getAllVocabularies = async () => {
  try {
    const res = await databases.listDocuments(databaseId, vocabulariesCollectId)
    return res.documents
  } catch (error) {
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

export const getVocabularyByFilter = async (filter) => {
  const queries = []

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
