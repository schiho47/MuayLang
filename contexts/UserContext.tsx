import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import {
  account,
  initializeSession,
  clearSessionToken,
  initializeJWT,
  clearJWTToken,
} from '../lib/appwrite'
import { router } from 'expo-router'
import { Platform } from 'react-native'
import { jwtStorage, guestStorage, sessionStorage } from '../utils/jwtStorage'
import { clearUserSession, saveUserSession } from '../lib/storage'
import { onAuthUnauthorized } from '@/lib/authEvents'

type User = {
  $id: string
  email: string
  name: string
  emailVerification: boolean
  isGuest?: boolean
} | null

type UserContextType = {
  user: User
  authChecked: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resendVerification: () => Promise<void>
  verifyEmail: (userId: string, secret: string) => Promise<void>
  loginAsGuest: () => Promise<void>
}

const DEMO_USER_ID = process.env.EXPO_PUBLIC_DEMO_USER_ID || 'guest-public'
export const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const isHandlingUnauthorizedRef = useRef(false)

  const logout = useCallback(async () => {
    try {
      await guestStorage.clearGuestMode()
      await account.deleteSession('current').catch(() => {})
    } finally {
      // 同時清理 JWT 與 Session
      await Promise.all([
        jwtStorage.removeToken(),
        sessionStorage.removeSession(),
        clearUserSession(),
      ])
      clearJWTToken()
      await clearSessionToken()
      setUser(null)
      setAuthChecked(true)
      router.replace('/(auth)/' as any)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const isGuestSession = await guestStorage.isGuestMode()

      // 1. 恢復本地狀態 (JWT + Session)
      await initializeJWT()
      await initializeSession()

      try {
        const currentUser = await account.get()
        await saveUserSession(currentUser)
        setUser(currentUser as any)
      } catch (apiError) {
        if (isGuestSession) {
          setUser({
            $id: DEMO_USER_ID,
            email: 'guest@muaylang.app',
            name: 'Guest',
            emailVerification: false,
            isGuest: true,
          })
        } else {
          throw apiError
        }
      }
    } catch (error) {
      setUser(null)
      // 防死循環：Web 端若在 auth 頁面則不重複跳轉
      if (Platform.OS !== 'web' || !window.location.pathname.includes('/auth')) {
        router.replace('/(auth)/' as any)
      }
    } finally {
      setAuthChecked(true)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 監聽全局 401，自動觸發登出或重定向
  useEffect(() => {
    const unsubscribe = onAuthUnauthorized(async () => {
      if (isHandlingUnauthorizedRef.current) return
      isHandlingUnauthorizedRef.current = true
      try {
        const isGuest = await guestStorage.isGuestMode()
        if (!isGuest) await logout()
      } finally {
        isHandlingUnauthorizedRef.current = false
      }
    })
    return unsubscribe
  }, [logout])

  const login = async (email: string, password: string) => {
    try {
      await guestStorage.clearGuestMode()
      await account.createEmailPasswordSession(email, password)

      // 登入後立即更新 User 狀態
      const currentUser = await account.get()
      await saveUserSession(currentUser)
      setUser(currentUser as any)
      router.replace('/(tabs)/' as any)
    } catch (error) {
      throw error
    }
  }

  // ... (register, resendVerification 邏輯保持原本樣式)

  return (
    <UserContext.Provider value={{ user, authChecked, login, logout /* ...其他 function */ }}>
      {children}
    </UserContext.Provider>
  )
}
