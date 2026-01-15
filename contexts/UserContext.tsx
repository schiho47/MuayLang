import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { account, initializeJWT, setJWTToken, clearJWTToken, AUTH_API_BASE } from '../lib/appwrite'
import { router } from 'expo-router'
import { Platform } from 'react-native'
import { jwtStorage, guestStorage } from '../utils/jwtStorage'

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

const DEMO_USER_ID = process.env.EXPO_PUBLIC_DEMO_USER_ID || null

export const UserContext = createContext<UserContextType | undefined>(undefined)

type UserProviderProps = {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const isWeb = Platform.OS === 'web'

  const apiFetch = async (path: string, init?: RequestInit) => {
    const r = await fetch(`${AUTH_API_BASE}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    })

    if (!r.ok) {
      const text = await r.text().catch(() => '')
      throw new Error(`API ${path} failed (${r.status}): ${text}`)
    }

    return r
  }

  const logout = useCallback(async () => {
    try {
      await guestStorage.clearGuestMode()

      await jwtStorage.removeToken()
      clearJWTToken()

      if (isWeb) {
        try {
          await apiFetch('/auth/logout', { method: 'POST' })
        } catch (e) {
          console.log('Web logout: server cleanup skipped:', e)
        }

        setUser(null)
        router.replace('/(auth)/' as any)
        console.log('✅ Web logout successful')
        return
      }

      // Native logout
      try {
        await account.deleteSession('current')
      } catch (sessionError) {
        console.log('Session deletion skipped:', sessionError)
      }

      setUser(null)
      router.replace('/(auth)/' as any)
      console.log('✅ Native logout successful')
    } catch (error) {
      console.error('Logout error:', error)
      await jwtStorage.removeToken()
      clearJWTToken()
      setUser(null)
      throw error
    }
  }, [isWeb])

  const checkAuth = async () => {
    try {
      const isGuestSession = await guestStorage.isGuestMode()
      if (isGuestSession) {
        await jwtStorage.removeToken()
        clearJWTToken()
        const guestUser: User = {
          $id: DEMO_USER_ID || 'guest-public',
          email: 'guest@muaylang.app',
          name: 'Guest User',
          emailVerification: false,
          isGuest: true,
        }
        setUser(guestUser)
        setAuthChecked(true)
        return
      }

      const hasValidToken = await initializeJWT()
      if (!hasValidToken) {
        setUser(null)
        setAuthChecked(true)
        return
      }

      if (isWeb) {
        // ✅ Web：用 Node 取 user（避免直接打 Appwrite）
        try {
          const r = await apiFetch('/auth/me', { method: 'GET' })
          const data = await r.json()
          if (data?.ok && data?.user) setUser(data.user as any)
          else setUser(null)
        } catch (_e) {
          setUser(null)
        } finally {
          setAuthChecked(true)
        }
        return
      }

      // Native: can call Appwrite directly
      const currentUser = await account.get()
      setUser(currentUser as any)
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      await jwtStorage.removeToken()
      clearJWTToken()
      setUser(null)
    } finally {
      setAuthChecked(true)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!user || user.isGuest) return

    const refreshInterval = setInterval(
      async () => {
        try {
          const isExpired = await jwtStorage.isTokenExpired()
          if (!isExpired) return

          console.log('🔄 JWT token expired, refreshing...')

          if (isWeb) {
            // ✅ Web：重新走 /auth/me（或之後加 /auth/refresh）
            const r = await apiFetch('/auth/me', { method: 'GET' })
            const data = await r.json()
            if (!data?.ok) throw new Error('Web refresh failed')
            // 這裡不刷新 jwt 也行（因為你資料拿 Appwrite 是靠 jwt）
            // 想刷新 jwt：你可以之後加 /auth/refresh 回 jwt
            console.log('✅ Web session still valid')
            return
          }

          // Native：用 Appwrite JWT
          const jwtResponse = await account.createJWT()
          const jwtToken = jwtResponse.jwt
          const expiry = Date.now() + 3600 * 1000
          await jwtStorage.saveToken(jwtToken, expiry)
          setJWTToken(jwtToken)
          console.log('✅ JWT token refreshed')
        } catch (error) {
          console.error('❌ Failed to refresh JWT token:', error)
          await logout()
        }
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(refreshInterval)
  }, [user, logout, isWeb])

  const login = async (email: string, password: string) => {
    try {
      await guestStorage.clearGuestMode()

      if (isWeb) {
        const r = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })

        const { jwt, expiry, user: userFromServer } = await r.json()

        await jwtStorage.saveToken(jwt, expiry)
        setJWTToken(jwt)
        setUser(userFromServer as any)

        router.replace('/(tabs)/' as any)
        console.log('✅ Web login via Node successful, JWT stored')
        return
      }

      // Native login (keep your original)
      try {
        await account.deleteSession('current')
      } catch {}

      await account.createEmailPasswordSession(email, password)

      const jwtResponse = await account.createJWT()
      const jwtToken = jwtResponse.jwt
      const expiry = Date.now() + 3600 * 1000

      await jwtStorage.saveToken(jwtToken, expiry)
      setJWTToken(jwtToken)

      const currentUser = await account.get()
      setUser(currentUser as any)

      router.replace('/(tabs)/' as any)
      console.log('✅ Native login successful, JWT token stored')
    } catch (error) {
      console.error('Login error:', error)
      await jwtStorage.removeToken()
      clearJWTToken()
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      await guestStorage.clearGuestMode()

      if (isWeb) {
        const r = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })

        const { jwt, expiry, user: userFromServer } = await r.json()

        await jwtStorage.saveToken(jwt, expiry)
        setJWTToken(jwt)
        setUser(userFromServer as any)

        router.replace('/(tabs)/' as any)
        console.log('✅ Web register via Node successful, JWT stored')
        return
      }

      // Native register (keep your original)
      try {
        await account.deleteSession('current')
      } catch {}

      await account.create('unique()', email, password)
      await account.createEmailPasswordSession(email, password)

      const jwtResponse = await account.createJWT()
      const jwtToken = jwtResponse.jwt
      const expiry = Date.now() + 3600 * 1000

      await jwtStorage.saveToken(jwtToken, expiry)
      setJWTToken(jwtToken)

      const currentUser = await account.get()
      setUser(currentUser as any)

      router.replace('/(tabs)/' as any)
      console.log('✅ Native registration successful, JWT token stored')
    } catch (error) {
      console.error('Register error:', error)
      await jwtStorage.removeToken()
      clearJWTToken()
      throw error
    }
  }

  const resendVerification = async () => {
    try {
      const verificationUrl =
        Platform.OS === 'web'
          ? `${typeof window !== 'undefined' ? window.location.origin : 'https://muaylang.app'}/verify`
          : 'exp://localhost:8081'

      await account.createVerification(verificationUrl)
      console.log('✅ Verification email resent')
    } catch (error) {
      console.error('❌ Failed to resend verification email:', error)
      throw error
    }
  }

  const verifyEmail = async (userId: string, secret: string) => {
    try {
      await account.updateVerification(userId, secret)
      const currentUser = await account.get()
      setUser(currentUser as any)
      console.log('✅ Email verified successfully')
    } catch (error) {
      console.error('❌ Email verification failed:', error)
      throw error
    }
  }

  const loginAsGuest = async () => {
    try {
      if (isWeb) {
        // Web guest: no Appwrite session, no jwt
        await jwtStorage.removeToken()
        clearJWTToken()
        await guestStorage.setGuestMode(true)

        const guestUser: User = {
          $id: DEMO_USER_ID || 'guest-public',
          email: 'guest@muaylang.app',
          name: 'Guest User',
          emailVerification: false,
          isGuest: true,
        }
        setUser(guestUser)
        setAuthChecked(true)
        router.replace('/(tabs)/' as any)
        return
      }

      // Native guest: keep your original public guest mode
      try {
        await account.deleteSession('current')
      } catch {}
      await jwtStorage.removeToken()
      clearJWTToken()

      await guestStorage.setGuestMode(true)

      const guestUser: User = {
        $id: DEMO_USER_ID || 'guest-public',
        email: 'guest@muaylang.app',
        name: 'Guest User',
        emailVerification: false,
        isGuest: true,
      }
      setUser(guestUser)
      setAuthChecked(true)
      router.replace('/(tabs)/' as any)
    } catch (error) {
      console.error('❌ Guest login failed:', error)
      await guestStorage.setGuestMode(true)
      const guestUser: User = {
        $id: DEMO_USER_ID || 'guest-no-data',
        email: 'guest@muaylang.app',
        name: 'Guest User',
        emailVerification: false,
        isGuest: true,
      }
      setUser(guestUser)
      setAuthChecked(true)
      router.replace('/(tabs)/' as any)
    }
  }

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
