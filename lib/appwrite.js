import { Client, Account, Databases, Query, ID, Storage } from 'react-native-appwrite'
import { Dialog } from 'react-native-paper'

export const client = new Client()
  .setProject('68600758001987d2867d')
  .setPlatform('dev.ho47.muaylang')
export const storage = new Storage(client)
export const account = new Account(client)

export const databases = new Databases(client)
export const databaseId = '687217840008e6de6bc1'
export const vocabulariesCollectId = '687217960026dea9e7f1'

// 添加 storage bucket ID
export const storageBucketId = '688a21d1002e493634bb' // 請確認這是你的 bucket ID

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

/**
 * 獲取圖片的預覽路徑
 * @param {string} fileId - 圖片的 file ID
 * @param {number} width - 預覽圖片寬度，預設 400
 * @param {number} height - 預覽圖片高度，預設 400
 * @param {string} gravity - 裁剪方式，預設 'center'
 * @param {number} quality - 圖片品質，預設 80
 * @param {string} border - 邊框，預設 '0'
 * @param {number} borderRadius - 圓角，預設 0
 * @param {number} opacity - 透明度，預設 1
 * @param {number} rotation - 旋轉角度，預設 0
 * @param {string} background - 背景色，預設 'white'
 * @param {string} output - 輸出格式，預設 'webp'
 * @returns {string} 圖片的預覽 URL
 */
export const getImagePreview = (
  fileId,
  width = 400,
  height = 400,
  gravity = 'center',
  quality = 80,
  border = '0',
  borderRadius = 0,
  opacity = 1,
  rotation = 0,
  background = 'white',
  output = 'webp'
) => {
  if (!fileId) return null

  const params = [
    `width=${width}`,
    `height=${height}`,
    `gravity=${gravity}`,
    `quality=${quality}`,
    `border=${border}`,
    `borderRadius=${borderRadius}`,
    `opacity=${opacity}`,
    `rotation=${rotation}`,
    `background=${background}`,
    `output=${output}`,
  ].join('&')

  return `${client.config.endpoint}/storage/buckets/${storageBucketId}/files/${fileId}/preview?${params}`
}

/**
 * 獲取圖片的原始路徑
 * @param {string} fileId - 圖片的 file ID
 * @returns {string} 圖片的原始 URL
 */
export const getImageUrl = (fileId) => {
  if (!fileId) return null
  return `${client.config.endpoint}/storage/buckets/${storageBucketId}/files/${fileId}/view`
}

/**
 * 批量獲取圖片預覽路徑
 * @param {string[]} fileIds - 圖片 ID 陣列
 * @param {object} options - 預覽選項
 * @returns {string[]} 圖片預覽 URL 陣列
 */
export const getMultipleImagePreviews = (fileIds, options = {}) => {
  if (!fileIds || !Array.isArray(fileIds)) return []

  return fileIds
    .filter((id) => id) // 過濾掉 null/undefined
    .map((fileId) =>
      getImagePreview(
        fileId,
        options.width,
        options.height,
        options.gravity,
        options.quality,
        options.border,
        options.borderRadius,
        options.opacity,
        options.rotation,
        options.background,
        options.output
      )
    )
}
