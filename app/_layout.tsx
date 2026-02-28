import React from 'react'
import { config } from '@gluestack-ui/config'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import Head from 'expo-router/head'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import '../global.css'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { forceLogout } from '@/lib/authUtils'
import { UserProvider } from '../contexts/UserContext'

export const unstable_settings = {
  // 🔓 Dev mode: Go directly to main page
  initialRouteName: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const router = useRouter()

  const queryClient = React.useMemo(() => {
    const handleAuthError = async (error: unknown) => {
      const errorCode = (error as any)?.code ?? (error as any)?.response?.status
      if (errorCode === 401) {
        await forceLogout()
        router.replace('/(auth)')
      }
    }

    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          retry: 1,
        },
      },
      queryCache: new QueryCache({
        onError: (error) => {
          void handleAuthError(error)
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          void handleAuthError(error)
        },
      }),
    })
  }, [router])

  return (
    <GluestackUIProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Head>
              <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
              <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
              <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
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
              <Stack.Screen name="vocabulary/review" options={{ headerShown: false }} />
              <Stack.Screen name="vocabulary/myVocabularyReview" options={{ headerShown: false }} />
              <Stack.Screen name="vocabulary/dailyReview" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </UserProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  )
}
