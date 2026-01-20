import { Tabs } from 'expo-router'
import React from 'react'

import { HapticTab } from '@/components/haptic-tab'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import UserOnly from '../../components/auth/UserOnly'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()

  return (
    <UserOnly>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            paddingBottom: Math.max(insets.bottom, 8),
            height: 56 + Math.max(insets.bottom, 8),
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name="home" />,
          }}
        />
        <Tabs.Screen
          name="learning"
          options={{
            title: 'Learning',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons size={28} name="abugida-thai" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="training"
          options={{
            title: 'Training',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="boxing-glove" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </UserOnly>
  )
}
