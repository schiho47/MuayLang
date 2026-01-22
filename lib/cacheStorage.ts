import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const getWebStorage = () => {
  if (Platform.OS !== 'web') return null
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const getCacheItem = async <T>(key: string): Promise<T | null> => {
  try {
    const webStorage = getWebStorage()
    const raw = webStorage ? webStorage.getItem(key) : await AsyncStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('Failed to read cache:', key, error)
    return null
  }
}

export const setCacheItem = async (key: string, value: unknown) => {
  try {
    const raw = JSON.stringify(value)
    const webStorage = getWebStorage()
    if (webStorage) {
      webStorage.setItem(key, raw)
      return
    }
    await AsyncStorage.setItem(key, raw)
  } catch (error) {
    console.warn('Failed to write cache:', key, error)
  }
}

export const removeCacheItem = async (key: string) => {
  try {
    const webStorage = getWebStorage()
    if (webStorage) {
      webStorage.removeItem(key)
      return
    }
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear cache:', key, error)
  }
}
