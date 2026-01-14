import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { account, initializeJWT, setJWTToken, clearJWTToken } from '../lib/appwrite'
import { router } from 'expo-router'
import { Platform } from 'react-native'
import { jwtStorage, guestStorage } from '../utils/jwtStorage'

type User = {
  $id: string
  email: string
  name: string
  emailVerification: boolean
  isGuest?: boolean // Flag to indicate guest user
} | null

type UserContextType = {
  user: User
  authChecked: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resendVerification: () => Promise<void>
  verifyEmail: (userId: string, secret: string) => Promise<void>
  loginAsGuest: () => Promise<void> // Guest login function (async)
}

// 🔐 Demo User ID - Must be set via environment variable
// Without it, guest mode will display empty data
const DEMO_USER_ID = process.env.EXPO_PUBLIC_DEMO_USER_ID || null

export const UserContext = createContext<UserContextType | undefined>(undefined)

type UserProviderProps = {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Define logout function first to avoid "Cannot access before initialization" error
  const logout = useCallback(async () => {
    try {
      // Clear guest mode flag on logout
      await guestStorage.clearGuestMode()
      
      // Clear JWT token
      await jwtStorage.removeToken()
      clearJWTToken()
      
      // Delete session
      try {
        await account.deleteSession('current')
      } catch (sessionError) {
        // Session might already be deleted, ignore error
        console.log('Session deletion skipped:', sessionError)
      }
      
      setUser(null)
      router.replace('/(auth)/' as any)
      console.log('✅ Logout successful, JWT token cleared')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear tokens even if logout fails
      await jwtStorage.removeToken()
      clearJWTToken()
      setUser(null)
      throw error
    }
  }, [])

  const checkAuth = async () => {
    try {
      // Initialize JWT token from storage
      const hasValidToken = await initializeJWT()
      
      if (!hasValidToken) {
        setUser(null)
        setAuthChecked(true)
        return
      }

      // Get current user using JWT token
      const currentUser = await account.get()

      // Check if this is a guest session
      const isGuestSession = await guestStorage.isGuestMode()

      if (isGuestSession) {
        setUser({ ...currentUser, isGuest: true } as any)
      } else {
        setUser(currentUser as any)
      }
    } catch (_error) {
      // If JWT is invalid, clear it
      await jwtStorage.removeToken()
      clearJWTToken()
      setUser(null)
    } finally {
      setAuthChecked(true)
    }
  }

  // Check current authentication status
  useEffect(() => {
    checkAuth()
  }, [])

  // Set up token refresh interval (check every 5 minutes)
  useEffect(() => {
    if (!user || user.isGuest) return

    const refreshInterval = setInterval(async () => {
      try {
        const isExpired = await jwtStorage.isTokenExpired()
        if (isExpired) {
          console.log('🔄 JWT token expired, refreshing...')
          // Create new JWT token
          const jwtResponse = await account.createJWT()
          const jwtToken = jwtResponse.jwt
          const expiry = Date.now() + 3600 * 1000
          await jwtStorage.saveToken(jwtToken, expiry)
          setJWTToken(jwtToken)
          console.log('✅ JWT token refreshed')
        }
      } catch (error) {
        console.error('❌ Failed to refresh JWT token:', error)
        // If refresh fails, logout user
        await logout()
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [user, logout])

  const login = async (email: string, password: string) => {
    try {
      // Clear guest mode flag when doing normal login
      await guestStorage.clearGuestMode()

      // Delete existing session if any (to avoid "session is active" error)
      try {
        await account.deleteSession('current')
      } catch (sessionError) {
        // Session might not exist, ignore error
        console.log('No existing session to delete:', sessionError)
      }

      // Create session first (required for JWT generation)
      await account.createEmailPasswordSession(email, password)
      
      // Get JWT token (valid for 1 hour by default)
      const jwtResponse = await account.createJWT()
      const jwtToken = jwtResponse.jwt
      
      // Calculate expiry (JWT is valid for 1 hour = 3600 seconds)
      const expiry = Date.now() + 3600 * 1000
      
      // Store JWT token
      await jwtStorage.saveToken(jwtToken, expiry)
      
      // Set JWT token in client
      setJWTToken(jwtToken)
      
      // Get current user
      const currentUser = await account.get()
      setUser(currentUser as any)
      
      router.replace('/(tabs)/' as any)
      console.log('✅ Login successful, JWT token stored')
    } catch (error) {
      console.error('Login error:', error)
      await jwtStorage.removeToken()
      clearJWTToken()
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      // Clear guest mode flag when registering
      await guestStorage.clearGuestMode()

      // Delete existing session if any (to avoid "session is active" error)
      try {
        await account.deleteSession('current')
      } catch (sessionError) {
        // Session might not exist, ignore error
        console.log('No existing session to delete:', sessionError)
      }

      // Create account
      await account.create('unique()', email, password)
      // Auto login
      await account.createEmailPasswordSession(email, password)
      
      // Get JWT token
      const jwtResponse = await account.createJWT()
      const jwtToken = jwtResponse.jwt
      
      // Calculate expiry (JWT is valid for 1 hour = 3600 seconds)
      const expiry = Date.now() + 3600 * 1000
      
      // Store JWT token
      await jwtStorage.saveToken(jwtToken, expiry)
      
      // Set JWT token in client
      setJWTToken(jwtToken)
      
      const currentUser = await account.get()
      setUser(currentUser as any)

      // Send verification email
      try {
        // Appwrite sends verification email to user's email
        // Configure redirect URL for successful verification
        const verificationUrl =
          Platform.OS === 'web'
            ? `${typeof window !== 'undefined' ? window.location.origin : 'https://muaylang.vercel.app'}/verify`
            : 'exp://localhost:8081'

        await account.createVerification(verificationUrl)
        console.log('✅ Verification email sent')
      } catch (verifyError) {
        console.error('❌ Failed to send verification email:', verifyError)
        // Don't block registration flow, just log the error
      }

      router.replace('/(tabs)/' as any)
      console.log('✅ Registration successful, JWT token stored')
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
          ? `${typeof window !== 'undefined' ? window.location.origin : 'https://muaylang.vercel.app'}/verify`
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
      // Refresh user info to update verification status
      const currentUser = await account.get()
      setUser(currentUser as any)
      console.log('✅ Email verified successfully')
    } catch (error) {
      console.error('❌ Email verification failed:', error)
      throw error
    }
  }

  // 🎭 Guest login - automatically login to demo account
  const loginAsGuest = async () => {
    try {
      // Delete existing session if any (to avoid "session is active" error)
      try {
        await account.deleteSession('current')
      } catch (sessionError) {
        // Session might not exist, ignore error
        console.log('No existing session to delete:', sessionError)
      }

      // Auto-login to demo account (read-only)
      // Using sukiho47@gmail.com credentials
      await account.createEmailPasswordSession('sukiho47@gmail.com', 'sukiho471234567')
      
      // Get JWT token for guest session
      const jwtResponse = await account.createJWT()
      const jwtToken = jwtResponse.jwt
      
      // Calculate expiry (JWT is valid for 1 hour = 3600 seconds)
      const expiry = Date.now() + 3600 * 1000
      
      // Store JWT token
      await jwtStorage.saveToken(jwtToken, expiry)
      
      // Set JWT token in client
      setJWTToken(jwtToken)
      
      // Mark this session as guest mode
      await guestStorage.setGuestMode(true)
      
      const currentUser = await account.get()
      setUser({ ...currentUser, isGuest: true } as any)
      setAuthChecked(true)
      router.replace('/(tabs)/' as any)
      console.log('👤 Logged in as guest - viewing demo content with JWT')
    } catch (error) {
      console.error('❌ Guest login failed:', error)

      // Mark this session as guest mode (even in fallback)
      await guestStorage.setGuestMode(true)

      // Fallback: create fake user (won't be able to fetch data)
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
      console.log('👤 Logged in as guest (fallback) - may not see data')
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
