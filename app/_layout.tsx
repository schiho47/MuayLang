import { config } from '@gluestack-ui/config'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import Head from 'expo-router/head'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import '../global.css'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { UserProvider } from '../contexts/UserContext'

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export const unstable_settings = {
  // 🔓 Dev mode: Go directly to main page
  initialRouteName: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <GluestackUIProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Head>
              <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
              <link rel="manifest" href="/manifest.json" />
            </Head>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="vocabulary/add" options={{ headerShown: false }} />
              <Stack.Screen name="vocabulary/edit/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="section/add" options={{ headerShown: false }} />
              <Stack.Screen name="section/edit/[id]" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </UserProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  )
}
