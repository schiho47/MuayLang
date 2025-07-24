import { createContext, useEffect, useState } from 'react'
import { account } from '../lib/appwrite'
import { ID } from 'react-native-appwrite'
import { useRouter } from 'expo-router'

export const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  console.log({ user })
  async function login(email: string, password: string) {
    try {
      await account.createEmailPasswordSession(email, password)
      const response = await account.get()
      console.log({ response })
      setUser(response)
      router.replace('/(dashboard)/')
    } catch (error) {
      throw Error(error.message)
    }
  }

  async function register(email: string, password: string) {
    try {
      await account.create(ID.unique(), email, password)
      await login(email, password)
    } catch (error) {
      throw Error(error.message)
    }
  }

  async function logout() {
    await account.deleteSession('current')
    setUser(null)
  }

  async function getInitialUserValue() {
    try {
      const response = await account.get()
      setUser(response)
    } catch (error) {
      setUser(null)
    } finally {
      setAuthChecked(true)
    }
  }

  useEffect(() => {
    getInitialUserValue()
  }, [])
  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        authChecked,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
