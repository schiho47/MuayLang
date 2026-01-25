import { account, clearJWTToken } from '@/lib/appwrite'
import { jwtStorage, guestStorage } from '@/utils/jwtStorage'
import { clearUserSession } from '@/lib/storage'

export const forceLogout = async () => {
  try {
    await guestStorage.clearGuestMode()
    try {
      await account.deleteSession('current')
    } catch {
      // Ignore session deletion errors
    }
  } finally {
    await jwtStorage.removeToken()
    clearJWTToken()
    await clearUserSession()
  }
}
