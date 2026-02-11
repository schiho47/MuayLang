import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { account, clearJWTToken } from '../lib/appwrite'
import { router } from 'expo-router'
import { Platform } from 'react-native'
import { jwtStorage, guestStorage } from '../utils/jwtStorage'
import { clearUserSession, saveUserSession } from '../lib/storage'

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

  const logout = useCallback(async () => {
    try {
      await guestStorage.clearGuestMode()

      try {
        await account.deleteSession('current')
      } catch (sessionError) {
        console.log('Session deletion skipped:', sessionError)
      }

      console.log('✅ Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      await jwtStorage.removeToken()
      clearJWTToken()
      await clearUserSession()
      setUser(null)
      setAuthChecked(true)
      router.replace('/(auth)/' as any)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const isGuestSession = await guestStorage.isGuestMode()
      // Session-based auth only: if we can fetch account, we're logged in.
      // If not, fall back to guest mode only when guest flag is set.
      try {
        const currentUser = await account.get()
        await saveUserSession(currentUser)
        await guestStorage.clearGuestMode()
        setUser(currentUser as any)
        return
      } catch {
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
          return
        }
        setUser(null)
        return
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      await jwtStorage.removeToken()
      clearJWTToken()
      setUser(null)
    } finally {
      setAuthChecked(true)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // JWT refresh now happens on-demand when API returns 401

  const login = async (email: string, password: string) => {
    try {
      await guestStorage.clearGuestMode()

      try {
        await account.deleteSession('current')
        await jwtStorage.removeToken()
        clearJWTToken()
      } catch {}

      await account.createEmailPasswordSession(email, password)

      const currentUser = await account.get()
      await saveUserSession(currentUser)
      setUser(currentUser as any)

      router.replace('/(tabs)/' as any)
      console.log('✅ Login successful')
    } catch (error) {
      console.error('Login error:', error)
      await jwtStorage.removeToken()
      clearJWTToken()
      await clearUserSession()
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      await guestStorage.clearGuestMode()

      try {
        await account.deleteSession('current')
      } catch {}

      await account.create('unique()', email, password)
      await account.createEmailPasswordSession(email, password)

      const currentUser = await account.get()
      await saveUserSession(currentUser)
      setUser(currentUser as any)

      router.replace('/(tabs)/' as any)
      console.log('✅ Registration successful')
    } catch (error) {
      console.error('Register error:', error)
      await jwtStorage.removeToken()
      clearJWTToken()
      await clearUserSession()
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
      try {
        await account.deleteSession('current')
      } catch {}
      await jwtStorage.removeToken()
      clearJWTToken()
      await clearUserSession()
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
      await clearUserSession()
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
