import { Account, Client, Databases, Storage } from 'react-native-appwrite'
import { Platform } from 'react-native'
import { jwtStorage } from '../utils/jwtStorage'

export const client = new Client()
  // Required: Set API endpoint (Appwrite Cloud)
  .setEndpoint('https://cloud.appwrite.io/v1')
  // Required: Your Project ID
  .setProject('68600758001987d2867d')

// Set different Platform ID based on platform
if (Platform.OS === 'web') {
  // Web version: Set Platform based on current domain
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    client.setPlatform(window.location.origin) // e.g., https://muay-lang.vercel.app
  } else {
    client.setPlatform('dev.ho47.muaylang') // RN native
  }
} else {
  // React Native app identifier (must match Platform setting in Appwrite console)
  client.setPlatform('dev.ho47.muaylang')
}

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
export const setJWTToken = (token: string) => {
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

  return `${client.config.endpoint}/storage/buckets/${storageBucketId}/files/${fileId}/preview?${params}`
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
