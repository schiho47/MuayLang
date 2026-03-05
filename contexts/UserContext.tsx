import React, { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  account,
  clearJWTToken,
  clearSessionToken,
  initializeJWT,
  initializeSession,
  setSessionToken,
} from '../lib/appwrite'
import { router } from 'expo-router'
import { AppState, Platform } from 'react-native'
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

  const loginAsGuest = useCallback(async () => {
    // Guest = local flag only (no account scope)
    await guestStorage.setGuestMode(true)
    await Promise.all([jwtStorage.removeToken(), sessionStorage.removeSession(), clearUserSession()])
    clearJWTToken()
    await clearSessionToken()

    setUser({
      $id: DEMO_USER_ID,
      email: 'guest@muaylang.app',
      name: 'Guest',
      emailVerification: false,
      isGuest: true,
    })
    setAuthChecked(true)
    router.replace('/(tabs)/' as any)
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
        await guestStorage.clearGuestMode()
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
          setUser(null)
          router.replace('/(auth)/' as any)
        }
      }
    } catch (error) {
      setUser(null)
      router.replace('/(auth)/' as any)
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
    await guestStorage.clearGuestMode()

    // Best-effort clean old session first
    try {
      await account.deleteSession('current')
    } catch {}
    await Promise.all([jwtStorage.removeToken(), sessionStorage.removeSession(), clearUserSession()])
    clearJWTToken()
    await clearSessionToken()

    const session = await account.createEmailPasswordSession(email, password)
    await setSessionToken(session.$id, session.expire)

    const currentUser = await account.get()
    await saveUserSession(currentUser)
    setUser(currentUser as any)
    router.replace('/(tabs)/' as any)
  }

  const register = async (email: string, password: string) => {
    await guestStorage.clearGuestMode()
    try {
      await account.deleteSession('current')
    } catch {}
    await Promise.all([jwtStorage.removeToken(), sessionStorage.removeSession(), clearUserSession()])
    clearJWTToken()
    await clearSessionToken()

    await account.create('unique()', email, password)
    const session = await account.createEmailPasswordSession(email, password)
    await setSessionToken(session.$id, session.expire)

    const currentUser = await account.get()
    await saveUserSession(currentUser)
    setUser(currentUser as any)
    router.replace('/(tabs)/' as any)
  }

  const resendVerification = async () => {
    const verificationUrl =
      Platform.OS === 'web'
        ? `${typeof window !== 'undefined' ? window.location.origin : 'https://muaylang.app'}/verify`
        : 'exp://localhost:8081'
    await account.createVerification(verificationUrl)
  }

  const verifyEmail = async (userId: string, secret: string) => {
    await account.updateVerification(userId, secret)
    const currentUser = await account.get()
    setUser(currentUser as any)
  }

  // Keep session alive (helps with “time passes then becomes guest”)
  useEffect(() => {
    if (!user || user.isGuest) return

    let isActive = true
    const refresh = async () => {
      try {
        const updated = await account.updateSession('current')
        if (!isActive) return
        await setSessionToken(updated.$id, updated.expire)
      } catch {
        // ignore; global handler will deal with unauthorized
      }
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh()
    })
    const id = setInterval(refresh, 1000 * 60 * 8)
    refresh()

    return () => {
      isActive = false
      sub.remove()
      clearInterval(id)
    }
  }, [user])

  return (
    <UserContext.Provider
      value={{
        user,
        authChecked,
        login,
        register,
        logout,
        resendVerification,
        verifyEmail,
        loginAsGuest,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
