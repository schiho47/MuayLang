import { Account, Client, Databases, Storage } from 'react-native-appwrite'
import { Platform } from 'react-native'
import { jwtStorage, sessionStorage } from '../utils/jwtStorage'
import { emitAuthUnauthorized } from './authEvents'

// --- 1. 配置與 Endpoint 解析 ---
const isWeb = Platform.OS === 'web'

// 強制對齊：Web 端必須用 api. 子網域來解決 Safari ITP 的 Same-site Cookie 問題
// 原生 App 則視環境變數設定，預設也指向 api. 以保持一致
export const APPWRITE_ENDPOINT = isWeb
  ? 'https://api.muaylang.app/v1'
  : process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT_NATIVE || 'https://api.muaylang.app/v1'

export const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID

export const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID)

/**
 * ⚠️ 修正 403 關鍵：
 * Web 端絕對不要 setPlatform(window.location.origin)，這會讓 Appwrite 判定為非法來源
 */
if (!isWeb) {
  client.setPlatform('dev.ho47.muaylang')
}

// --- 2. Session 與 JWT 管理 ---

/**
 * 恢復 Session：對 Web 來說是檢查 Cookie，對 Native 來說是從 Storage 恢復
 */
export const initializeSession = async () => {
  try {
    const sessionId = await sessionStorage.getSessionId()
    if (!sessionId) return false

    const expired = await sessionStorage.isSessionExpired()
    if (expired) {
      await sessionStorage.removeSession()
      client.setSession('')
      return false
    }

    // 在 Native 環境這行是必須的
    client.setSession(sessionId)
    return true
  } catch (error) {
    console.error('❌ Failed to initialize session:', error)
    return false
  }
}

export const setSessionToken = async (sessionId, expiryIso) => {
  client.setSession(sessionId)
  await sessionStorage.saveSession(sessionId, expiryIso)
}

export const clearSessionToken = async () => {
  client.setSession('')
  await sessionStorage.removeSession()
}

// 保留 JWT 邏輯（雖然 Web 建議靠 Cookie，但保留你的 Storage 實作）
export const initializeJWT = async () => {
  try {
    const token = await jwtStorage.getToken()
    const isExpired = await jwtStorage.isTokenExpired()
    if (token && !isExpired) {
      client.setJWT(token)
      return true
    }
    return false
  } catch {
    return false
  }
}

export const setJWTToken = (token) => client.setJWT(token)
export const clearJWTToken = () => client.setJWT('')

// --- 3. 服務實例 ---
export const storage = new Storage(client)
export const account = new Account(client)
export const databases = new Databases(client)

export const databaseId = '687217840008e6de6bc1'
// Storage bucket for training photos (must NOT be collection id)
export const storageBucketId = '688a236a003d47152b16'

/**
 * 異常攔截：處理 Safari 常見的 missing scopes 錯誤
 */
export const withJWTRefresh = async (operation) => {
  try {
    return await operation()
  } catch (error) {
    const message = String(error?.message ?? '')
    const code = error?.code ?? error?.response?.status
    const isUnauthorized =
      code === 401 || message.includes('missing scopes') || message.includes('role: guests')

    if (isUnauthorized) {
      emitAuthUnauthorized(error)
    }
    throw error
  }
}

// --- 4. 圖片處理工具 (完整保留並修正 Endpoint 引用) ---

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
  output = 'webp',
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

  // 統一使用 APPWRITE_ENDPOINT 避免跨域混亂
  return `${APPWRITE_ENDPOINT}/storage/buckets/${storageBucketId}/files/${fileId}/preview?${params}`
}

export const getImageUrl = (fileId) => {
  if (!fileId) return null
  return `${APPWRITE_ENDPOINT}/storage/buckets/${storageBucketId}/files/${fileId}/view`
}

export const getMultipleImagePreviews = (fileIds, options = {}) => {
  if (!fileIds || !Array.isArray(fileIds)) return []
  return fileIds
    .filter((id) => id)
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
        options.output,
      ),
    )
}
