import AsyncStorage from '@react-native-async-storage/async-storage'

const USER_SESSION_KEY = 'user_session'

export const saveUserSession = async (data: any) => {
  await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(data))
}

export const clearUserSession = async () => {
  await AsyncStorage.removeItem(USER_SESSION_KEY)
}
