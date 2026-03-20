import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, storage, storageBucketId } from '@/lib/appwrite'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { ID, Permission, Role } from 'react-native-appwrite'

const bucketId = storageBucketId
const permission = [Permission.read(Role.any()), Permission.write(Role.any())]

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.75

const compressToJpeg = async (uri: string): Promise<string> => {
  try {
    // 1) Re-encode to JPEG (no resize) to ensure predictable format/size.
    let result = await manipulateAsync(uri, [], {
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
    })

    // 2) If still large in dimensions, resize the longer side.
    const maxDim = Math.max(result.width ?? 0, result.height ?? 0)
    if (maxDim > MAX_DIMENSION) {
      const resize =
        (result.width ?? 0) >= (result.height ?? 0)
          ? { width: MAX_DIMENSION }
          : { height: MAX_DIMENSION }

      result = await manipulateAsync(result.uri, [{ resize }], {
        compress: JPEG_QUALITY,
        format: SaveFormat.JPEG,
      })
    }

    return result.uri
  } catch {
    // If compression fails (rare platform issues), fall back to original URI.
    return uri
  }
}

export async function uploadPhoto(uri: string): Promise<string> {
  try {
    const compressedUri = await compressToJpeg(uri)
    const fileId = ID.unique()
    const fileName = `photo-${fileId}.jpg`
    const fileData = {
      uri: compressedUri,
      name: fileName,
      type: 'image/jpeg',
      size: 0,
    }
    const file = await storage.createFile(bucketId, fileId, fileData, permission)
    return file.$id
  } catch (error) {
    console.error('❌ Upload error:', error)
    throw error
  }
}

const requireConfig = () => {
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    console.warn('[photos] Missing APPWRITE endpoint or project id')
  }
}

export const getPhotoViewUrl = (fileId: string) => {
  requireConfig()
  if (!fileId) return ''
  return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`
}

export const getPhotoPreviewUrl = (fileId: string, width = 400, height = 400) => {
  requireConfig()
  if (!fileId) return ''
  // Appwrite Cloud may block image transformations (preview endpoint) on some plans.
  // To keep photos working everywhere, fall back to the original file view URL.
  void width
  void height
  return getPhotoViewUrl(fileId)
}

// Back-compat
export const getPhotoUrl = getPhotoViewUrl
