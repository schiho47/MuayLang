import { Account, Client, Databases, Storage } from 'react-native-appwrite'
import { Platform } from 'react-native'
import { jwtStorage } from '../utils/jwtStorage'
import { emitAuthUnauthorized } from './authEvents'

// For Appwrite 
const DEFAULT_APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1'
const isWeb = Platform.OS === 'web'
const PUBLIC_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT
const WEB_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT_WEB
const NATIVE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT_NATIVE

const DEFAULT_NATIVE_ENDPOINT = 'https://api.muaylang.app/v1'

const resolveEndpoint = () => {
  if (isWeb) {
    // IMPORTANT: If you point web to a custom domain (e.g. api.muaylang.app),
    // that domain must return proper CORS headers for https://www.muaylang.app
    // or the browser will block requests.
    if (WEB_ENDPOINT) return WEB_ENDPOINT

    // Back-compat: if a single endpoint is configured but it's the native API domain,
    // don't use it on web unless you intentionally configured CORS.
    if (PUBLIC_ENDPOINT && PUBLIC_ENDPOINT.includes('api.muaylang.app')) {
      console.warn(
        '[Appwrite] EXPO_PUBLIC_APPWRITE_ENDPOINT points to api.muaylang.app; using cloud endpoint on web to avoid CORS. Set EXPO_PUBLIC_APPWRITE_ENDPOINT_WEB to override.',
      )
      return DEFAULT_APPWRITE_ENDPOINT
    }

    return PUBLIC_ENDPOINT || DEFAULT_APPWRITE_ENDPOINT
  }

  return NATIVE_ENDPOINT || PUBLIC_ENDPOINT || DEFAULT_NATIVE_ENDPOINT
}

export const APPWRITE_ENDPOINT = resolveEndpoint()

console.log('Final Appwrite Endpoint Check:', APPWRITE_ENDPOINT)

export const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID
export const client = new Client()
  // Required: Set API endpoint (Appwrite Cloud)
  .setEndpoint(APPWRITE_ENDPOINT)
  // Required: Your Project ID
  .setProject(APPWRITE_PROJECT_ID)

// Set Platform ID based on platform
const platformId = (() => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.location.origin : 'https://muaylang.app'
  }
  return 'dev.ho47.muaylang';
})();
client.setPlatform(platformId)

/**
 * Initialize JWT token from storage
 * This should be called on app startup to restore authentication
 */
export const initializeJWT = async () => {
  try {
    const token = await jwtStorage.getToken()
    const isExpired = await jwtStorage.isTokenExpired()
    
    if (token && !isExpired) {
      client.setJWT(token)
      console.log('✅ JWT token restored from storage')
      return true
    } else if (token && isExpired) {
      // Token expired, remove it
      await jwtStorage.removeToken()
      console.log('⚠️ JWT token expired, removed from storage')
      return false
    }
    return false
  } catch (error) {
    console.error('❌ Failed to initialize JWT:', error)
    return false
  }
}

/**
 * Set JWT token for the client
 */
export const setJWTToken = (token) => {
  client.setJWT(token)
}

/**
 * Clear JWT token from the client
 */
export const clearJWTToken = () => {
  client.setJWT('')
}

export const storage = new Storage(client)
export const account = new Account(client)
export const databases = new Databases(client)

/**
 * Retry Appwrite operation once after refreshing JWT on 401.
 */
export const withJWTRefresh = async (operation) => {
  try {
    return await operation()
  } catch (error) {
    const message = String(error?.message ?? '')
    const code = error?.code ?? error?.response?.status
    const isUnauthorized =
      code === 401 ||
      message.includes('missing scopes') ||
      message.includes('role: guests') ||
      message.toLowerCase().includes('unauthorized')

    if (isUnauthorized) {
      emitAuthUnauthorized(error)
    }

    throw error
  }
}

// Database and Storage configuration
export const databaseId = '687217840008e6de6bc1'
export const storageBucketId = '688a21d1002e493634bb' // Confirm this is your bucket ID

/**
 * Get image preview path
 * @param {string} fileId - Image file ID
 * @param {number} width - Preview image width, default 400
 * @param {number} height - Preview image height, default 400
 * @param {string} gravity - Crop method, default 'center'
 * @param {number} quality - Image quality, default 80
 * @param {string} border - Border, default '0'
 * @param {number} borderRadius - Border radius, default 0
 * @param {number} opacity - Opacity, default 1
 * @param {number} rotation - Rotation angle, default 0
 * @param {string} background - Background color, default 'white'
 * @param {string} output - Output format, default 'webp'
 * @returns {string} Image preview URL
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

  return `${APPWRITE_ENDPOINT}/storage/buckets/${storageBucketId}/files/${fileId}/preview?${params}`
}

/**
 * Get original image path
 * @param {string} fileId - Image file ID
 * @returns {string} Original image URL
 */
export const getImageUrl = (fileId) => {
  if (!fileId) return null
  return `${client.config.endpoint}/storage/buckets/${storageBucketId}/files/${fileId}/view`
}

/**
 * Get multiple image preview paths
 * @param {string[]} fileIds - Array of image IDs
 * @param {object} options - Preview options
 * @returns {string[]} Array of image preview URLs
 */
export const getMultipleImagePreviews = (fileIds, options = {}) => {
  if (!fileIds || !Array.isArray(fileIds)) return []

  return fileIds
    .filter((id) => id) // Filter out null/undefined
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
