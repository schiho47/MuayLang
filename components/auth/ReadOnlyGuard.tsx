import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '@/hooks/useUser'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

/**
 * ReadOnlyGuard - Prevents guests from accessing edit/add pages
 * Redirects to home if user is guest
 */
const ReadOnlyGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user?.isGuest) {
      console.log('⚠️ Guest users cannot access this page - redirecting to home')
      router.replace('/(tabs)/')
    }
  }, [user, router])

  if (user?.isGuest) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: MUAY_PURPLE,
        }}
      >
        <Ionicons name="lock-closed" size={64} color={MUAY_WHITE} />
        <Text
          style={{
            color: MUAY_WHITE,
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Read-Only Access
        </Text>
        <Text
          style={{
            color: MUAY_WHITE,
            fontSize: 14,
            marginTop: 8,
            textAlign: 'center',
            opacity: 0.8,
          }}
        >
          Guest users can only view content
        </Text>
       
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/')}
          style={{
            marginTop: 24,
            backgroundColor: MUAY_WHITE,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: MUAY_PURPLE, fontWeight: 'bold' }}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return children
}

export default ReadOnlyGuard
