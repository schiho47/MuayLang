import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { account } from '../lib/appwrite'
import { router } from 'expo-router'
import { Platform } from 'react-native'

type User = {
  $id: string
  email: string
  name: string
  emailVerification: boolean
} | null

type UserContextType = {
  user: User
  authChecked: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resendVerification: () => Promise<void>
  verifyEmail: (userId: string, secret: string) => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

type UserProviderProps = {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // 檢查當前登入狀態
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await account.get()
      setUser(currentUser as any)
    } catch (error) {
      setUser(null)
    } finally {
      setAuthChecked(true)
    }
  }

  const login = async (email: string, password: string) => {
    try {
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
      // 建立帳戶
      await account.create('unique()', email, password)
      // 自動登入
      await account.createEmailPasswordSession(email, password)
      const currentUser = await account.get()
      setUser(currentUser as any)

      // 發送驗證郵件
      try {
        // Appwrite 的驗證郵件會發送到用戶的 email
        // 需要配置驗證成功後的重定向 URL
        const verificationUrl =
          Platform.OS === 'web'
            ? `${typeof window !== 'undefined' ? window.location.origin : 'https://muaylang.vercel.app'}/verify`
            : 'exp://localhost:8081'

        await account.createVerification(verificationUrl)
        console.log('✅ Verification email sent')
      } catch (verifyError) {
        console.error('❌ Failed to send verification email:', verifyError)
        // 不阻止註冊流程，只是記錄錯誤
      }

      router.replace('/(tabs)/' as any)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
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
      // 重新獲取用戶信息以更新驗證狀態
      const currentUser = await account.get()
      setUser(currentUser as any)
      console.log('✅ Email verified successfully')
    } catch (error) {
      console.error('❌ Email verification failed:', error)
      throw error
    }
  }

  return (
    <UserContext.Provider
      value={{ user, authChecked, login, register, logout, resendVerification, verifyEmail }}
    >
      {children}
    </UserContext.Provider>
  )
}
