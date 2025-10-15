import { storage } from '@/lib/appwrite'
import { ID, Permission, Role } from 'react-native-appwrite'
const bucketId = '688a236a003d47152b16'
const permission = [Permission.read(Role.any()), Permission.write(Role.any())]
export async function uploadPhoto(uri: string): Promise<string> {
  try {
    console.log('找uri', uri)
    const response = await fetch(uri)
    const blob = await response.blob()
    console.log({ response, blob })

    const fileId = ID.unique()
    const fileName = `photo-${fileId}.jpg`
    const fileData = {
      uri,
      name: fileName,
      type: 'image/jpeg', // 或從 mime 庫判斷副檔名
      size: 0, // Appwrite 不檢查 size，可以給 0
    }
    const file = await storage.createFile(bucketId, fileId, fileData, permission)
    console.log('✅ 找到 file:', file)

    return file.$id
  } catch (error) {
    console.error('❌ 上傳錯誤:', error)
    throw error // 或 return ''
  }
}

export const getPhotoUrl = (fileId: string) => {
  return `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=68600758001987d2867d`
}
