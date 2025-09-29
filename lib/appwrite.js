import { Account, Client, Databases, Storage } from 'react-native-appwrite'

export const client = new Client()
  .setProject('68600758001987d2867d')
  .setPlatform('dev.ho47.muaylang')

export const storage = new Storage(client)
export const account = new Account(client)
export const databases = new Databases(client)

// 資料庫和 Storage 設定
export const databaseId = '687217840008e6de6bc1'
export const storageBucketId = '688a21d1002e493634bb' // 請確認這是你的 bucket ID

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
