import { Client, Account, Databases, Query, ID } from 'react-native-appwrite'

export const client = new Client()
  .setProject('68600758001987d2867d')
  .setPlatform('dev.ho47.muaylang')

export const account = new Account(client)

const databases = new Databases(client)
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
    console.log({ getVocabularyById: res })
    return res
  } catch (error) {
    return error
  }
}

export const getVocabularyByFilter = async (filter) => {
  try {
    const res = await databases.listDocuments(databaseId, vocabulariesCollectId, [
      Query.equal('$id', [yourId]),
      Query.greaterThan('$createdAt', '2024-07-01T00:00:00.000+00:00'), // ISO 字串
      Query.contains('tag', 'sports'), // 假設 tag 是 array
    ])
    return res
  } catch (error) {
    return error
  }
}

// export const getVocabularyTagList = async () => {
//   try {
//     const res = await databases.listDocuments(databaseId, vocabulariesCollectId, [
//       Query.distinct('tag'),
//     ])
//     console.log({ res })
//     return res
//   } catch (error) {
//     return error
//   }
// }
