// app/_layout.tsx
import { Redirect, Tabs, useRouter } from 'expo-router'
import { View, Image, StyleSheet, StatusBar, Text, Pressable } from 'react-native'
import Logo from '../../assets/image/logoBig.png'
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import UserOnly from '../../components/auth/UserOnly'
import { useUser } from '../../hooks/useUser'
import IconButtonWithHaptic from '../../components/IconButtonWithHaptic'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function AppLayout() {
  const { user, logout } = useUser()
  console.log({ user })
  const handleLogout = () => {
    console.log('logout')
    // logout()
  }
  return (
    // <UserOnly>

    <>
      <StatusBar barStyle="light-content" />
      {/* 整體畫面結構（包含上方 Logo Header） */}
      <View>
        {/* Logo Header */}
        <View style={styles.header}>
          <Image source={Logo} style={styles.logo} />
          <View style={styles.headerIcon}>
            <IconButtonWithHaptic
              onPress={handleLogout}
              children={<MaterialCommunityIcons name="bell-ring-outline" size={30} color="white" />}
              singleContent={true}
            />

            <IconButtonWithHaptic
              onPress={handleLogout}
              children={<MaterialIcons name="logout" size={30} color="white" />}
              singleContent={true}
            />
          </View>
        </View>
      </View>

      {/* Tabs Navigation 下包 Stack */}
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="learning"
          options={{
            title: 'Learning',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="abugida-thai" size={24} color={color} />
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
        <Tabs.Screen
          name="traveling"
          options={{
            title: 'Traveling',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="travel-explore" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>

    // </UserOnly>
  )
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgb(107, 55, 137)',
    paddingTop: 40,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    flexDirection: 'row',
    gap: 14,
  },
  logo: {
    width: 200,
    height: 80,
  },
})
