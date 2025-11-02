import { storage } from '@/lib/appwrite'
import { ID, Permission, Role } from 'react-native-appwrite'
const bucketId = '688a236a003d47152b16'
const permission = [Permission.read(Role.any()), Permission.write(Role.any())]
export async function uploadPhoto(uri: string): Promise<string> {
  try {
    console.log('Found uri:', uri)
    const response = await fetch(uri)
    const blob = await response.blob()
    console.log({ response, blob })

    const fileId = ID.unique()
    const fileName = `photo-${fileId}.jpg`
    const fileData = {
      uri,
      name: fileName,
      type: 'image/jpeg', // Or determine extension from mime library
      size: 0, // Appwrite doesn't check size, can set to 0
    }
    const file = await storage.createFile(bucketId, fileId, fileData, permission)
    console.log('✅ Found file:', file)

    return file.$id
  } catch (error) {
    console.error('❌ Upload error:', error)
    throw error // Or return ''
  }
}

export const getPhotoUrl = (fileId: string) => {
  return `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=68600758001987d2867d`
}
