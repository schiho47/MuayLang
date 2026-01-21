import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import FirstScreenImage from '@/assets/images/firstScreen.png'
import GuestOnly from '@/components/auth/GuestOnly'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { useUser } from '@/hooks/useUser'

const WelcomePage = () => {
  const router = useRouter()
  const { loginAsGuest, } = useUser()
  const [isLoading, setIsLoading] = useState(false)


  const handleGuestLogin = async () => {
    setIsLoading(true)
    try {
      // Login as guest - view demo account data
      await loginAsGuest()
    } catch (error) {
      console.error('Guest login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GuestOnly>
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: MUAY_PURPLE }}
      >
        <Image
          source={FirstScreenImage}
          className="w-full h-[400px] mb-[60px]"
          resizeMode="contain"
        />
        <Text className="text-center text-white text-base font-bold mb-4">v.20260122 01:36</Text>
        {/* Main buttons: Register and Login */}
        <View className="flex-row justify-between gap-5 w-full px-6 mb-4">
          <Pressable
            onPress={() => router.replace('/register')}
            className="bg-white py-3.5 px-6 rounded-lg flex-1 items-center"
          >
            <Text className="text-base font-bold" style={{ color: MUAY_PURPLE }}>
              REGISTER
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/login')}
            className="py-3.5 px-6 rounded-lg flex-1 items-center"
            style={{ backgroundColor: 'rgb(218, 167, 48)' }}
          >
            <Text className="text-white text-base font-bold">LOGIN</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="flex-row items-center w-full px-6 my-4">
          <View className="flex-1 h-[1px] bg-white/30" />
          <Text className="mx-4 text-white/70 text-sm">OR</Text>
          <View className="flex-1 h-[1px] bg-white/30" />
        </View>

        {/* Guest Login Button */}
        <Pressable
          onPress={handleGuestLogin}
          disabled={isLoading}
          className="flex-row items-center justify-center gap-2 py-3 px-6 rounded-lg border-2 border-white/50"
          style={[{ width: '100%', maxWidth: 400 }, isLoading && { opacity: 0.6 }]}
        >
          {isLoading ? (
            <ActivityIndicator color={MUAY_WHITE} />
          ) : (
            <>
              <Ionicons name="person-outline" size={20} color={MUAY_WHITE} />
              <Text className="text-white text-base font-semibold">Continue as Guest</Text>
            </>
          )}
        </Pressable>

        <Text className="text-white/60 text-xs mt-3 text-center px-6">
          Guest mode: View-only access to demo content
        </Text>
      </View>
    </GuestOnly>
  )
}

export default WelcomePage
