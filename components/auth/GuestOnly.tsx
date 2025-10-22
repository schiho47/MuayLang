import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useUser } from '../../hooks/useUser'
import { MUAY_PURPLE } from '@/constants/Colors'

const GuestOnly = ({ children }: { children: React.ReactNode }) => {
  const { user, authChecked } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (authChecked && user !== null) {
      router.replace('/(tabs)/' as any)
    }
  }, [user, authChecked, router])

  if (!authChecked || user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={MUAY_PURPLE} />
      </View>
    )
  }

  return children
}

export default GuestOnly
