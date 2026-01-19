import { Pressable, Text, View } from 'react-native'
import React from 'react'
import GuestOnly from './GuestOnly'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { MUAY_PURPLE } from '@/constants/Colors'

const FirstScreenImage = require('@/assets/images/firstScreen.png')

const GuestOnlyPage = () => {
  return (
    <GuestOnly>
      <View
        className="flex-1 justify-center items-center p-6"
        style={{ backgroundColor: MUAY_PURPLE }}
      >
        <Image
          source={FirstScreenImage}
          className="w-full h-[400px] mb-[60px]"
          resizeMode="contain"
        />
        <Text className="text-center text-white text-base font-bold mb-4">v.20260120 01:13</Text>
        <View className="flex-row justify-between gap-5 w-full px-6">
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
      </View>
    </GuestOnly>
  )
}

export default GuestOnlyPage
