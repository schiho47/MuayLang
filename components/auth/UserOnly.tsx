import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useUser } from '../../hooks/useUser'
import { MUAY_PURPLE } from '@/constants/Colors'

const UserOnly = ({ children }: { children: React.ReactNode }) => {
  const { user, authChecked } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const redirectingRef = useRef(false)

  useEffect(() => {
    const isAuthPage =
      pathname === '/' ||
      pathname === '/login' ||
      pathname === '/register' ||
      (pathname ? pathname.includes('/(auth)') : false)

    if (authChecked && user === null && !isAuthPage && !redirectingRef.current) {
      redirectingRef.current = true
      router.replace('/(auth)/' as any)
    }
    if (!authChecked || user !== null || isAuthPage) {
      redirectingRef.current = false
    }
  }, [user, authChecked, pathname, router])

  if (!authChecked || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={MUAY_PURPLE} />
      </View>
    )
  }

  return children
}

export default UserOnly
