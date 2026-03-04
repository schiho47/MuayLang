import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const JWT_TOKEN_KEY = 'muaylang_jwt_token'
const JWT_EXPIRY_KEY = 'muaylang_jwt_expiry'
const GUEST_MODE_KEY = 'muaylang_guest_mode'
const APPWRITE_SESSION_ID_KEY = 'muaylang_appwrite_session_id'
const APPWRITE_SESSION_EXPIRY_KEY = 'muaylang_appwrite_session_expiry'

/**
 * Cross-platform storage interface
 * Web: localStorage (fallback to in-memory if unavailable)
 * Native: AsyncStorage
 */
const memoryStore = new Map<string, string>()

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        try {
          return localStorage.getItem(key)
        } catch {
          return memoryStore.get(key) ?? null
        }
      }
      return null
    }
    return await AsyncStorage.getItem(key)
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(key, value)
        } catch {
          memoryStore.set(key, value)
        }
      }
      return
    }
    await AsyncStorage.setItem(key, value)
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(key)
        } catch {
          memoryStore.delete(key)
        }
      }
      return
    }
    await AsyncStorage.removeItem(key)
  },
}

/**
 * JWT Token Storage Utilities
 */
export const jwtStorage = {
  /**
   * Save JWT token and expiry time
   */
  saveToken: async (token: string, expiry?: number): Promise<void> => {
    await storage.setItem(JWT_TOKEN_KEY, token)
    if (expiry) {
      await storage.setItem(JWT_EXPIRY_KEY, expiry.toString())
    }
  },

  /**
   * Get stored JWT token
   */
  getToken: async (): Promise<string | null> => {
    return await storage.getItem(JWT_TOKEN_KEY)
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: async (): Promise<boolean> => {
    const expiryStr = await storage.getItem(JWT_EXPIRY_KEY)
    if (!expiryStr) return true

    const expiry = parseInt(expiryStr, 10)
    const now = Date.now()
    // Consider token expired if less than 5 minutes remaining
    return now >= expiry - 5 * 60 * 1000
  },

  /**
   * Get token expiry timestamp
   */
  getTokenExpiry: async (): Promise<number | null> => {
    const expiryStr = await storage.getItem(JWT_EXPIRY_KEY)
    return expiryStr ? parseInt(expiryStr, 10) : null
  },

  /**
   * Remove JWT token and expiry
   */
  removeToken: async (): Promise<void> => {
    await storage.removeItem(JWT_TOKEN_KEY)
    await storage.removeItem(JWT_EXPIRY_KEY)
  },

  /**
   * Check if token exists and is valid
   */
  hasValidToken: async (): Promise<boolean> => {
    const token = await jwtStorage.getToken()
    if (!token) return false

    const isExpired = await jwtStorage.isTokenExpired()
    return !isExpired
  },
}

/**
 * Guest mode storage utilities
 */
export const guestStorage = {
  setGuestMode: async (isGuest: boolean): Promise<void> => {
    if (isGuest) {
      await storage.setItem(GUEST_MODE_KEY, 'true')
    } else {
      await storage.removeItem(GUEST_MODE_KEY)
    }
  },

  isGuestMode: async (): Promise<boolean> => {
    const value = await storage.getItem(GUEST_MODE_KEY)
    return value === 'true'
  },

  clearGuestMode: async (): Promise<void> => {
    await storage.removeItem(GUEST_MODE_KEY)
  },
}

/**
 * Appwrite Session Storage Utilities
 * Used with react-native-appwrite `client.setSession(sessionId)` for stable auth on web (Safari)
 */
export const sessionStorage = {
  saveSession: async (sessionId: string, expiryIso?: string): Promise<void> => {
    await storage.setItem(APPWRITE_SESSION_ID_KEY, sessionId)
    if (expiryIso) {
      const ms = Date.parse(expiryIso)
      if (Number.isFinite(ms)) {
        await storage.setItem(APPWRITE_SESSION_EXPIRY_KEY, String(ms))
      }
    }
  },

  getSessionId: async (): Promise<string | null> => {
    return await storage.getItem(APPWRITE_SESSION_ID_KEY)
  },

  isSessionExpired: async (): Promise<boolean> => {
    const expiryStr = await storage.getItem(APPWRITE_SESSION_EXPIRY_KEY)
    if (!expiryStr) return false // unknown => treat as potentially valid
    const expiry = parseInt(expiryStr, 10)
    if (!Number.isFinite(expiry)) return false
    const now = Date.now()
    // Consider expired if less than 2 minutes remaining
    return now >= expiry - 2 * 60 * 1000
  },

  removeSession: async (): Promise<void> => {
    await storage.removeItem(APPWRITE_SESSION_ID_KEY)
    await storage.removeItem(APPWRITE_SESSION_EXPIRY_KEY)
  },
}
