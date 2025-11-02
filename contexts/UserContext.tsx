import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { account } from '../lib/appwrite'
import { router } from 'expo-router'
import { Platform } from 'react-native'

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

  // Check current authentication status
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await account.get()

      // Check if this is a guest session
      const isGuestSession =
        Platform.OS === 'web'
          ? typeof window !== 'undefined' && localStorage.getItem('muaylang_guest_mode') === 'true'
          : false // For native, we'll need AsyncStorage later

      if (isGuestSession) {
        setUser({ ...currentUser, isGuest: true } as any)
      } else {
        setUser(currentUser as any)
      }
    } catch (_error) {
      setUser(null)
    } finally {
      setAuthChecked(true)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // Clear guest mode flag when doing normal login
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem('muaylang_guest_mode')
      }

      await account.createEmailPasswordSession(email, password)
      const currentUser = await account.get()
      setUser(currentUser as any)
      router.replace('/(tabs)/' as any)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      // Clear guest mode flag when registering
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem('muaylang_guest_mode')
      }

      // Create account
      await account.create('unique()', email, password)
      // Auto login
      await account.createEmailPasswordSession(email, password)
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
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Clear guest mode flag on logout
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem('muaylang_guest_mode')
      }

      await account.deleteSession('current')
      setUser(null)
      router.replace('/(auth)/' as any)
    } catch (error) {
      console.error('Logout error:', error)
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
      // Auto-login to demo account (read-only)
      // Using sukiho47@gmail.com credentials
      await account.createEmailPasswordSession('sukiho47@gmail.com', 'sukiho471234567')
      const currentUser = await account.get()

      // Mark this session as guest mode
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem('muaylang_guest_mode', 'true')
      }

      setUser({ ...currentUser, isGuest: true } as any)
      setAuthChecked(true)
      router.replace('/(tabs)/' as any)
      console.log('👤 Logged in as guest - viewing demo content')
    } catch (error) {
      console.error('❌ Guest login failed:', error)

      // Mark this session as guest mode (even in fallback)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem('muaylang_guest_mode', 'true')
      }

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
